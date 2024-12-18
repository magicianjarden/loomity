'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { DocumentEditor } from '@/components/editor/document-editor';
import { DocumentBreadcrumb } from '@/components/dashboard/document-breadcrumb';
import { getDocument, updateDocument } from '@/lib/api';
import { Share2, MoreVertical } from 'lucide-react';
import debounce from 'lodash/debounce';
import type { 
  Document,
  BreadcrumbItem 
} from '@/types/documents';

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPath, setCurrentPath] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    loadDocument();
  }, [params.id]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const doc = await getDocument(params.id as string);
      if (!doc) {
        toast({
          title: "Error",
          description: "Document not found",
          variant: "destructive",
        });
        return;
      }
      setDocument(doc);
      
      // Build the breadcrumb path by traversing parent_id
      const breadcrumbPath: BreadcrumbItem[] = [];
      let currentDoc = doc;
      
      // Add the current document
      breadcrumbPath.unshift({
        id: currentDoc.id,
        title: currentDoc.title,
        type: currentDoc.is_workspace ? 'folder' : 'document'
      });

      // Traverse up the parent chain
      while (currentDoc.parent_id) {
        const parentDoc = await getDocument(currentDoc.parent_id);
        if (!parentDoc) break;
        
        breadcrumbPath.unshift({
          id: parentDoc.id,
          title: parentDoc.title,
          type: parentDoc.is_workspace ? 'folder' : 'document'
        });
        currentDoc = parentDoc;
      }

      // Always add root at the start
      breadcrumbPath.unshift({ 
        id: 'root', 
        title: 'Workspaces', 
        type: 'folder' 
      });

      setCurrentPath(breadcrumbPath);
    } catch (error) {
      console.error('Error loading document:', error);
      toast({
        title: "Error",
        description: "Failed to load document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBreadcrumbClick = async (id: string) => {
    if (id === 'root') {
      router.push('/dashboard/workspaces');
    } else {
      const doc = await getDocument(id);
      if (doc) {
        if (doc.is_workspace) {
          router.push(`/dashboard/workspaces/${id}`);
        } else {
          router.push(`/dashboard/workspaces/documents/${id}`);
        }
      }
    }
  };

  const saveDocument = useCallback(
    debounce(async (updates: Partial<Document>) => {
      if (!document) return;
      
      try {
        setSaving(true);
        await updateDocument(document.id, updates);
        toast({
          title: "Success",
          description: "Document saved",
        });
      } catch (error) {
        console.error('Error saving document:', error);
        toast({
          title: "Error",
          description: "Failed to save document",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    }, 1000),
    [document]
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <DocumentBreadcrumb 
          path={currentPath}
          onNavigate={handleBreadcrumbClick}
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <DocumentEditor
          content={document?.content || ''}
          onChange={(content) => saveDocument({ content })}
        />
      </div>
    </div>
  );
}
