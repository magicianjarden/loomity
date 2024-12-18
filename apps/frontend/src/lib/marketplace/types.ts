export type MarketplaceItemType = 'plugin' | 'theme';

export interface MarketplaceItemMetadata {
  id: string;
  name: string;
  description: string;
  type: MarketplaceItemType;
  tags: string[];
  author_id: string;
  version: string;
  created_at: string;
  updated_at: string;
  downloads: number;
  rating: number;
  review_count: number;
  preview_images: string[];
}

export interface PluginContent {
  entry_point: string;
  dependencies: string[];
  permissions: string[];
  configuration: {
    schema: Record<string, any>; // JSON Schema
    default: Record<string, any>;
  };
}

export interface ThemeContent {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    muted: string;
    [key: string]: string;
  };
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    lineHeight: Record<string, string>;
  };
  components: Record<string, any>; // Component-specific styles
}

export interface MarketplaceItem extends MarketplaceItemMetadata {
  content: PluginContent | ThemeContent;
}

export interface UserInstallation {
  user_id: string;
  item_id: string;
  installed_at: string;
  enabled: boolean;
  settings: Record<string, any>;
}

export interface MarketplaceReview {
  id: string;
  user_id: string;
  item_id: string;
  rating: number;
  review?: string;
  created_at: string;
}

export interface SearchOptions {
  query?: string;
  type?: MarketplaceItemType;
  tags?: string[];
  sortBy?: 'downloads' | 'rating' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface PublishItemOptions {
  name: string;
  description: string;
  type: MarketplaceItemType;
  tags: string[];
  preview_images: string[];
  content: PluginContent | ThemeContent;
}

export interface PluginConfiguration {
  [key: string]: any;
}

export interface PluginConfigSchema {
  type: 'object';
  properties: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean';
      title?: string;
      description?: string;
      default?: any;
      minimum?: number;
      maximum?: number;
      multipleOf?: number;
    };
  };
  required?: string[];
}

export interface Plugin extends MarketplaceItem {
  type: 'plugin';
  configuration?: PluginConfiguration;
  metadata?: {
    author?: string;
    tags?: string[];
    screenshots?: string[];
    website?: string;
    repository?: string;
    license?: string;
    configSchema?: PluginConfigSchema;
  };
}

export interface Theme extends MarketplaceItem {
  type: 'theme';
  variables?: {
    [section: string]: {
      [key: string]: string;
    };
  };
  customization?: {
    disabledVariables: string[];
  };
}

export class MarketplaceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MarketplaceError';
  }
}
