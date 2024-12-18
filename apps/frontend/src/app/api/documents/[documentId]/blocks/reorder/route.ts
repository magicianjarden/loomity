import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;
    const { blockIds, parentBlockId } = await request.json();

    const supabase = createRouteHandlerClient({ cookies });

    // Verify user has access to document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('workspace_id')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    // Call the reorder_blocks function
    const { error } = await supabase.rpc('reorder_blocks', {
      p_document_id: documentId,
      p_parent_block_id: parentBlockId,
      p_block_ids: blockIds,
    });

    if (error) {
      console.error('Error reordering blocks:', error);
      return new NextResponse('Error reordering blocks', { status: 500 });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error in reorder blocks route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
