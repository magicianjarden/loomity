'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkAdminStatus(user.id);
    } else {
      console.log('No authenticated user found');
      setIsAdmin(false);
    }
  }, [user]);

  const checkAdminStatus = async (userId: string) => {
    console.log('Checking admin status for user:', userId);
    console.log('Expected admin UID:', 'e3b5ab0d-2304-4f50-b8f4-0816beb0309f');
    console.log('UIDs match:', userId === 'e3b5ab0d-2304-4f50-b8f4-0816beb0309f');

    try {
      // First try to get all admins to debug
      const { data: allAdmins, error: listError } = await supabase
        .from('admins')
        .select('*');
      
      console.log('All admins:', allAdmins);
      
      if (listError) {
        console.error('Error listing admins:', listError);
      }

      // Now check if this user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (adminError) {
        console.error('Error checking admin status:', adminError);
        console.log('Full error:', adminError);
        setIsAdmin(false);
        return;
      }

      console.log('Admin data:', adminData);

      if (adminData) {
        console.log('User is admin');
        setIsAdmin(true);
      } else {
        console.log('User is not admin');
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setIsAdmin(false);
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
    if (!isAdmin || !user) return;
    const { error } = await supabase
      .from('banned_users')
      .insert({
        user_id: userId,
        banned_by: user.id
      });

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
    throw new Error('useAdmin must be used inside AdminProvider');
  }
  return context;
};
