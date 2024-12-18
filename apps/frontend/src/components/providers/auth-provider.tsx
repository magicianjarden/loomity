'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/supabase-provider';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { supabase } = useSupabase();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Root layout - Auth state changed:', { event, session });
      
      if (event === 'SIGNED_IN') {
        router.refresh();
      }
      if (event === 'SIGNED_OUT') {
        router.refresh();
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return <>{children}</>;
}
