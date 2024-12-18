'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
  isLoading: boolean;
  user: any | null;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => createClientComponentClient<Database>());
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error);
          setUser(null);
        } else {
          console.log('Current user:', currentUser);
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error in getUser:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', { event: _event, session });
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <Context.Provider value={{ supabase, isLoading, user }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }
  return context;
};
