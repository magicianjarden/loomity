import { useState, useEffect, useCallback } from 'react';
import { PluginSystem } from '../lib/plugins/plugin-system';
import { pluginEvents } from '../lib/plugins/plugin-events';

interface UsePluginOptions {
  autoLoad?: boolean;
  onError?: (error: Error) => void;
}

export function usePlugin(pluginId: string, options: UsePluginOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const pluginSystem = PluginSystem.getInstance();

  const loadPlugin = useCallback(async () => {
    try {
      setIsLoaded(false);
      setError(null);
      await pluginSystem.enablePlugin(pluginId);
      setIsLoaded(true);
      setIsEnabled(true);
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
    }
  }, [pluginId, options.onError]);

  const unloadPlugin = useCallback(async () => {
    try {
      setError(null);
      await pluginSystem.disablePlugin(pluginId);
      setIsLoaded(false);
      setIsEnabled(false);
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
    }
  }, [pluginId, options.onError]);

  const updatePlugin = useCallback(async (version?: string) => {
    try {
      setIsUpdating(true);
      setError(null);
      await pluginSystem.updatePlugin(pluginId, version);
      setUpdateAvailable(false);
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
    } finally {
      setIsUpdating(false);
    }
  }, [pluginId, options.onError]);

  useEffect(() => {
    if (options.autoLoad) {
      loadPlugin();
    }

    const handleUpdateAvailable = (id: string) => {
      if (id === pluginId) {
        setUpdateAvailable(true);
      }
    };

    const handleError = (id: string, err: Error) => {
      if (id === pluginId) {
        setError(err);
        options.onError?.(err);
      }
    };

    // Subscribe to plugin events
    pluginEvents.on(pluginId, 'plugin:updateAvailable', handleUpdateAvailable);
    pluginEvents.on(pluginId, 'plugin:error', handleError);

    return () => {
      // Cleanup event listeners
      pluginEvents.removeListener(pluginId, 'plugin:updateAvailable', handleUpdateAvailable);
      pluginEvents.removeListener(pluginId, 'plugin:error', handleError);
    };
  }, [pluginId, options.autoLoad, loadPlugin, options.onError]);

  return {
    isLoaded,
    isEnabled,
    isUpdating,
    error,
    updateAvailable,
    load: loadPlugin,
    unload: unloadPlugin,
    update: updatePlugin,
  };
}
