import { PluginManifest } from './types';
import { PluginSandbox } from './plugin-sandbox';
import { PluginVersionManager } from './plugin-version-manager';
import { pluginEvents } from './plugin-events';
import { SupabaseClient } from '@supabase/supabase-js';

interface LoadedPlugin {
  id: string;
  manifest: PluginManifest;
  sandbox: PluginSandbox;
  instance: any;
}

export class PluginLoader {
  private static instance: PluginLoader;
  private loadedPlugins: Map<string, LoadedPlugin> = new Map();
  private versionManager: PluginVersionManager;
  private supabaseClient?: SupabaseClient;

  private constructor() {
    this.versionManager = PluginVersionManager.getInstance();
  }

  public static getInstance(): PluginLoader {
    if (!PluginLoader.instance) {
      PluginLoader.instance = new PluginLoader();
    }
    return PluginLoader.instance;
  }

  public setSupabaseClient(client: SupabaseClient) {
    this.supabaseClient = client;
  }

  private ensureSupabaseClient() {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized. Make sure to call setSupabaseClient first.');
    }
    return this.supabaseClient;
  }

  public async loadPlugin(pluginId: string): Promise<void> {
    const supabase = this.ensureSupabaseClient();
    try {
      // Check if plugin is already loaded
      if (this.loadedPlugins.has(pluginId)) {
        throw new Error('Plugin already loaded');
      }

      // Fetch plugin manifest and code
      const { data: plugin, error } = await supabase
        .from('plugins')
        .select('*')
        .eq('id', pluginId)
        .single();

      if (error || !plugin) {
        throw new Error(`Failed to fetch plugin: ${error?.message}`);
      }

      // Check version compatibility
      const updateCheck = await this.versionManager.checkForUpdates(pluginId);
      if (updateCheck.hasUpdate) {
        await this.versionManager.updatePlugin(pluginId);
      }

      // Create sandbox
      const sandbox = new PluginSandbox(pluginId, plugin.manifest);
      await sandbox.initialize();

      // Load plugin code into sandbox
      const instance = await sandbox.executeCode(plugin.code);

      // Register plugin events
      if (plugin.manifest.events) {
        pluginEvents.registerPluginEvents(pluginId, plugin.manifest.events);
      }

      // Store loaded plugin
      this.loadedPlugins.set(pluginId, {
        id: pluginId,
        manifest: plugin.manifest,
        sandbox,
        instance,
      });

      // Register with version manager
      await this.versionManager.registerPlugin(pluginId, plugin.manifest.version);

      // Call plugin lifecycle method
      if (instance.onLoad) {
        await instance.onLoad();
      }

      pluginEvents.emit('plugin:afterInstall', pluginId);
    } catch (error) {
      pluginEvents.emit('plugin:error', pluginId, error as Error);
      throw error;
    }
  }

  public async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.loadedPlugins.get(pluginId);
    if (!plugin) {
      throw new Error('Plugin not loaded');
    }

    try {
      // Call plugin lifecycle method
      if (plugin.instance.onUnload) {
        await plugin.instance.onUnload();
      }

      // Unregister plugin events
      pluginEvents.unregisterPluginEvents(pluginId);

      // Destroy sandbox
      plugin.sandbox.destroy();

      // Remove from loaded plugins
      this.loadedPlugins.delete(pluginId);

      pluginEvents.emit('plugin:afterUninstall', pluginId);
    } catch (error) {
      pluginEvents.emit('plugin:error', pluginId, error as Error);
      throw error;
    }
  }

  public async reloadPlugin(pluginId: string): Promise<void> {
    await this.unloadPlugin(pluginId);
    await this.loadPlugin(pluginId);
  }

  public getLoadedPlugin(pluginId: string): LoadedPlugin | undefined {
    return this.loadedPlugins.get(pluginId);
  }

  public async migratePluginData(
    pluginId: string,
    fromVersion: string,
    toVersion: string
  ): Promise<void> {
    const plugin = this.loadedPlugins.get(pluginId);
    if (!plugin) {
      throw new Error('Plugin not loaded');
    }

    try {
      // Get migration function from plugin
      const migrationFn = plugin.instance[`migrate_${fromVersion}_to_${toVersion}`];
      if (!migrationFn) {
        console.warn(`No migration function found for ${fromVersion} to ${toVersion}`);
        return;
      }

      // Execute migration
      await migrationFn();
    } catch (error) {
      pluginEvents.emit('plugin:error', pluginId, error as Error);
      throw error;
    }
  }
}
