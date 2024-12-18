import { Plugin, PluginConfiguration } from '../marketplace/types';
import { PluginLoader } from './plugin-loader';
import { PluginVersionManager } from './plugin-version-manager';
import { pluginEvents } from './plugin-events';
import { SupabaseClient } from '@supabase/supabase-js';

export interface PluginInstallOptions {
  autoEnable?: boolean;
  skipCompatCheck?: boolean;
  version?: string;
}

export interface PluginModule {
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onActivate?: () => Promise<void>;
  onDeactivate?: () => Promise<void>;
  onConfigChange?: (config: PluginConfiguration) => Promise<void>;
}

export class PluginSystem {
  private static instance: PluginSystem;
  private loader: PluginLoader;
  private versionManager: PluginVersionManager;
  private supabaseClient?: SupabaseClient;
  private plugins: Map<string, PluginModule> = new Map();
  private configurations: Map<string, PluginConfiguration> = new Map();

  private constructor() {
    this.loader = PluginLoader.getInstance();
    this.versionManager = PluginVersionManager.getInstance();
  }

  public static getInstance(): PluginSystem {
    if (!PluginSystem.instance) {
      PluginSystem.instance = new PluginSystem();
    }
    return PluginSystem.instance;
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

  public async loadPlugin(plugin: Plugin): Promise<void> {
    try {
      // In a real implementation, this would load the plugin code from a URL or CDN
      // For now, we'll just create a basic module structure
      const module: PluginModule = {
        onInstall: async () => {
          console.log(`Plugin ${plugin.name} installed`);
        },
        onUninstall: async () => {
          console.log(`Plugin ${plugin.name} uninstalled`);
        },
        onActivate: async () => {
          console.log(`Plugin ${plugin.name} activated`);
        },
        onDeactivate: async () => {
          console.log(`Plugin ${plugin.name} deactivated`);
        },
        onConfigChange: async (config) => {
          console.log(`Plugin ${plugin.name} configuration updated:`, config);
        },
      };

      this.plugins.set(plugin.id, module);
      this.configurations.set(plugin.id, plugin.configuration || {});
    } catch (error) {
      console.error(`Error loading plugin ${plugin.name}:`, error);
      throw error;
    }
  }

  public async unloadPlugin(pluginId: string): Promise<void> {
    this.plugins.delete(pluginId);
    this.configurations.delete(pluginId);
  }

  public async installPlugin(
    pluginId: string,
    options: PluginInstallOptions = {}
  ): Promise<void> {
    const supabase = this.ensureSupabaseClient();
    try {
      pluginEvents.emit('plugin:beforeInstall', pluginId);

      // Check if plugin exists
      const { data: plugin, error } = await supabase
        .from('plugins')
        .select('*')
        .eq('id', pluginId)
        .single();

      if (error || !plugin) {
        throw new Error(`Plugin not found: ${error?.message}`);
      }

      // Version compatibility check
      if (!options.skipCompatCheck) {
        const hostVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
        if (!this.isVersionCompatible(hostVersion, plugin.manifest.minHostVersion)) {
          throw new Error('Plugin not compatible with current app version');
        }
      }

      // Install specific version if requested
      if (options.version) {
        await this.versionManager.updatePlugin(pluginId, options.version);
      }

      // Store installation in database
      const { error: installError } = await supabase
        .from('installed_plugins')
        .insert({
          plugin_id: pluginId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          version: options.version || plugin.manifest.version,
          enabled: options.autoEnable ?? false,
        });

      if (installError) {
        throw new Error(`Failed to install plugin: ${installError.message}`);
      }

      // Load plugin if auto-enable is true
      if (options.autoEnable) {
        await this.loader.loadPlugin(pluginId);
      }

      pluginEvents.emit('plugin:afterInstall', pluginId);
    } catch (error) {
      pluginEvents.emit('plugin:error', pluginId, error as Error);
      throw error;
    }
  }

  public async uninstallPlugin(pluginId: string): Promise<void> {
    const supabase = this.ensureSupabaseClient();
    try {
      pluginEvents.emit('plugin:beforeUninstall', pluginId);

      // Unload plugin if loaded
      if (this.loader.getLoadedPlugin(pluginId)) {
        await this.loader.unloadPlugin(pluginId);
      }

      // Remove from database
      const { error } = await supabase
        .from('installed_plugins')
        .delete()
        .eq('plugin_id', pluginId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        throw new Error(`Failed to uninstall plugin: ${error.message}`);
      }

      pluginEvents.emit('plugin:afterUninstall', pluginId);
    } catch (error) {
      pluginEvents.emit('plugin:error', pluginId, error as Error);
      throw error;
    }
  }

  public async enablePlugin(pluginId: string): Promise<void> {
    const supabase = this.ensureSupabaseClient();
    try {
      // Load plugin
      await this.loader.loadPlugin(pluginId);

      // Update database
      const { error } = await supabase
        .from('installed_plugins')
        .update({ enabled: true })
        .eq('plugin_id', pluginId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        throw new Error(`Failed to enable plugin: ${error.message}`);
      }
    } catch (error) {
      pluginEvents.emit('plugin:error', pluginId, error as Error);
      throw error;
    }
  }

  public async disablePlugin(pluginId: string): Promise<void> {
    const supabase = this.ensureSupabaseClient();
    try {
      // Unload plugin
      await this.loader.unloadPlugin(pluginId);

      // Update database
      const { error } = await supabase
        .from('installed_plugins')
        .update({ enabled: false })
        .eq('plugin_id', pluginId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        throw new Error(`Failed to disable plugin: ${error.message}`);
      }
    } catch (error) {
      pluginEvents.emit('plugin:error', pluginId, error as Error);
      throw error;
    }
  }

  public async updatePlugin(pluginId: string, version?: string): Promise<void> {
    try {
      const plugin = this.loader.getLoadedPlugin(pluginId);
      const currentVersion = plugin?.manifest.version;

      // Update to new version
      await this.versionManager.updatePlugin(pluginId, version);

      // If plugin was loaded, reload it
      if (plugin) {
        await this.loader.reloadPlugin(pluginId);
      }

      // Run data migration if needed
      if (currentVersion && plugin) {
        await this.loader.migratePluginData(
          pluginId,
          currentVersion,
          version || plugin.manifest.version
        );
      }
    } catch (error) {
      pluginEvents.emit('plugin:error', pluginId, error as Error);
      throw error;
    }
  }

  private isVersionCompatible(hostVersion: string, minHostVersion: string): boolean {
    const [hostMajor, hostMinor] = hostVersion.split('.');
    const [minMajor, minMinor] = minHostVersion.split('.');

    if (parseInt(hostMajor) > parseInt(minMajor)) return true;
    if (parseInt(hostMajor) < parseInt(minMajor)) return false;
    return parseInt(hostMinor) >= parseInt(minMinor);
  }

  public async getInstalledPlugins(): Promise<any[]> {
    const supabase = this.ensureSupabaseClient();
    const { data, error } = await supabase
      .from('installed_plugins')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      throw new Error(`Failed to fetch installed plugins: ${error.message}`);
    }

    return data || [];
  }

