import {
  Template,
  TemplateMetadata,
  TemplateContent,
  TemplateSearchParams,
  TemplateCategory,
  TemplateAccess,
} from './types';
import { supabase } from '@/lib/supabase';

export class TemplateStore {
  async searchTemplates(params: TemplateSearchParams): Promise<Template[]> {
    let query = supabase
      .from('templates')
      .select(`
        *,
        profiles!templates_author_id_fkey (id, full_name, username),
        template_stats(uses, rating, reviews)
      `);

    if (params.query) {
      query = query.ilike('name', `%${params.query}%`);
    }

    if (params.category) {
      query = query.eq('category', params.category);
    }

    if (params.tags?.length) {
      query = query.contains('tags', params.tags);
    }

    if (params.access) {
      query = query.eq('access', params.access);
    }

    if (params.author) {
      query = query.eq('author_id', params.author);
    }

    if (params.pricing && params.pricing !== 'all') {
      query = query.eq('pricing->type', params.pricing);
    }

    // Add sorting
    if (params.sort_by) {
      const order = params.sort_order || 'desc';
      if (params.sort_by === 'rating') {
        query = query.order('rating', { foreignTable: 'template_stats', ascending: order === 'asc' });
      } else if (params.sort_by === 'uses') {
        query = query.order('uses', { foreignTable: 'template_stats', ascending: order === 'asc' });
      } else {
        query = query.order(params.sort_by, { ascending: order === 'asc' });
      }
    }

    // Add pagination
    if (params.limit) {
      query = query.limit(params.limit);
    }
    if (params.page && params.limit) {
      const offset = (params.page - 1) * params.limit;
      query = query.range(offset, offset + params.limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }

    return data || [];
  }

  async getTemplate(id: string): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .select(`
        *,
        profiles!templates_author_id_fkey (id, full_name, username),
        template_stats(uses, rating, reviews),
        content:template_contents(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Template;
  }

  async createTemplate(template: Omit<Template, 'id' | 'created_at' | 'updated_at' | 'template_stats' | 'profiles'>): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .insert({
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        version: template.version,
        access: template.access,
        featured: template.featured,
        author_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select(`
        *,
        profiles!templates_author_id_fkey (id, full_name, username),
        template_stats(uses, rating, reviews)
      `)
      .single();

    if (error) {
      console.error('Error creating template:', error);
      throw error;
    }

    return data;
  }

  async updateTemplate(id: string, template: Partial<Template>): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .update({
        ...template.metadata,
        content: template.content,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Template;
  }

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async useTemplate(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_template_uses', {
      template_id: id,
    });

    if (error) throw error;
  }

  async rateTemplate(id: string, rating: number, review?: string): Promise<void> {
    const { error } = await supabase
      .from('template_reviews')
      .upsert({
        template_id: id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        rating,
        review,
      });

    if (error) throw error;
  }

  async getFeaturedTemplates(): Promise<Template[]> {
    const { data, error } = await supabase
      .from('templates')
      .select(`
        *,
        profiles!templates_author_id_fkey (id, full_name, username),
        template_stats(uses, rating, reviews)
      `)
      .eq('featured', true)
      .order('rating', { foreignTable: 'template_stats', ascending: false })
      .limit(6);

    if (error) {
      console.error('Error fetching featured templates:', error);
      throw error;
    }

    return data || [];
  }

  async getPopularTemplates(): Promise<Template[]> {
    const { data, error } = await supabase
      .from('templates')
      .select(`
        *,
        profiles!templates_author_id_fkey (id, full_name, username),
        template_stats(uses, rating, reviews)
      `)
      .order('uses', { foreignTable: 'template_stats', ascending: false })
      .limit(10);

    if (error) throw error;
    return data as Template[];
  }

  async getRecommendedTemplates(userId: string): Promise<Template[]> {
    // This would typically involve a more sophisticated recommendation system
    // For now, we'll just return templates in the user's most used categories
    const { data: userStats, error: statsError } = await supabase
      .from('user_template_stats')
      .select('category, uses')
      .eq('user_id', userId)
      .order('uses', { ascending: false })
      .limit(3);

    if (statsError) throw statsError;

    const categories = userStats?.map(stat => stat.category) || [];

    const { data, error } = await supabase
      .from('templates')
      .select(`
        *,
        profiles!templates_author_id_fkey (id, full_name, username),
        template_stats(uses, rating, reviews)
      `)
      .in('category', categories)
      .order('rating', { foreignTable: 'template_stats', ascending: false })
      .limit(6);

    if (error) throw error;
    return data as Template[];
  }

  async getTemplateById(id: string): Promise<Template | null> {
    const { data, error } = await supabase
      .from('templates')
      .select(`
        *,
        profiles!templates_author_id_fkey (id, full_name, username),
        template_stats(uses, rating, reviews)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching template:', error);
      throw error;
    }

    return data;
  }

  async getTemplateContent(id: string): Promise<TemplateContent | null> {
    const { data, error } = await supabase
      .from('template_contents')
      .select('*')
      .eq('template_id', id)
      .single();

    if (error) {
      console.error('Error fetching template content:', error);
      throw error;
    }

    return data;
  }
}
