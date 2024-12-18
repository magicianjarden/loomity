'use client';

import React, { Suspense } from 'react';
import { PluginProvider } from '@/contexts/PluginContext';
import { PluginLoading, PluginLoadingFallback, PluginErrorBoundary } from '@/components/plugins/plugin-loading';
import { ErrorBoundary } from '@/components/plugins/plugin-error-boundary';

interface PluginProviderWrapperProps {
  children: React.ReactNode;
}

export function PluginProviderWrapper({ children }: PluginProviderWrapperProps) {
  return (
    <ErrorBoundary fallback={PluginErrorBoundary}>
      <Suspense fallback={<PluginLoadingFallback />}>
        <PluginProvider>
          {children}
        </PluginProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

// HOC to wrap components that need plugin functionality
export function withPlugins<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithPluginsComponent(props: P) {
    return (
      <PluginProviderWrapper>
        <WrappedComponent {...props} />
      </PluginProviderWrapper>
    );
  };
}
