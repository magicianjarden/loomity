import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  Plugin,
  PluginMetadata,
  PluginInstallation,
  PluginEvent,
  PluginAnalytics,
  CreatePluginDTO,
  UpdatePluginDTO,
  PluginSearchParams,
} from './types';

@Injectable()
export class PluginService {
  constructor(private readonly supabase: SupabaseService) {}

  async createPlugin(userId: string, dto: CreatePluginDTO): Promise<Plugin> {
    const metadata: PluginMetadata = {
      id: crypto.randomUUID(),
      ...dto,
      status: 'beta',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const { data, error } = await this.supabase
      .getClient()
      .from('plugins')
      .insert({
        ...metadata,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      metadata: data,
      configuration: dto.configuration,
    };
  }

  async updatePlugin(
    pluginId: string,
    userId: string,
    dto: UpdatePluginDTO,
  ): Promise<Plugin> {
    const { data, error } = await this.supabase
      .getClient()
      .from('plugins')
      .update({
        ...dto,
        updated_at: new Date(),
      })
      .eq('id', pluginId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      metadata: data,
      configuration: dto.configuration || data.configuration,
    };
  }

  async getPlugin(pluginId: string): Promise<Plugin> {
    const { data, error } = await this.supabase
      .getClient()
      .from('plugins')
      .select()
      .eq('id', pluginId)
      .single();

    if (error) throw error;

    return {
      metadata: data,
      configuration: data.configuration,
    };
  }

  async searchPlugins(params: PluginSearchParams): Promise<Plugin[]> {
    let query = this.supabase.getClient().from('plugins').select();

    if (params.category) {
      query = query.eq('category', params.category);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.author) {
      query = query.eq('author', params.author);
    }

    if (params.tags?.length) {
      query = query.contains('tags', params.tags);
    }

    if (params.pricing_type) {
      query = query.eq('pricing.type', params.pricing_type);
    }

    if (params.sort_by) {
      query = query.order(params.sort_by, {
        ascending: params.sort_order === 'asc',
      });
    }

    if (params.page && params.limit) {
      const start = (params.page - 1) * params.limit;
      query = query.range(start, start + params.limit - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map((item) => ({
      metadata: item,
      configuration: item.configuration,
    }));
  }

  async installPlugin(
    userId: string,
    pluginId: string,
    workspaceId?: string,
  ): Promise<PluginInstallation> {
    const installation: PluginInstallation = {
      id: crypto.randomUUID(),
      user_id: userId,
      plugin_id: pluginId,
      workspace_id: workspaceId,
      configuration: {
        enabled: true,
        settings: {},
      },
      installed_at: new Date(),
      updated_at: new Date(),
    };

    const { data, error } = await this.supabase
      .getClient()
      .from('plugin_installations')
      .insert(installation)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async uninstallPlugin(
    userId: string,
    pluginId: string,
    workspaceId?: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('plugin_installations')
      .delete()
      .eq('user_id', userId)
      .eq('plugin_id', pluginId)
      .eq('workspace_id', workspaceId || '');

    if (error) throw error;
  }

  async trackEvent(event: Omit<PluginEvent, 'id' | 'created_at'>): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('plugin_events')
      .insert({
        ...event,
        id: crypto.randomUUID(),
        created_at: new Date(),
      });

    if (error) throw error;
  }

  async getAnalytics(
    pluginId: string,
    period: PluginAnalytics['period'],
  ): Promise<PluginAnalytics> {
    // This would typically involve more complex queries and aggregations
    // For now, we'll return mock data
    return {
      plugin_id: pluginId,
      installations: 0,
      active_users: 0,
      usage_count: 0,
      avg_rating: 0,
      period,
      date: new Date(),
    };
  }
}
