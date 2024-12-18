'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { getPluginSystem, initializePluginSystem } from '../lib/plugins/plugin-init';
import { pluginEvents } from '../lib/plugins/plugin-events';

interface PluginContextType {
  installedPlugins: any[];
  loadingPlugins: boolean;
  updateAvailable: Map<string, boolean>;
  refreshPlugins: () => Promise<void>;
  installPlugin: (pluginId: string) => Promise<void>;
  uninstallPlugin: (pluginId: string) => Promise<void>;
  enablePlugin: (pluginId: string) => Promise<void>;
  disablePlugin: (pluginId: string) => Promise<void>;
  updatePlugin: (pluginId: string, version?: string) => Promise<void>;
}

const Context = createContext<PluginContextType | undefined>(undefined);

export function PluginProvider({ children }: { children: React.ReactNode }) {
  const [installedPlugins, setInstalledPlugins] = useState<any[]>([]);
  const [loadingPlugins, setLoadingPlugins] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState<Map<string, boolean>>(new Map());
  const [pluginInstances, setPluginInstances] = useState(() => initializePluginSystem());
  
  const supabase = useSupabaseClient();
  const user = useUser();

  // Initialize plugin system with Supabase client
  useEffect(() => {
    if (supabase && pluginInstances) {
      const { pluginSystem, versionManager, pluginLoader } = pluginInstances;
      pluginSystem.setSupabaseClient(supabase);
      versionManager.setSupabaseClient(supabase);
      pluginLoader.setSupabaseClient(supabase);
    }
  }, [supabase, pluginInstances]);

  const refreshPlugins = async () => {
    if (!user || !pluginInstances) return;
    
    try {
      setLoadingPlugins(true);
      const plugins = await pluginInstances.pluginSystem.getInstalledPlugins();
      setInstalledPlugins(plugins);

      // Check for updates
      const updates = await pluginInstances.pluginSystem.checkForUpdates();
      setUpdateAvailable(updates);
    } catch (error) {
      console.error('Failed to refresh plugins:', error);
    } finally {
      setLoadingPlugins(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshPlugins();
    }
  }, [user?.id]);

  const installPlugin = async (pluginId: string) => {
    if (!user || !pluginInstances) return;
    await pluginInstances.pluginSystem.installPlugin(pluginId);
    await refreshPlugins();
  };

  const uninstallPlugin = async (pluginId: string) => {
    if (!user || !pluginInstances) return;
    await pluginInstances.pluginSystem.uninstallPlugin(pluginId);
    await refreshPlugins();
  };

  const enablePlugin = async (pluginId: string) => {
    if (!user || !pluginInstances) return;
    await pluginInstances.pluginSystem.enablePlugin(pluginId);
    await refreshPlugins();
  };

  const disablePlugin = async (pluginId: string) => {
    if (!user || !pluginInstances) return;
    await pluginInstances.pluginSystem.disablePlugin(pluginId);
    await refreshPlugins();
  };

  const updatePlugin = async (pluginId: string, version?: string) => {
    if (!user || !pluginInstances) return;
    await pluginInstances.pluginSystem.updatePlugin(pluginId, version);
    await refreshPlugins();
  };

  return (
    <Context.Provider
      value={{
        installedPlugins,
        loadingPlugins,
        updateAvailable,
        refreshPlugins,
        installPlugin,
        uninstallPlugin,
        enablePlugin,
        disablePlugin,
        updatePlugin,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function usePlugin() {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('usePlugin must be used within a PluginProvider');
  }
  return context;
}
