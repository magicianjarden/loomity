import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  parent_id: string | null;
  workspace_id: string | null;
  owner_id: string;
  is_template: boolean;
  is_pinned: boolean;
  is_favorite: boolean;
  is_workspace: boolean;
  created_at: string;
  updated_at: string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        setLoading(true);
        
        // Fetch documents from Supabase with new fields
        const { data, error } = await supabase
          .from('documents')
          .select(`
            id,
            title,
            content,
            type,
            parent_id,
            workspace_id,
            owner_id,
            is_template,
            is_pinned,
            is_favorite,
            is_workspace,
            created_at,
            updated_at
          `)
          .order('is_pinned', { ascending: false })
          .order('is_favorite', { ascending: false })
          .order('updated_at', { ascending: false });

        if (error) throw error;

        // Ensure dates are in ISO string format
        const formattedData = data?.map(doc => ({
          ...doc,
          created_at: new Date(doc.created_at).toISOString(),
          updated_at: new Date(doc.updated_at).toISOString(),
        })) || [];

        setDocuments(formattedData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch documents'));
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();

    // Subscribe to changes
    const channel = supabase
      .channel('documents')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
        },
        (payload) => {
          // Update local state based on the change type
          setDocuments(prevDocs => {
            switch (payload.eventType) {
              case 'INSERT':
                return [...prevDocs, {
                  ...payload.new,
                  created_at: new Date(payload.new.created_at).toISOString(),
                  updated_at: new Date(payload.new.updated_at).toISOString(),
                }];
              case 'UPDATE':
                return prevDocs.map(doc => 
                  doc.id === payload.new.id ? {
                    ...payload.new,
                    created_at: new Date(payload.new.created_at).toISOString(),
                    updated_at: new Date(payload.new.updated_at).toISOString(),
                  } : doc
                );
              case 'DELETE':
                return prevDocs.filter(doc => doc.id !== payload.old.id);
              default:
                return prevDocs;
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateLocalDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === id ? { ...doc, ...updates } : doc
      )
    );
  };

  return { 
    documents, 
    loading, 
    error, 
    setDocuments, 
    updateLocalDocument 
  };
}
