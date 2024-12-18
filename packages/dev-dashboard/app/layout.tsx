import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../src/contexts/AuthContext';
import { AdminProvider } from '@/lib/admin/admin-provider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Loomity Developer Dashboard',
  description: 'Monitor and manage your Loomity plugins',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AdminProvider>
            {children}
            <Toaster />
          </AdminProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
