import { supabase } from './supabase';

export async function uploadAvatar(
  file: File,
  userId: string
): Promise<{ error: Error | null; url: string | null }> {
  try {
    if (!file) {
      throw new Error('You must select an image to upload.');
    }

    // Check file size (max 2MB)
    const fileSizeLimit = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > fileSizeLimit) {
      throw new Error('File size must be less than 2MB');
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload file to Supabase storage
    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return { error: null, url: publicUrl };
  } catch (error) {
    return { error: error as Error, url: null };
  }
}

export async function deleteAvatar(url: string): Promise<{ error: Error | null }> {
  try {
    const fileName = url.split('/').pop();
    if (!fileName) {
      throw new Error('Invalid file URL');
    }

    const { error } = await supabase.storage
      .from('avatars')
      .remove([fileName]);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}
