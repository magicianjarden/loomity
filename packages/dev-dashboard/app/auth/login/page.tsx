'use client';

import { useState } from 'react';
import { Card, Title, TextInput, Button } from "@tremor/react";
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      router.push('/');
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <Title>Developer Dashboard Login</Title>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <TextInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <TextInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </Card>
    </main>
  );
}
