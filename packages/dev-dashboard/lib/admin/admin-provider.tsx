'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface AdminContextType {
  isAdmin: boolean;
  deleteMarketplaceItem: (itemId: string) => Promise<void>;
  updateMarketplaceItem: (itemId: string, updates: any) => Promise<void>;
  banUser: (userId: string) => Promise<void>;
  unbanUser: (userId: string) => Promise<void>;
  setFeatured: (itemId: string, featured: boolean) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setIsAdmin(true);
    }
  };

  const deleteMarketplaceItem = async (itemId: string) => {
    if (!isAdmin) return;
    const { error } = await supabase
      .from('marketplace_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Item deleted successfully"
    });
  };

  const updateMarketplaceItem = async (itemId: string, updates: any) => {
    if (!isAdmin) return;
    const { error } = await supabase
      .from('marketplace_items')
      .update(updates)
      .eq('id', itemId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Item updated successfully"
    });
  };

  const banUser = async (userId: string) => {
    if (!isAdmin) return;
    const { error } = await supabase
      .from('banned_users')
      .insert([{ user_id: userId }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "User banned successfully"
    });
  };

  const unbanUser = async (userId: string) => {
    if (!isAdmin) return;
    const { error } = await supabase
      .from('banned_users')
      .delete()
      .eq('user_id', userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to unban user",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "User unbanned successfully"
    });
  };

  const setFeatured = async (itemId: string, featured: boolean) => {
    if (!isAdmin) return;
    const { error } = await supabase
      .from('marketplace_items')
      .update({ featured })
      .eq('id', itemId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: `Item ${featured ? 'featured' : 'unfeatured'} successfully`
    });
  };

  return (
    <AdminContext.Provider value={{
      isAdmin,
      deleteMarketplaceItem,
      updateMarketplaceItem,
      banUser,
      unbanUser,
      setFeatured
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
