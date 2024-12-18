import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | undefined;
  website: string;
  updated_at?: string;
  status?: string;
}

export class ProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileError';
  }
}

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    Authorization: `Bearer ${session?.access_token}`,
  };
}

export async function getUserProfile(): Promise<Profile> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new ProfileError('Not authenticated');
  }

  console.log('Fetching profile for user:', session.user.id);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    if (error.code === 'PGRST116') {
      console.log('Profile not found, creating new profile');
      // If profile doesn't exist, create one
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          full_name: '',
          username: '',
          website: '',
          avatar_url: undefined,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        throw new ProfileError('Failed to create profile');
      }

      console.log('New profile created:', newProfile);
      return newProfile;
    }
    throw new ProfileError('Failed to fetch profile');
  }

  console.log('Profile fetched:', data);
  return data;
}

export async function updateProfile(profile: Partial<Profile>): Promise<Profile> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new ProfileError('Not authenticated');
  }

  console.log('Starting profile update with data:', profile);

  // Validate username format if it's being updated
  if (profile.username) {
    if (profile.username.length < 3) {
      throw new ProfileError('Username must be at least 3 characters long');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(profile.username)) {
      throw new ProfileError('Username can only contain letters, numbers, and underscores');
    }

    console.log('Checking username availability:', profile.username);
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', profile.username)
        .neq('id', session.user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking username:', checkError);
        throw new ProfileError('Error checking username availability');
      }

      if (existingUser) {
        console.log('Username is taken:', profile.username);
        throw new ProfileError('Username is already taken');
      }
      console.log('Username is available:', profile.username);
    } catch (error) {
      console.error('Error in username check:', error);
      throw error;
    }
  }

  // First check if profile exists
  console.log('Checking if profile exists...');
  const { data: existingProfile, error: checkError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking profile:', checkError);
    throw new ProfileError('Error checking profile');
  }

  const updates = {
    id: session.user.id,
    full_name: profile.full_name || '',
    username: profile.username || '',
    website: profile.website || '',
    avatar_url: profile.avatar_url || undefined,
    status: profile.status || '',
    updated_at: new Date().toISOString(),
  };

  console.log('Attempting to update profile with:', updates);
  try {
    if (!existingProfile) {
      // Create new profile
      console.log('Creating new profile...');
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          ...updates,
          created_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw new ProfileError('Failed to create profile');
      }

      console.log('Profile created successfully:', data);
      return data;
    } else {
      // Update existing profile
      console.log('Updating existing profile...');
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw new ProfileError('Failed to update profile');
      }

      if (!data) {
        console.error('No data returned from update');
        throw new ProfileError('Failed to update profile - no data returned');
      }

      console.log('Profile updated successfully:', data);
      return data;
    }
  } catch (error) {
    console.error('Error in profile update:', error);
    throw error;
  }
}

export async function updateUsername(username: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new ProfileError('Not authenticated');
  }

  // Check if username is already taken
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .neq('id', session.user.id)
    .single();

  if (existingUser) {
    throw new ProfileError('Username is already taken');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ username })
    .eq('id', session.user.id);

  if (error) {
    throw error;
  }
}

export async function getUserSettings() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new ProfileError('Not authenticated');
  }

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user settings:', error);
    throw new ProfileError('Failed to fetch user settings');
  }

  return data || {
    email_notifications: true,
    dark_mode: false,
    two_factor_auth: false,
  };
}

export async function updateUserSettings(settings: any) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new ProfileError('Not authenticated');
  }

  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: session.user.id,
      ...settings,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error updating user settings:', error);
    throw new ProfileError('Failed to update user settings');
  }
}

export interface UserActivity {
  id: string;
  user_id: string;
  type: string;
  description: string;
  created_at: string;
}

export async function getUserActivity(): Promise<UserActivity[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new ProfileError('Not authenticated');
  }

  // For now, return an empty array since we haven't set up the activity table yet
  return [];

  // TODO: Implement this once we create the activity table
  /*
  const { data, error } = await supabase
    .from('user_activity')
    .select()
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching user activity:', error);
    throw new ProfileError('Failed to fetch user activity');
  }

  return data || [];
  */
}

export interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  owner_id: string;
  parent_id: string | null;
  is_template: boolean;
  icon?: string;
  cover_image?: string;
}

export interface DocumentBlock {
  id: string;
  document_id: string;
  content: string;
  type: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentPermission {
  id: string;
  document_id: string;
  user_id: string;
  permission_level: 'view' | 'comment' | 'edit' | 'admin';
  created_at: string;
  updated_at: string;
}

// Document APIs
export async function createDocument(data: Partial<Document>): Promise<Document> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  const { data: document, error } = await supabase
    .from('documents')
    .insert([{
      ...data,
      owner_id: session.user.id,
    }])
    .select('*')
    .single();

  if (error) {
    console.error('Error creating document:', error);
    throw error;
  }
  return document;
}

export async function getDocument(id: string): Promise<Document> {
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return document;
}

export async function updateDocument(id: string, data: Partial<Document>): Promise<Document> {
  const { data: updatedDoc, error } = await supabase
    .from('documents')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update document');
  }

  return updatedDoc;
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getDocumentBlocks(documentId: string): Promise<DocumentBlock[]> {
  const { data: blocks, error } = await supabase
    .from('document_blocks')
    .select('*')
    .eq('document_id', documentId)
    .order('position');

  if (error) throw error;
  return blocks;
}

export async function updateDocumentBlock(id: string, data: Partial<DocumentBlock>): Promise<DocumentBlock> {
  const { data: block, error } = await supabase
    .from('document_blocks')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return block;
}

export async function createComment(data: Partial<Comment>): Promise<Comment> {
  const { data: comment, error } = await supabase
    .from('comments')
    .insert([data])
    .select('*')
    .single();

  if (error) throw error;
  return comment;
}

export async function getDocumentComments(documentId: string): Promise<Comment[]> {
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return comments;
}

export async function updateDocumentPermission(
  documentId: string,
  userId: string,
  permission: DocumentPermission['permission_level']
): Promise<void> {
  const { error } = await supabase
    .from('document_permissions')
    .upsert([
      {
        document_id: documentId,
        user_id: userId,
        permission_level: permission,
      },
    ]);

  if (error) throw error;
}

export async function getDocumentPermissions(documentId: string): Promise<DocumentPermission[]> {
  const { data: permissions, error } = await supabase
    .from('document_permissions')
    .select('*')
    .eq('document_id', documentId);

  if (error) throw error;
  return permissions;
}

export async function toggleDocumentPin(id: string, isPinned: boolean): Promise<Document> {
  const { data: document, error } = await supabase
    .from('documents')
    .update({ is_pinned: isPinned })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return document;
}

export async function toggleDocumentFavorite(id: string, isFavorite: boolean): Promise<Document> {
  const { data: document, error } = await supabase
    .from('documents')
    .update({ is_favorite: isFavorite })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return document;
}

export async function getDocuments(): Promise<Document[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .eq('owner_id', session.user.id)
    .order('is_pinned', { ascending: false })
    .order('is_favorite', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }

  return documents || [];
}

export async function getRecentDocuments(limit: number = 5): Promise<Document[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  // First get documents owned by the user
  const { data: ownedDocs, error: ownedError } = await supabase
    .from('documents')
    .select('*')
    .eq('owner_id', session.user.id)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (ownedError) {
    console.error('Error fetching owned documents:', ownedError);
    throw new Error('Failed to fetch owned documents');
  }

  // Then get documents shared with the user through permissions
  const { data: sharedDocs, error: sharedError } = await supabase
    .from('document_permissions')
    .select(`
      document:documents (
        id,
        title,
        content,
        created_at,
        updated_at,
        owner_id,
        parent_id,
        is_template,
        icon,
        cover_image
      )
    `)
    .eq('user_id', session.user.id)
    .order('document(updated_at)', { ascending: false })
    .limit(limit);

  if (sharedError) {
    console.error('Error fetching shared documents:', sharedError);
    throw new Error('Failed to fetch shared documents');
  }

  // Combine and sort the documents
  const allDocs = [
    ...(ownedDocs || []),
    ...(sharedDocs?.map(d => d.document).filter(Boolean) || [])
  ].sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  ).slice(0, limit);

  return allDocs;
}
