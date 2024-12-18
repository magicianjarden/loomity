import { Editor } from '@tiptap/core';
import { PluginCategory, PluginStatus, PluginMetadata } from '../../../backend/src/plugins/types';

export interface PluginContext {
  editor: Editor;
  workspace: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    email: string;
  };
}

export interface PluginAPI {
  // Editor manipulation
  insertContent: (content: string) => void;
  replaceContent: (from: number, to: number, content: string) => void;
  getContent: () => string;
  
  // Selection
  getSelection: () => { from: number; to: number } | null;
  setSelection: (from: number, to: number) => void;
  
  // Commands
  registerCommand: (name: string, callback: (args: any) => void) => void;
  executeCommand: (name: string, args?: any) => void;
  
  // UI
  registerToolbarItem: (item: ToolbarItem) => void;
  registerSidebarItem: (item: SidebarItem) => void;
  registerMenuItem: (item: MenuItem) => void;
  
  // Events
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
  emit: (event: string, data: any) => void;
  
  // Storage
  getData: (key: string) => Promise<any>;
  setData: (key: string, value: any) => Promise<void>;
  
  // Settings
  getSettings: () => Promise<Record<string, any>>;
  updateSettings: (settings: Record<string, any>) => Promise<void>;
}

export interface ToolbarItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  action: () => void;
  isActive?: () => boolean;
}

export interface SidebarItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  component: React.ComponentType;
  position?: 'left' | 'right';
}

export interface MenuItem {
  id: string;
  title: string;
  action: () => void;
  shortcut?: string;
  category?: string;
}

export interface PluginDefinition {
  metadata: PluginMetadata;
  initialize: (context: PluginContext) => Promise<void>;
  activate: () => Promise<void>;
  deactivate: () => Promise<void>;
  getAPI?: () => PluginAPI;
}

export interface PluginManager {
  install: (plugin: PluginDefinition) => Promise<void>;
  uninstall: (pluginId: string) => Promise<void>;
  activate: (pluginId: string) => Promise<void>;
  deactivate: (pluginId: string) => Promise<void>;
  getPlugin: (pluginId: string) => PluginDefinition | null;
  getInstalledPlugins: () => PluginDefinition[];
  getActivePlugins: () => PluginDefinition[];
}
