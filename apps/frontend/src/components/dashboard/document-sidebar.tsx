'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { File, Folder, ChevronDown, ChevronRight, Plus, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Document {
  id: string;
  title: string;
  type: 'file' | 'folder';
  children?: Document[];
}

interface DocumentSidebarProps {
  documents: Document[];
  currentDocumentId?: string;
}

export function DocumentSidebar({ documents, currentDocumentId }: DocumentSidebarProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateDocument = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: 'Untitled Document',
          content: '',
          type: 'file',
          owner_id: user.id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Document created');
      router.push(`/dashboard/documents/${data.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
    }
  };

  const renderDocumentItem = (doc: Document) => {
    const isFolder = doc.type === 'folder';
    const isExpanded = expandedFolders.has(doc.id);
    const isActive = doc.id === currentDocumentId;

    return (
      <div key={doc.id} className="space-y-1">
        <div
          className={cn(
            'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
            isActive && 'bg-accent text-accent-foreground'
          )}
        >
          <button
            onClick={() => isFolder ? toggleFolder(doc.id) : router.push(`/dashboard/documents/${doc.id}`)}
            className="flex-1 flex items-center gap-2"
          >
            {isFolder ? (
              <>
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <Folder className="h-4 w-4" />
              </>
            ) : (
              <File className="h-4 w-4" />
            )}
            <span className="flex-1 truncate">{doc.title}</span>
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isFolder && isExpanded && doc.children && (
          <div className="ml-4 space-y-1">
            {doc.children.map(renderDocumentItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-lg font-semibold tracking-tight">Documents</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCreateDocument}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">New document</span>
        </Button>
      </div>
      <div className="flex-1 overflow-auto px-2">
        {documents.map(renderDocumentItem)}
      </div>
    </div>
  );
}
