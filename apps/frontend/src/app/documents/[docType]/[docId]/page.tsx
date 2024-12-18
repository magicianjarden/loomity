'use client';

import { useEffect, useState } from 'react';
import { DocumentEditor } from '@/components/editor/document-editor';
import { DocumentTypeSelector } from '@/components/document-type-selector';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function DocumentPage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadDocument() {
      if (!params.docId) return;

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', params.docId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading document:', error);
        return;
      }

      if (!data) {
        // Handle case where document doesn't exist
        setContent('');
        setIsLoading(false);
        return;
      }

      setContent(data?.content || '');
      setIsLoading(false);
    }

    loadDocument();
  }, [params.docId, supabase]);

  const handleChange = async (newContent: string) => {
    setContent(newContent);
    
    if (!params.docId) return;

    await supabase
      .from('documents')
      .update({ 
        content: newContent,
        type: params.docType
      })
      .eq('id', params.docId);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <DocumentTypeSelector 
          currentType={params.docType as string} 
          documentId={params.docId as string} 
        />
      </div>
      <DocumentEditor
        content={content}
        onChange={handleChange}
        editable={true}
      />
    </div>
  );
}
