import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    console.log('Received publish request');
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get user session for authorization
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }
    if (!session) {
      console.error('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const category = formData.get('category') as string;
    const version = formData.get('version') as string;
    const tags = (formData.get('tags') as string)?.split(',').map(tag => tag.trim()) || [];
    const contentFile = formData.get('content') as File;
    const previewImage = formData.get('preview_image') as File;

    console.log('Form data received:', {
      name,
      description,
      type,
      category,
      version,
      tags,
      hasContentFile: !!contentFile,
      hasPreviewImage: !!previewImage,
      userId: session.user.id
    });

    if (!name || !description || !type || !category || !version || !contentFile) {
      console.error('Missing required fields:', { name, description, type, category, version, contentFile });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upload content file
    const contentPath = `marketplace/${type}s/${session.user.id}/${name}-${version}.json`;
    console.log('Uploading content file to:', contentPath);
    
    try {
      const contentBuffer = await contentFile.arrayBuffer();
      console.log('Content buffer created, size:', contentBuffer.byteLength);
      
      const { error: contentError } = await supabase.storage
        .from('marketplace')
        .upload(contentPath, contentBuffer, {
          contentType: 'application/json',
          upsert: true
        });

      if (contentError) {
        console.error('Content upload error:', contentError);
        return NextResponse.json(
          { error: contentError.message },
          { status: 500 }
        );
      }
    } catch (uploadError) {
      console.error('Error during content file upload:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload content file' },
        { status: 500 }
      );
    }

    // Get the public URL for the content
    const { data: { publicUrl: contentUrl } } = supabase.storage
      .from('marketplace')
      .getPublicUrl(contentPath);

    console.log('Content URL:', contentUrl);

    // Upload preview image if provided
    let previewImageUrl = null;
    if (previewImage) {
      const imagePath = `marketplace/${type}s/${session.user.id}/${name}-preview.png`;
      console.log('Uploading preview image to:', imagePath);
      const imageBuffer = await previewImage.arrayBuffer();
      const { error: imageError } = await supabase.storage
        .from('marketplace')
        .upload(imagePath, imageBuffer, {
          contentType: previewImage.type,
          upsert: true
        });

      if (imageError) {
        // Cleanup content file on error
        console.error('Preview image upload error:', imageError);
        await supabase.storage.from('marketplace').remove([contentPath]);
        return NextResponse.json(
          { error: imageError.message },
          { status: 500 }
        );
      }

      const { data: { publicUrl } } = supabase.storage
        .from('marketplace')
        .getPublicUrl(imagePath);
      
      previewImageUrl = publicUrl;
      console.log('Preview image URL:', previewImageUrl);
    }

    // Create marketplace item
    console.log('Creating marketplace item');
    const { error: itemError } = await supabase
      .from('marketplace_items')
      .insert({
        name,
        description,
        type,
        category,
        version,
        tags,
        author_id: session.user.id,
        content_url: contentUrl,
        preview_images: previewImageUrl ? [previewImageUrl] : [],
        downloads: 0,
        rating: 0,
        review_count: 0
      });

    if (itemError) {
      // Cleanup files on error
      console.error('Database insert error:', itemError);
      await supabase.storage.from('marketplace').remove([contentPath]);
      if (previewImageUrl) {
        await supabase.storage.from('marketplace').remove([`marketplace/${type}s/${session.user.id}/${name}-preview.png`]);
      }
      return NextResponse.json(
        { error: itemError.message },
        { status: 500 }
      );
    }

    console.log('Successfully published item');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
