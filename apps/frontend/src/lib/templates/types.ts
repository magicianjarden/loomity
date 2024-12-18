export type TemplateCategory = 'theme' | 'plugin' | 'integration';
export type TemplateAccess = 'public' | 'private' | 'organization';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  version: string;
  author_id: string;
  profiles: {
    id: string;
    full_name: string;
    username: string;
  };
  template_stats: {
    uses: number;
    rating: number;
    reviews: number;
  };
  access: TemplateAccess;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateMetadata {
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  version: string;
  access: TemplateAccess;
}

export interface TemplateContent {
  template_id: string;
  content: string;
  files: Record<string, string>;
}

export interface TemplateSearchParams {
  query?: string;
  category?: TemplateCategory;
  tags?: string[];
  access?: TemplateAccess;
  author?: string;
  pricing?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
