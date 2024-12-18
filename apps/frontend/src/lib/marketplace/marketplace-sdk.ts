import { supabase } from '../supabase';
import {
  MarketplaceItem,
  MarketplaceItemType,
  UserInstallation,
  MarketplaceReview,
  SearchOptions,
  PublishItemOptions,
  MarketplaceError
} from './types';
import { LoomityPluginManager } from '../plugin-sdk/plugin-manager';
import { PluginDefinition } from '../plugin-sdk/types';
import { ThemeDefinition } from './theme-system';

export class MarketplaceSDK {
  private pluginManager: LoomityPluginManager;

  constructor(pluginManager: LoomityPluginManager) {
    this.pluginManager = pluginManager;
  }

  // Search and Discovery
  async searchItems(options: SearchOptions): Promise<MarketplaceItem[]> {
    let query = supabase
      .from('marketplace_items')
      .select('*');

    // Apply filters
    if (options.type) {
      query = query.eq('type', options.type);
    }

    if (options.query) {
      query = query.textSearch('search_vector', options.query);
    }

    if (options.tags && options.tags.length > 0) {
      query = query.contains('tags', options.tags);
    }

    // Apply sorting
    if (options.sortBy) {
      const order = options.sortOrder || 'desc';
      query = query.order(options.sortBy, { ascending: order === 'asc' });
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new MarketplaceError(`Failed to search items: ${error.message}`);
    }

    return data as MarketplaceItem[];
  }

  async getFeaturedItems(type?: MarketplaceItemType): Promise<MarketplaceItem[]> {
    const { data, error } = await supabase
      .from('marketplace_items')
      .select('*')
      .eq('type', type || 'plugin')
      .order('rating', { ascending: false })
      .limit(6);

    if (error) {
      throw new MarketplaceError(`Failed to get featured items: ${error.message}`);
    }

    return data as MarketplaceItem[];
  }

  async getItemById(id: string): Promise<MarketplaceItem> {
    const { data, error } = await supabase
      .from('marketplace_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new MarketplaceError(`Failed to get item: ${error.message}`);
    }

    return data as MarketplaceItem;
  }

  // Installation Management
  async installItem(itemId: string): Promise<void> {
    const item = await this.getItemById(itemId);
    
    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }

    // Install based on item type
    if (item.type === 'plugin') {
      const pluginDef = this.convertToPluginDefinition(item.content);
      await this.pluginManager.install(pluginDef);
    } else if (item.type === 'theme') {
      await this.installTheme(item.content as ThemeDefinition);
    }

