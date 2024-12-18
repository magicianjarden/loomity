import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { withAuth } from '../../../../utils/auth';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  return withAuth(async (userId) => {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const name = formData.get('name') as string;
      const type = formData.get('type') as 'plugin' | 'theme';

      if (!file || !name || !type) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Validate file type
      if (!file.name.endsWith('.zip')) {
        return NextResponse.json(
          { success: false, message: 'Only ZIP files are allowed' },
          { status: 400 }
        );
      }

      // Generate unique filename
      const filename = `${randomUUID()}-${file.name}`;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save file to temporary location
      const tempPath = join(process.cwd(), 'temp', filename);
      await writeFile(tempPath, buffer);

      // Upload to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from(type === 'plugin' ? 'plugins' : 'themes')
        .upload(filename, buffer);

      if (storageError) {
        throw storageError;
      }

      // Create database entry
      const { data: dbData, error: dbError } = await supabase
        .from(type === 'plugin' ? 'plugins' : 'themes')
        .insert([
          {
            name,
            file_path: storageData.path,
            status: 'pending',
            created_by: userId,
          },
        ])
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      return NextResponse.json({
        success: true,
        message: `${type} uploaded successfully`,
        plugin: {
          id: dbData.id,
          name: dbData.name,
          type,
          status: dbData.status,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to upload file' },
        { status: 500 }
      );
    }
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
