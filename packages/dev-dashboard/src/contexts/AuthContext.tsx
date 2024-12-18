'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session:', session);
      setUser(session?.user ?? null);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', { event: _event, session });
      setUser(session?.user ?? null);
      
      // Redirect based on auth state
      if (!session) {
        router.push('/login');
      } else if (window.location.pathname === '/login') {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      router.push('/login');
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
