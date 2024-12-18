import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth } from '../../../../utils/auth';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function DELETE(request: Request) {
  return withAuth(async (userId) => {
    try {
      const { id, type } = await request.json();

      if (!id || !type) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Get the file path before deletion
      const { data: item, error: fetchError } = await supabase
        .from(type === 'plugin' ? 'plugins' : 'themes')
        .select('file_path, created_by')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Check if user owns the plugin/theme
      if (item.created_by !== userId) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized to delete this item' },
          { status: 403 }
        );
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(type === 'plugin' ? 'plugins' : 'themes')
        .remove([item.file_path]);

      if (storageError) {
        throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from(type === 'plugin' ? 'plugins' : 'themes')
        .delete()
        .eq('id', id);

      if (dbError) {
        throw dbError;
      }

      return NextResponse.json({
        success: true,
        message: `${type} deleted successfully`,
      });
    } catch (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to delete item' },
        { status: 500 }
      );
    }
  });
}
