import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { pluginId } = await request.json();

    if (!pluginId) {
      return NextResponse.json(
        { error: 'Plugin ID is required' },
        { status: 400 }
      );
    }

    // Get plugin details from marketplace_items
    const { data: plugin, error: pluginError } = await supabase
      .from('marketplace_items')
      .select('*')
      .eq('id', pluginId)
      .eq('type', 'plugin')
      .single();

    if (pluginError || !plugin) {
      return NextResponse.json(
        { error: 'Plugin not found' },
        { status: 404 }
      );
    }

    // Check if plugin is already installed
    const { data: existing, error: existingError } = await supabase
      .from('installed_plugins')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('plugin_id', pluginId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Plugin already installed' },
        { status: 400 }
      );
    }

    // Install plugin
    const { data: installed, error: installError } = await supabase
      .from('installed_plugins')
      .insert({
        user_id: session.user.id,
        plugin_id: pluginId,
        name: plugin.name,
        version: plugin.version,
        description: plugin.description,
        metadata: plugin.metadata,
        enabled: true, // Enable by default
        configuration: plugin.metadata?.configSchema?.properties 
          ? Object.fromEntries(
              Object.entries(plugin.metadata.configSchema.properties).map(
                ([key, schema]) => [key, schema.default]
              )
            )
          : {}
      })
      .select()
      .single();

    if (installError) {
      return NextResponse.json(
        { error: 'Failed to install plugin' },
        { status: 500 }
      );
    }

    return NextResponse.json(installed);
  } catch (error) {
    console.error('Error installing plugin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
