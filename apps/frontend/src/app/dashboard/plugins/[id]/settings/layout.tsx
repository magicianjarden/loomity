'use client';

import { PluginProvider } from '@/contexts/PluginContext';

export default function PluginSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PluginProvider>
      {children}
    </PluginProvider>
  );
}
