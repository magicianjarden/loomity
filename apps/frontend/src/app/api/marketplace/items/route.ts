import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { type, category, searchQuery } = await request.json();

    // Get user session for authorization
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
      .from('marketplace_items')
      .select('*');

    // Apply filters
    if (type && type !== 'installed') {
      query = query.eq('type', type);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    const { data: items, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
