import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data: plugins, error } = await supabase
      .from('installed_plugins')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) throw error;

    return NextResponse.json(plugins);
  } catch (error) {
    console.error('Error fetching plugin config:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { pluginId, config } = await request.json();

    const { error } = await supabase
      .from('installed_plugins')
      .update({ configuration: config })
      .eq('plugin_id', pluginId)
      .eq('user_id', session.user.id);

    if (error) throw error;

    return new NextResponse('Configuration updated', { status: 200 });
  } catch (error) {
    console.error('Error updating plugin config:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
