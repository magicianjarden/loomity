import { Editor } from '@tiptap/core';
import {
  PluginDefinition,
  PluginManager,
  PluginContext,
  PluginAPI,
} from './types';

export class LoomityPluginManager implements PluginManager {
  private plugins: Map<string, PluginDefinition> = new Map();
  private activePlugins: Set<string> = new Set();
  private editor: Editor;
  private context: PluginContext;

  constructor(editor: Editor, context: PluginContext) {
    this.editor = editor;
    this.context = context;
  }

  async install(plugin: PluginDefinition): Promise<void> {
    if (this.plugins.has(plugin.metadata.id)) {
      throw new Error(`Plugin ${plugin.metadata.id} is already installed`);
    }

    // Initialize plugin with context
    await plugin.initialize(this.context);
    
    // Store plugin
    this.plugins.set(plugin.metadata.id, plugin);
    
    // Track installation
    await this.trackEvent(plugin.metadata.id, 'install');
  }

  async uninstall(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }

    // Deactivate if active
    if (this.activePlugins.has(pluginId)) {
      await this.deactivate(pluginId);
    }

    // Remove plugin
    this.plugins.delete(pluginId);
    
    // Track uninstallation
    await this.trackEvent(pluginId, 'uninstall');
  }

  async activate(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }

    if (this.activePlugins.has(pluginId)) {
      return; // Already active
    }

    // Activate plugin
    await plugin.activate();
    this.activePlugins.add(pluginId);
    
    // Track activation
    await this.trackEvent(pluginId, 'activate');
  }

  async deactivate(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }

    if (!this.activePlugins.has(pluginId)) {
      return; // Already inactive
    }

    // Deactivate plugin
    await plugin.deactivate();
    this.activePlugins.delete(pluginId);
    
    // Track deactivation
    await this.trackEvent(pluginId, 'deactivate');
  }

  getPlugin(pluginId: string): PluginDefinition | null {
    return this.plugins.get(pluginId) || null;
  }

  getInstalledPlugins(): PluginDefinition[] {
    return Array.from(this.plugins.values());
  }

  getActivePlugins(): PluginDefinition[] {
    return Array.from(this.activePlugins).map(
      (id) => this.plugins.get(id)!
    );
  }

  private async trackEvent(
    pluginId: string,
    eventType: string,
    payload?: Record<string, any>
  ): Promise<void> {
    try {
      await fetch('/api/plugins/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plugin_id: pluginId,
          event_type: eventType,
          payload,
        }),
      });
    } catch (error) {
      console.error('Failed to track plugin event:', error);
    }
  }
}
