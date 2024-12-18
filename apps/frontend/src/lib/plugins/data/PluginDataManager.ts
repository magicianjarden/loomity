import { createClient } from '@supabase/supabase-js';
import { PluginManifest } from '../types/PluginManifest';

export class PluginDataManager {
  private supabase;
  private pluginId: string;
  private dataVersion: number;

  constructor(
    private readonly manifest: PluginManifest,
    private readonly options: {
      supabaseUrl: string;
      supabaseKey: string;
    }
  ) {
    this.pluginId = manifest.id;
    this.dataVersion = manifest.dataSchema?.version || 1;
    this.supabase = createClient(options.supabaseUrl, options.supabaseKey);
  }

  async getData<T>(key: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from('plugin_data')
      .select('value')
      .eq('plugin_id', this.pluginId)
      .eq('key', key)
      .single();

    if (error) {
      console.error('Error fetching plugin data:', error);
      return null;
    }

    return data?.value as T;
  }

  async setData<T>(key: string, value: T): Promise<void> {
    const { error } = await this.supabase
      .from('plugin_data')
      .upsert({
        plugin_id: this.pluginId,
        key,
        value,
        version: this.dataVersion,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving plugin data:', error);
      throw error;
    }
  }

  async deleteData(key: string): Promise<void> {
    const { error } = await this.supabase
      .from('plugin_data')
      .delete()
      .eq('plugin_id', this.pluginId)
      .eq('key', key);

    if (error) {
      console.error('Error deleting plugin data:', error);
      throw error;
    }
  }

  async backup(): Promise<Record<string, unknown>> {
    const { data, error } = await this.supabase
      .from('plugin_data')
      .select('key, value')
      .eq('plugin_id', this.pluginId);

    if (error) {
      console.error('Error creating backup:', error);
      throw error;
    }

    return data.reduce((acc, { key, value }) => ({
      ...acc,
      [key]: value,
    }), {});
  }

  async restore(backupData: Record<string, unknown>): Promise<void> {
    const batch = Object.entries(backupData).map(([key, value]) => ({
      plugin_id: this.pluginId,
      key,
      value,
      version: this.dataVersion,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await this.supabase
      .from('plugin_data')
      .upsert(batch);

    if (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    const { error } = await this.supabase
      .from('plugin_data')
      .delete()
      .eq('plugin_id', this.pluginId);

    if (error) {
      console.error('Error cleaning up plugin data:', error);
      throw error;
    }
  }
}
