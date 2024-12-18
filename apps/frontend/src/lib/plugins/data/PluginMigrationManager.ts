import { createClient } from '@supabase/supabase-js';
import { PluginManifest } from '../types/PluginManifest';

interface MigrationRecord {
  id: string;
  plugin_id: string;
  version_from: number;
  version_to: number;
  executed_at: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export class PluginMigrationManager {
  private supabase;
  private pluginId: string;
  private currentVersion: number;

  constructor(
    private readonly manifest: PluginManifest,
    private readonly options: {
      supabaseUrl: string;
      supabaseKey: string;
    }
  ) {
    this.pluginId = manifest.id;
    this.currentVersion = manifest.dataSchema?.version || 1;
    this.supabase = createClient(options.supabaseUrl, options.supabaseKey);
  }

  async getCurrentVersion(): Promise<number> {
    const { data, error } = await this.supabase
      .from('plugin_migrations')
      .select('version_to')
      .eq('plugin_id', this.pluginId)
      .eq('status', 'completed')
      .order('executed_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return 1; // Default version if no migrations found
    }

    return data.version_to;
  }

  async needsMigration(): Promise<boolean> {
    const currentVersion = await this.getCurrentVersion();
    return currentVersion < this.currentVersion;
  }

  async migrate(): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    
    if (currentVersion >= this.currentVersion) {
      return; // No migration needed
    }

    // Create migration record
    const migrationId = `${this.pluginId}_${currentVersion}_${this.currentVersion}`;
    await this.createMigrationRecord(migrationId, currentVersion);

    try {
      // Get all plugin data
      const { data: pluginData, error: dataError } = await this.supabase
        .from('plugin_data')
        .select('*')
        .eq('plugin_id', this.pluginId);

      if (dataError) throw dataError;

      // Apply migrations sequentially
      for (let version = currentVersion + 1; version <= this.currentVersion; version++) {
        const migrationFn = await this.getMigrationFunction(version);
        if (migrationFn) {
          // Transform data
          for (const item of pluginData) {
            item.value = migrationFn(item.value);
            item.version = version;
          }
        }
      }

      // Update all data
      const { error: updateError } = await this.supabase
        .from('plugin_data')
        .upsert(pluginData);

      if (updateError) throw updateError;

      // Mark migration as completed
      await this.completeMigration(migrationId);
    } catch (error) {
      await this.failMigration(migrationId, error as Error);
      throw error;
    }
  }

  private async createMigrationRecord(
    migrationId: string,
    fromVersion: number
  ): Promise<void> {
    const { error } = await this.supabase
      .from('plugin_migrations')
      .insert({
        id: migrationId,
        plugin_id: this.pluginId,
        version_from: fromVersion,
        version_to: this.currentVersion,
        status: 'pending',
        executed_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  private async completeMigration(migrationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('plugin_migrations')
      .update({
        status: 'completed',
      })
      .eq('id', migrationId);

    if (error) throw error;
  }

  private async failMigration(
    migrationId: string,
    error: Error
  ): Promise<void> {
    const { error: updateError } = await this.supabase
      .from('plugin_migrations')
      .update({
        status: 'failed',
        error: error.message,
      })
      .eq('id', migrationId);

    if (updateError) throw updateError;
  }

  private async getMigrationFunction(
    version: number
  ): Promise<((data: unknown) => unknown) | null> {
    // Load migration function from plugin's migration directory
    try {
      const migrationModule = await import(
        `/plugins/${this.pluginId}/migrations/v${version}.js`
      );
      return migrationModule.default;
    } catch {
      return null; // No migration function for this version
    }
  }
}
