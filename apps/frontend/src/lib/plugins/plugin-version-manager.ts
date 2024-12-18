import { SupabaseClient } from '@supabase/supabase-js';
import semver from 'semver';
import { PluginManifest } from './types';
import { pluginEvents } from './plugin-events';

interface PluginVersion {
  version: string;
  manifest: PluginManifest;
  releaseNotes: string;
  minimumHostVersion: string;
  publishedAt: Date;
  downloadUrl: string;
}

interface UpdateCheckResult {
  hasUpdate: boolean;
  latestVersion?: PluginVersion;
  currentVersion: string;
}

export class PluginVersionManager {
  private static instance: PluginVersionManager;
  private installedVersions: Map<string, string> = new Map();
  private updateCheckInterval: number = 24 * 60 * 60 * 1000; // 24 hours
  private checkingUpdates: boolean = false;
  private supabaseClient?: SupabaseClient;

  private constructor() {
    this.startUpdateChecker();
  }

  public static getInstance(): PluginVersionManager {
    if (!PluginVersionManager.instance) {
      PluginVersionManager.instance = new PluginVersionManager();
    }
    return PluginVersionManager.instance;
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

  public async registerPlugin(pluginId: string, version: string): Promise<void> {
    this.installedVersions.set(pluginId, version);
    await this.checkForUpdates(pluginId);
  }

  public async checkForUpdates(pluginId: string): Promise<UpdateCheckResult> {
    const supabase = this.ensureSupabaseClient();
    const currentVersion = this.installedVersions.get(pluginId);
    if (!currentVersion) {
      throw new Error('Plugin not registered');
    }

    const { data: versions, error } = await supabase
      .from('plugin_versions')
      .select('*')
      .eq('plugin_id', pluginId)
      .order('published_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to check for updates: ${error.message}`);
    }

    if (!versions || versions.length === 0) {
      return { hasUpdate: false, currentVersion };
    }

    const latestVersion = versions[0] as PluginVersion;
    const hasUpdate = semver.gt(latestVersion.version, currentVersion);

    return {
      hasUpdate,
      latestVersion: hasUpdate ? latestVersion : undefined,
      currentVersion,
    };
  }

  public async updatePlugin(pluginId: string, targetVersion?: string): Promise<void> {
    const supabase = this.ensureSupabaseClient();
    const currentVersion = this.installedVersions.get(pluginId);
    if (!currentVersion) {
      throw new Error('Plugin not registered');
    }

    // Get available versions
    const { data: versions, error } = await supabase
      .from('plugin_versions')
      .select('*')
      .eq('plugin_id', pluginId)
      .order('published_at', { ascending: false });

    if (error || !versions) {
      throw new Error(`Failed to fetch plugin versions: ${error?.message}`);
    }

    // Find target version
    const version = targetVersion
      ? versions.find(v => v.version === targetVersion)
      : versions[0];

    if (!version) {
      throw new Error('Target version not found');
    }

    // Check compatibility
    if (!this.isCompatible(version)) {
      throw new Error('Plugin version not compatible with current host version');
    }

    try {
      // Emit update start event
      pluginEvents.emit('plugin:beforeInstall', pluginId);

      // Download new version
      const response = await fetch(version.downloadUrl);
      if (!response.ok) {
        throw new Error('Failed to download plugin update');
      }

      // Install new version
      await this.installUpdate(pluginId, version, await response.blob());

      // Update installed version
      this.installedVersions.set(pluginId, version.version);

      // Emit update complete event
      pluginEvents.emit('plugin:afterInstall', pluginId);
    } catch (error) {
      pluginEvents.emit('plugin:error', pluginId, error as Error);
      throw error;
    }
  }

  private async installUpdate(
    pluginId: string,
    version: PluginVersion,
    pluginBlob: Blob
  ): Promise<void> {
    const supabase = this.ensureSupabaseClient();
    // Perform the actual update installation
    // This would typically involve:
    // 1. Backing up current version
    // 2. Stopping the plugin
    // 3. Installing new version
    // 4. Migrating configuration if needed
    // 5. Starting the plugin

    // For now, we'll just store the new version info
    const { error } = await supabase
      .from('installed_plugins')
      .update({
        version: version.version,
        updated_at: new Date().toISOString(),
      })
      .eq('plugin_id', pluginId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      throw new Error(`Failed to update plugin: ${error.message}`);
    }
  }

  private isCompatible(version: PluginVersion): boolean {
    const hostVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
    return semver.gte(hostVersion, version.minimumHostVersion);
  }

  private async startUpdateChecker(): Promise<void> {
    if (this.checkingUpdates) return;

    this.checkingUpdates = true;
    setInterval(async () => {
      for (const [pluginId] of this.installedVersions) {
        try {
          const result = await this.checkForUpdates(pluginId);
          if (result.hasUpdate) {
            // Notify about available update
            pluginEvents.emit('plugin:updateAvailable', pluginId, result.latestVersion);
          }
        } catch (error) {
          console.error(`Failed to check updates for plugin ${pluginId}:`, error);
        }
      }
    }, this.updateCheckInterval);
  }

  public getInstalledVersion(pluginId: string): string | undefined {
    return this.installedVersions.get(pluginId);
  }

  public async getUpdateHistory(pluginId: string): Promise<PluginVersion[]> {
    const supabase = this.ensureSupabaseClient();
    const { data: versions, error } = await supabase
      .from('plugin_versions')
      .select('*')
      .eq('plugin_id', pluginId)
      .order('published_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch update history: ${error.message}`);
    }

    return versions as PluginVersion[];
  }
}
