import { createClient } from '@supabase/supabase-js';

export class PluginStorage {
  private supabase;
  private pluginId: string;
  private userId: string;
  private workspaceId?: string;

  constructor(pluginId: string, userId: string, workspaceId?: string) {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.pluginId = pluginId;
    this.userId = userId;
    this.workspaceId = workspaceId;
  }

  private getStorageKey(key: string): string {
    return `plugin:${this.pluginId}:${key}`;
  }

  async getData<T>(key: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from('plugin_storage')
      .select('value')
      .eq('plugin_id', this.pluginId)
      .eq('user_id', this.userId)
      .eq('workspace_id', this.workspaceId || '')
      .eq('key', this.getStorageKey(key))
      .single();

    if (error) {
      console.error('Error fetching plugin data:', error);
      return null;
    }

    return data?.value as T;
  }

  async setData<T>(key: string, value: T): Promise<void> {
    const { error } = await this.supabase
      .from('plugin_storage')
      .upsert({
        plugin_id: this.pluginId,
        user_id: this.userId,
        workspace_id: this.workspaceId,
        key: this.getStorageKey(key),
        value,
        updated_at: new Date().toISOString(),
      })
      .eq('plugin_id', this.pluginId)
      .eq('user_id', this.userId)
      .eq('workspace_id', this.workspaceId || '');

    if (error) {
      console.error('Error saving plugin data:', error);
      throw error;
    }
  }

  async removeData(key: string): Promise<void> {
    const { error } = await this.supabase
      .from('plugin_storage')
      .delete()
      .eq('plugin_id', this.pluginId)
      .eq('user_id', this.userId)
      .eq('workspace_id', this.workspaceId || '')
      .eq('key', this.getStorageKey(key));

    if (error) {
      console.error('Error removing plugin data:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    const { error } = await this.supabase
      .from('plugin_storage')
      .delete()
      .eq('plugin_id', this.pluginId)
      .eq('user_id', this.userId)
      .eq('workspace_id', this.workspaceId || '');

    if (error) {
      console.error('Error clearing plugin data:', error);
      throw error;
    }
  }

  async listKeys(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('plugin_storage')
      .select('key')
      .eq('plugin_id', this.pluginId)
      .eq('user_id', this.userId)
      .eq('workspace_id', this.workspaceId || '');

    if (error) {
      console.error('Error listing plugin keys:', error);
      return [];
    }

    return data.map(item => item.key.replace(`plugin:${this.pluginId}:`, ''));
  }
}
