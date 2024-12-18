'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@tremor/react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/');
      }
    });
  }, [router]);

  const signInWithGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Loomity
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your developer dashboard
          </p>
        </div>
        <div className="mt-8">
          <Button
            className="w-full flex justify-center py-2 px-4"
            onClick={signInWithGitHub}
          >
            Sign in with GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
