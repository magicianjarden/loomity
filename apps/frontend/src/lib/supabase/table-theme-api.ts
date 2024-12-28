import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface TableTheme {
  id: string;
  name: string;
  description: string;
  preview_url: string;
  price: number;
  author_id: string;
  default_config: {
    header: {
      background: string;
      text: string;
      border: string;
    };
    body: {
      background: string;
      text: string;
      border: string;
      alternateBackground?: string;
    };
    row: {
      hover: string;
      selected: string;
    };
    cell: {
      padding: string;
      fontSize: string;
    };
  };
}

export const tableThemeApi = {
  async listThemes(): Promise<TableTheme[]> {
    const { data, error } = await supabase
      .from('table_themes')
      .select('*');

    if (error) throw error;
    return data;
  },

  async getTheme(themeId: string): Promise<TableTheme> {
    const { data, error } = await supabase
      .from('table_themes')
      .select('*')
      .eq('id', themeId)
      .single();

    if (error) throw error;
    return data;
  },

  async applyTheme(tableId: string, themeId: string, config?: any): Promise<void> {
    const { error } = await supabase
      .from('tables')
      .update({
        theme_id: themeId,
        theme_config: config || {},
        updated_at: new Date().toISOString(),
      })
      .eq('id', tableId);

    if (error) throw error;
  },

  async removeTheme(tableId: string): Promise<void> {
    const { error } = await supabase
      .from('tables')
      .update({
        theme_id: null,
        theme_config: {},
        updated_at: new Date().toISOString(),
      })
      .eq('id', tableId);

    if (error) throw error;
  },
};