  public async checkForUpdates(): Promise<Map<string, boolean>> {
    const installed = await this.getInstalledPlugins();
    const updates = new Map<string, boolean>();

    for (const plugin of installed) {
      const result = await this.versionManager.checkForUpdates(plugin.plugin_id);
      updates.set(plugin.plugin_id, result.hasUpdate);
    }

    return updates;
  }

  public async install(plugin: Plugin): Promise<void> {
    await this.loadPlugin(plugin);
    const module = this.plugins.get(plugin.id);
    if (module?.onInstall) {
      await module.onInstall();
    }
  }

  public async uninstall(pluginId: string): Promise<void> {
    const module = this.plugins.get(pluginId);
    if (module?.onUninstall) {
      await module.onUninstall();
    }
    await this.unloadPlugin(pluginId);
  }

  public async activate(pluginId: string): Promise<void> {
    const module = this.plugins.get(pluginId);
    if (module?.onActivate) {
      await module.onActivate();
    }
  }

  public async deactivate(pluginId: string): Promise<void> {
    const module = this.plugins.get(pluginId);
    if (module?.onDeactivate) {
      await module.onDeactivate();
    }
  }

  public async updatePluginConfig(pluginId: string, config: PluginConfiguration): Promise<void> {
    const module = this.plugins.get(pluginId);
    if (module?.onConfigChange) {
      await module.onConfigChange(config);
    }
    this.configurations.set(pluginId, config);
  }

  public getPluginConfig(pluginId: string): PluginConfiguration | undefined {
    return this.configurations.get(pluginId);
  }

  public isPluginLoaded(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }
}

// Create a singleton instance
export const pluginSystem = PluginSystem.getInstance();

// Export a hook for React components
export function usePluginSystem() {
  return pluginSystem;
}
