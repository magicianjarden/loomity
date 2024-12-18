'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { DocumentEditor } from '@/components/editor/document-editor';
import { DocumentBreadcrumb } from '@/components/dashboard/document-breadcrumb';
import { getDocument, updateDocument, createDocument, deleteDocument } from '@/lib/api';
import { 
  MoreVertical, 
  Plus, 
  Share2, 
  Pencil,
  Copy,
  Download,
  Trash,
  Archive,
  History
} from 'lucide-react';
import debounce from 'lodash/debounce';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { 
  Document,
  BreadcrumbItem 
} from '@/types/documents';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [workspace, setWorkspace] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPath, setCurrentPath] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    loadWorkspace();
  }, [params.id]);

  const loadWorkspace = async () => {
    try {
      setLoading(true);
      const doc = await getDocument(params.id as string);
      if (!doc) {
        toast({
          title: "Error",
          description: "Workspace not found",
          variant: "destructive",
        });
        return;
      }
      setWorkspace(doc);
      
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
      console.error('Error loading workspace:', error);
      toast({
        title: "Error",
        description: "Failed to load workspace",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const debouncedUpdate = useCallback(
    debounce(async (updates: Partial<Document>) => {
      try {
        setSaving(true);
        await updateDocument(workspace?.id as string, updates);
        toast({
          title: "Success",
          description: "Changes saved",
        });
      } catch (error) {
        console.error('Error updating workspace:', error);
        toast({
          title: "Error",
          description: "Failed to save changes",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    }, 1000),
    [workspace?.id]
  );

  const handleContentChange = (content: string) => {
    if (!workspace) return;
    setWorkspace({ ...workspace, content });
    debouncedUpdate({ content });
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

  const handleRename = async () => {
    const newTitle = window.prompt('Enter new workspace name:', workspace?.title);
    if (newTitle && workspace) {
      try {
        await updateDocument(workspace.id, { title: newTitle });
        setWorkspace({ ...workspace, title: newTitle });
        toast({
          title: "Success",
          description: "Workspace renamed successfully",
        });
      } catch (error) {
        console.error('Error renaming workspace:', error);
        toast({
          title: "Error",
          description: "Failed to rename workspace",
          variant: "destructive",
        });
      }
    }
  };

  const handleDuplicate = async () => {
    if (!workspace) return;
    try {
      const duplicatedDoc = await createDocument({
        title: `${workspace.title} (Copy)`,
        content: workspace.content,
        is_workspace: true,
        parent_id: workspace.parent_id,
      });
      toast({
        title: "Success",
        description: "Workspace duplicated successfully",
      });
      router.push(`/dashboard/workspaces/${duplicatedDoc.id}`);
    } catch (error) {
      console.error('Error duplicating workspace:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate workspace",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!workspace) return;
    if (window.confirm(`Are you sure you want to delete "${workspace.title}"? This action cannot be undone.`)) {
      try {
        await deleteDocument(workspace.id);
        toast({
          title: "Success",
          description: "Workspace deleted successfully",
        });
        router.push('/dashboard/workspaces');
      } catch (error) {
        console.error('Error deleting workspace:', error);
        toast({
          title: "Error",
          description: "Failed to delete workspace",
          variant: "destructive",
        });
      }
    }
  };

  const handleExport = () => {
    if (!workspace) return;
    const blob = new Blob([workspace.content || ''], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workspace.title}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast({
      title: "Success",
      description: "Workspace exported successfully",
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading workspace...</div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Workspace not found</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center flex-1 gap-4">
          <DocumentBreadcrumb 
            path={currentPath}
            onNavigate={handleBreadcrumbClick}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/dashboard/workspaces/new')}
            className="h-9 px-4 hover:bg-accent/50"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="h-9 px-4 hover:bg-accent/50"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="h-9 w-9 p-0 hover:bg-accent/50"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 border-none shadow-lg rounded-xl bg-white dark:bg-gray-950"
            >
              <DropdownMenuItem className="flex items-center gap-2 py-2.5 px-3 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-900" onClick={handleRename}>
                <Pencil className="h-4 w-4" />
                Rename Workspace
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 py-2.5 px-3 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-900" onClick={handleDuplicate}>
                <Copy className="h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 py-2.5 px-3 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-900" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 py-2.5 px-3 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-900" onClick={() => router.push(`/dashboard/workspaces/${workspace?.id}/history`)}>
                <History className="h-4 w-4" />
                Version History
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 py-2.5 px-3 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-900" onClick={() => router.push(`/dashboard/workspaces/${workspace?.id}/archive`)}>
                <Archive className="h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-2 py-2.5 px-3 cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950"
                onClick={handleDelete}
              >
                <Trash className="h-4 w-4" />
                Delete Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <div className="h-full rounded-xl overflow-hidden shadow-lg">
          <DocumentEditor
            content={workspace.content}
            onChange={handleContentChange}
          />
        </div>
      </div>
    </div>
  );
}