    // Record installation in database
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new MarketplaceError('Not authenticated');
    }
    await supabase
      .from('user_installations')
      .insert({
        user_id: session.user.id,
        item_id: itemId,
        enabled: true,
      });

    // Update download count
    await supabase.rpc('increment_downloads', { item_id: itemId });
  }

  async uninstallItem(itemId: string): Promise<void> {
    const item = await this.getItemById(itemId);
    
    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }

    // Uninstall based on item type
    if (item.type === 'plugin') {
      await this.pluginManager.uninstall(itemId);
    } else if (item.type === 'theme') {
      await this.uninstallTheme(itemId);
    }

    // Remove installation record
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new MarketplaceError('Not authenticated');
    }
    await supabase
      .from('user_installations')
      .delete()
      .match({ user_id: session.user.id, item_id: itemId });
  }

  async getUserInstalledItems(): Promise<MarketplaceItem[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new MarketplaceError('Not authenticated');
    }

    const { data, error } = await supabase
      .from('user_installations')
      .select('*, marketplace_items(*)')
      .eq('user_id', session.user.id);

    if (error) {
      throw new MarketplaceError(`Failed to get installed items: ${error.message}`);
    }

    return data.map(item => item.marketplace_items) as MarketplaceItem[];
  }

  async updateItemSettings(itemId: string, settings: Record<string, any>): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new MarketplaceError('Not authenticated');
    }

    const { error } = await supabase
      .from('user_installations')
      .update({ settings })
      .match({ user_id: session.user.id, item_id: itemId });

    if (error) {
      throw new MarketplaceError(`Failed to update settings: ${error.message}`);
    }
  }

  // Reviews and Ratings
  async addReview(itemId: string, rating: number, review?: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new MarketplaceError('Not authenticated');
    }

    const { error } = await supabase
      .from('marketplace_reviews')
      .insert({
        user_id: session.user.id,
        item_id: itemId,
        rating,
        review
      });

    if (error) {
      throw new MarketplaceError(`Failed to add review: ${error.message}`);
    }
  }

  async updateReview(itemId: string, rating: number, review?: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new MarketplaceError('Not authenticated');
    }

    const { error } = await supabase
      .from('marketplace_reviews')
      .update({ rating, review })
      .match({ user_id: session.user.id, item_id: itemId });

    if (error) {
      throw new MarketplaceError(`Failed to update review: ${error.message}`);
    }
  }

  async getItemReviews(itemId: string): Promise<MarketplaceReview[]> {
    const { data, error } = await supabase
      .from('marketplace_reviews')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new MarketplaceError(`Failed to get reviews: ${error.message}`);
    }

    return data as MarketplaceReview[];
  }

  // Publishing
  async publishItem(options: PublishItemOptions): Promise<MarketplaceItem> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new MarketplaceError('Not authenticated');
    }

    // Upload content file to storage
    const contentPath = `marketplace/${options.type}s/${session.user.id}/${options.name}-${options.version}.json`;
    const { error: contentError } = await supabase.storage
      .from('marketplace')
      .upload(contentPath, options.content);

    if (contentError) {
      throw new MarketplaceError(`Failed to upload content: ${contentError.message}`);
    }

    // Upload preview image if provided
    let previewImageUrl = null;
    if (options.preview_images?.[0]) {
      const imagePath = `marketplace/${options.type}s/${session.user.id}/${options.name}-preview.png`;
      const { error: imageError, data } = await supabase.storage
        .from('marketplace')
        .upload(imagePath, options.preview_images[0]);

      if (imageError) {
        // Cleanup content file on error
        await supabase.storage.from('marketplace').remove([contentPath]);
        throw new MarketplaceError(`Failed to upload preview image: ${imageError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('marketplace')
        .getPublicUrl(imagePath);
      
      previewImageUrl = publicUrl;
    }

    // Create marketplace item
    const { data, error } = await supabase
      .from('marketplace_items')
      .insert({
        name: options.name,
        description: options.description,
        type: options.type,
        category: options.category,
        tags: options.tags,
        version: options.version,
        author_id: session.user.id,
        content_url: contentPath,
        preview_images: previewImageUrl ? [previewImageUrl] : [],
        downloads: 0,
        rating: 0,
        review_count: 0
      })
      .select()
      .single();

    if (error) {
      // Cleanup files on error
      await supabase.storage.from('marketplace').remove([contentPath]);
      if (previewImageUrl) {
        await supabase.storage.from('marketplace').remove([`marketplace/${options.type}s/${session.user.id}/${options.name}-preview.png`]);
      }
      throw new MarketplaceError(`Failed to publish item: ${error.message}`);
    }

    return data as MarketplaceItem;
  }

  async updateItem(itemId: string, updates: Partial<MarketplaceItem>): Promise<MarketplaceItem> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new MarketplaceError('Not authenticated');
    }

    const { data, error } = await supabase
      .from('marketplace_items')
      .update(updates)
      .eq('id', itemId)
      .eq('author_id', session.user.id)
      .select()
      .single();

    if (error) {
      throw new MarketplaceError(`Failed to update item: ${error.message}`);
    }

    return data as MarketplaceItem;
  }

  async unpublishItem(itemId: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new MarketplaceError('Not authenticated');
    }

    const { error } = await supabase
      .from('marketplace_items')
      .delete()
      .eq('id', itemId)
      .eq('author_id', session.user.id);

    if (error) {
      throw new MarketplaceError(`Failed to unpublish item: ${error.message}`);
    }
  }

  private convertToPluginDefinition(content: any): PluginDefinition {
    // Validate plugin content
    if (!content.metadata || !content.initialize || !content.activate || !content.deactivate) {
      throw new Error('Invalid plugin content structure');
    }

    return {
      metadata: content.metadata,
      initialize: content.initialize,
      activate: content.activate,
      deactivate: content.deactivate,
      getAPI: content.getAPI,
    };
  }

  private async installTheme(theme: ThemeDefinition): Promise<void> {
    // Implement theme installation logic here
  }

  private async uninstallTheme(itemId: string): Promise<void> {
    // Implement theme uninstallation logic here
  }
}

// Export a singleton instance
export const marketplaceSDK = new MarketplaceSDK(new LoomityPluginManager());
