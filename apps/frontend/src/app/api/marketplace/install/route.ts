import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { itemId } = await request.json();

    // Get user session for authorization
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, get the item details
    const { data: item, error: itemError } = await supabase
      .from('marketplace_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Insert into user_installed_items
    const { error: installError } = await supabase
      .from('user_installed_items')
      .insert({
        user_id: session.user.id,
        item_id: itemId,
        type: item.type,
        status: 'installed',
      });

    if (installError) {
      return NextResponse.json(
        { error: installError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}