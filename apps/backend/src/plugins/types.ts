import { Extension } from '@tiptap/core';

export enum PluginCategory {
  TEXT_FORMATTING = 'text_formatting',
  CONTENT_ORGANIZATION = 'content_organization',
  MEDIA_EMBEDS = 'media_embeds',
  COLLABORATION = 'collaboration',
  ADVANCED_EDITING = 'advanced_editing',
  LAYOUT_STRUCTURE = 'layout_structure',
  DEVELOPER_TOOLS = 'developer_tools',
  PRODUCTIVITY = 'productivity',
}

export enum PluginStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  DEPRECATED = 'deprecated',
  BETA = 'beta',
}

export interface PluginPermission {
  read: boolean;
  write: boolean;
  execute: boolean;
}

export interface PluginPricing {
  type: 'free' | 'paid' | 'subscription';
  price?: number;
  currency?: string;
  interval?: 'monthly' | 'yearly';
}

export interface PluginMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  website?: string;
  repository?: string;
  license: string;
  category: PluginCategory;
  tags: string[];
  status: PluginStatus;
  permissions: PluginPermission;
  pricing: PluginPricing;
  dependencies?: Record<string, string>;
  created_at: Date;
  updated_at: Date;
}

export interface PluginConfiguration {
  enabled: boolean;
  settings: Record<string, any>;
}

export interface Plugin {
  metadata: PluginMetadata;
  configuration: PluginConfiguration;
  extension?: Extension;
}

export interface PluginInstallation {
  id: string;
  user_id: string;
  plugin_id: string;
  workspace_id?: string;
  configuration: PluginConfiguration;
  installed_at: Date;
  updated_at: Date;
}

export interface PluginEvent {
  id: string;
  plugin_id: string;
  user_id: string;
  workspace_id?: string;
  event_type: string;
  payload: Record<string, any>;
  created_at: Date;
}

export interface PluginAnalytics {
  plugin_id: string;
  installations: number;
  active_users: number;
  usage_count: number;
  avg_rating: number;
  revenue?: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: Date;
}

export interface CreatePluginDTO {
  name: string;
  description: string;
  version: string;
  author: string;
  website?: string;
  repository?: string;
  license: string;
  category: PluginCategory;
  tags: string[];
  permissions: PluginPermission;
  pricing: PluginPricing;
  configuration: PluginConfiguration;
}

export interface UpdatePluginDTO extends Partial<CreatePluginDTO> {
  status?: PluginStatus;
}

export interface PluginSearchParams {
  category?: PluginCategory;
  status?: PluginStatus;
  tags?: string[];
  author?: string;
  pricing_type?: PluginPricing['type'];
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'installations' | 'rating';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
