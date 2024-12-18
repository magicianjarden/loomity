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
  created_at: Date;
  updated_at: Date;
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

        setDocuments(data || []);
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
                return [...prevDocs, payload.new];
              case 'UPDATE':
                return prevDocs.map(doc => 
                  doc.id === payload.new.id ? payload.new : doc
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
