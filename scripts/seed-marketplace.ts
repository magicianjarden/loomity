import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedMarketplace() {
  try {
    // Read plugin.json
    const pluginPath = path.join(process.cwd(), 'apps/frontend/public/plugins/ai-assistant/plugin.json');
    const pluginContent = JSON.parse(fs.readFileSync(pluginPath, 'utf-8'));

    // Upload to marketplace_items
    const { data, error } = await supabase
      .from('marketplace_items')
      .insert({
        name: pluginContent.name,
        description: pluginContent.description,
        type: pluginContent.type,
        tags: ['ai', 'productivity', 'writing'],
        author_id: process.env.SEED_USER_ID, // You'll need to set this
        version: pluginContent.version,
        content_url: '/plugins/ai-assistant/plugin.json',
        preview_images: pluginContent.preview_images,
        category: pluginContent.category,
      })
      .select();

    if (error) {
      console.error('Error seeding marketplace:', error);
      return;
    }

    console.log('Successfully seeded marketplace:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

seedMarketplace();
