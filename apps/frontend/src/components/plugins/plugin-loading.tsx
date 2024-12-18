'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface PluginLoadingProps {
  message?: string;
}

export function PluginLoading({ message = 'Loading plugin...' }: PluginLoadingProps) {
  return (
    <div className="flex items-center justify-center p-4 space-x-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function PluginLoadingFallback() {
  return <PluginLoading message="Loading plugin system..." />;
}

export function PluginErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4">
      <div className="text-destructive">
        <h2 className="text-lg font-semibold">Something went wrong!</h2>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
