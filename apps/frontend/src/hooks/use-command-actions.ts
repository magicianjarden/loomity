import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

export type CommandAction = {
  execute: () => Promise<void>;
  requiresInput?: boolean;
  inputPlaceholder?: string;
};

export function useCommandActions() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const createFile = useCallback(async (fileName?: string) => {
    if (!fileName) {
      toast.error('Please provide a file name');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('documents').insert({
        title: fileName,
        content: '',
        type: 'file',
        owner_id: user.id,
        path: `/documents/${fileName.toLowerCase().replace(/\s+/g, '-')}`,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      toast.success('File created successfully');
      router.push(`/documents/${fileName.toLowerCase().replace(/\s+/g, '-')}`);
    } catch (error) {
      console.error('Error creating file:', error);
      toast.error('Failed to create file');
    }
  }, [supabase, router]);

  const deleteFile = useCallback(async (fileId?: string) => {
    if (!fileId) {
      toast.error('Please select a file to delete');
      return;
    }

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      toast.success('File deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  }, [supabase, router]);

  const navigateToSettings = useCallback((section?: string) => {
    const path = section ? `/settings/${section}` : '/settings';
    router.push(path);
  }, [router]);

  const showHelp = useCallback(async () => {
    // This will be handled directly in the search UI
    return Promise.resolve();
  }, []);

  const searchFiles = useCallback(async () => {
    router.push('/search?type=file');
  }, [router]);

  const searchPages = useCallback(async () => {
    router.push('/search?type=page');
  }, [router]);

  const searchDocuments = useCallback(async () => {
    router.push('/search?type=document');
  }, [router]);

  return {
    createFile: {
      execute: createFile,
      requiresInput: true,
      inputPlaceholder: 'Enter file name...'
    },
    deleteFile: {
      execute: deleteFile,
      requiresInput: true,
      inputPlaceholder: 'Enter file ID or name...'
    },
    navigateToSettings: {
      execute: () => navigateToSettings(),
    },
    showHelp: {
      execute: showHelp,
    },
    searchFiles: {
      execute: searchFiles,
    },
    searchPages: {
      execute: searchPages,
    },
    searchDocuments: {
      execute: searchDocuments,
    }
  } as const;
}
