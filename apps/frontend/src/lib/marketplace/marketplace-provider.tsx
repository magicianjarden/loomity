import React, { createContext, useContext, useEffect, useState } from 'react';
import { marketplaceSDK } from './marketplace-sdk';
import { themeSystem } from './theme-system';
import { LoomityPluginManager } from '../plugin-sdk/plugin-manager';
import type { MarketplaceItem, ThemeVariables } from './types';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Editor } from '@tiptap/core';

interface MarketplaceContextType {
  // Plugin-related state
  installedPlugins: MarketplaceItem[];
  activePlugins: MarketplaceItem[];
  isPluginLoading: boolean;
  pluginError: Error | null;
  
  // Theme-related state
  currentTheme: ThemeVariables | null;
  installedThemes: MarketplaceItem[];
  isThemeLoading: boolean;
  themeError: Error | null;
  
  // Actions
  installItem: (itemId: string) => Promise<void>;
  uninstallItem: (itemId: string) => Promise<void>;
  activatePlugin: (pluginId: string) => Promise<void>;
  deactivatePlugin: (pluginId: string) => Promise<void>;
  activateTheme: (themeId: string) => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceContextType | null>(null);

interface MarketplaceProviderProps {
  children: React.ReactNode;
  editor?: Editor;
}

export function MarketplaceProvider({ children, editor }: MarketplaceProviderProps) {
  const [installedPlugins, setInstalledPlugins] = useState<MarketplaceItem[]>([]);
  const [activePlugins, setActivePlugins] = useState<MarketplaceItem[]>([]);
  const [isPluginLoading, setIsPluginLoading] = useState(true);
  const [pluginError, setPluginError] = useState<Error | null>(null);
  
  const [installedThemes, setInstalledThemes] = useState<MarketplaceItem[]>([]);
  const [isThemeLoading, setIsThemeLoading] = useState(true);
  const [themeError, setThemeError] = useState<Error | null>(null);
  
  const supabase = useSupabaseClient();
  const user = useUser();
  
  // Initialize plugin manager with editor instance
  const pluginManager = React.useMemo(() => {
    if (editor) {
      return new LoomityPluginManager(editor, {
        workspace: { id: 'default', name: 'Default Workspace' },
        user: user ? { id: user.id, email: user.email || '' } : null,
      });
    }
    return null;
  }, [editor, user]);

  // Load installed items on mount
  useEffect(() => {
    async function loadInstalledItems() {
      try {
        const items = await marketplaceSDK.getUserInstalledItems();
        
        // Separate plugins and themes
        const plugins = items.filter(item => item.type === 'plugin');
        const themes = items.filter(item => item.type === 'theme');
        
        setInstalledPlugins(plugins);
        setInstalledThemes(themes);
        
        // Load active plugins
        const activePlugins = plugins.filter(p => {
          const installation = items.find(i => i.id === p.id);
          return installation?.enabled;
        });
        setActivePlugins(activePlugins);
        
        // Load user theme
        await themeSystem.loadUserTheme();
        
      } catch (error) {
        setPluginError(error as Error);
        setThemeError(error as Error);
      } finally {
        setIsPluginLoading(false);
        setIsThemeLoading(false);
      }
    }

    if (user) {
      loadInstalledItems();
    }
  }, [user]);

  const value: MarketplaceContextType = {
    // Plugin state
    installedPlugins,
    activePlugins,
    isPluginLoading,
    pluginError,
    
    // Theme state
    currentTheme: themeSystem.getThemeVariables(),
    installedThemes,
    isThemeLoading,
    themeError,
    
    // Actions
    installItem: async (itemId: string) => {
      await marketplaceSDK.installItem(itemId);
      // Refresh installed items
      const items = await marketplaceSDK.getUserInstalledItems();
      setInstalledPlugins(items.filter(item => item.type === 'plugin'));
      setInstalledThemes(items.filter(item => item.type === 'theme'));
    },
    
    uninstallItem: async (itemId: string) => {
      await marketplaceSDK.uninstallItem(itemId);
      // Refresh installed items
      const items = await marketplaceSDK.getUserInstalledItems();
      setInstalledPlugins(items.filter(item => item.type === 'plugin'));
      setInstalledThemes(items.filter(item => item.type === 'theme'));
    },
    
    activatePlugin: async (pluginId: string) => {
      if (pluginManager) {
        await pluginManager.activate(pluginId);
        const plugin = installedPlugins.find(p => p.id === pluginId);
        if (plugin) {
          setActivePlugins(prev => [...prev, plugin]);
        }
      }
    },
    
    deactivatePlugin: async (pluginId: string) => {
      if (pluginManager) {
        await pluginManager.deactivate(pluginId);
        setActivePlugins(prev => prev.filter(p => p.id !== pluginId));
      }
    },
    
    activateTheme: async (themeId: string) => {
      await themeSystem.activateTheme(themeId);
    },
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
}
