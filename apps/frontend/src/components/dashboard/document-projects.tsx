import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, ChevronDown, Plus, MoreHorizontal, Pencil, 
  ChevronUp, ChevronDownIcon, Smile, Clock, Folder, File,
  MoreVertical, FileText, Trash2, Layout
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { Document } from '@/types/document';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import EmojiPicker from '@/plugins/emoji-picker';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

interface DocumentProjectsProps {
  documents: Document[];
  onUpdateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  onCreateDocument: (parentId?: string) => Promise<void>;
  onMoveDocument: (documentId: string, destinationId: string | null, position: number) => Promise<void>;
  currentWorkspaceId?: string;
  onDocumentUpdate?: (updatedDoc: Document) => void;
  createWorkspace: () => Promise<Document>;
  setCurrentWorkspace: (workspace: Document) => void;
  setDocuments: (documents: Document[]) => void;
}

interface DocumentTreeItem extends Document {
  level: number;
  children?: DocumentTreeItem[];
}

interface DocumentActionsProps {
  doc: Document;
  onEdit: () => void;
  onDelete: () => void;
  onCreateChild: () => void;
}

const DocumentActions = ({ doc, onEdit, onDelete, onCreateChild }: DocumentActionsProps) => {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-accent"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      >
        <Pencil className="h-3 w-3" />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-accent"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            onCreateChild();
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}>
            <Pencil className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Are you sure you want to delete "${doc.title}"? This action cannot be undone.`)) {
                onDelete();
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export function DocumentProjects({ 
  documents, 
  onUpdateDocument,
  onCreateDocument,
  onMoveDocument,
  currentWorkspaceId,
  onDocumentUpdate,
  createWorkspace,
  setCurrentWorkspace,
  setDocuments
}: DocumentProjectsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter and sort documents based on workspace context
  const workspaceDocuments = useMemo(() => {
    if (!currentWorkspaceId) {
      // Show only workspaces in the All Workspaces view
      return documents
        .filter(doc => doc.is_workspace)
        .sort((a, b) => (a.position || 0) - (b.position || 0));
    }

    // Get current workspace and its direct children
    const workspace = documents.find(doc => doc.id === currentWorkspaceId);
    if (!workspace) return [];

    return [
      workspace,
      ...documents
        .filter(doc => doc.workspace_id === currentWorkspaceId && !doc.parent_id)
        .sort((a, b) => (a.position || 0) - (b.position || 0))
    ];
  }, [documents, currentWorkspaceId]);

  // Get the current workspace document for the header
  const currentWorkspace = useMemo(() => {
    if (!currentWorkspaceId) return null;
    return documents.find(doc => doc.id === currentWorkspaceId);
  }, [documents, currentWorkspaceId]);

  // Get child documents for a parent
  const getChildDocuments = useCallback((parentId: string) => {
    return documents
      .filter(doc => doc.parent_id === parentId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [documents]);

  // Build the document tree for the current context
  const documentTree = useMemo(() => {
    const buildTree = (docs: Document[], level: number = 0): DocumentTreeItem[] => {
      return docs.map(doc => ({
        ...doc,
        level,
        children: getChildDocuments(doc.id).length > 0 ? 
          buildTree(getChildDocuments(doc.id), level + 1) : 
          undefined
      }));
    };

    return buildTree(workspaceDocuments);
  }, [workspaceDocuments, getChildDocuments]);

  // Auto-expand the current workspace
  useEffect(() => {
    if (currentWorkspaceId) {
      setExpandedProjects(prev => new Set([...prev, currentWorkspaceId]));
    }
  }, [currentWorkspaceId]);

  const recentProjects = useMemo(() => {
    // Only show recent documents from the current workspace
    const relevantDocs = currentWorkspaceId ? 
      documents.filter(doc => doc.workspace_id === currentWorkspaceId && !doc.is_workspace) :
      documents.filter(doc => doc.is_workspace);

    return relevantDocs
      .filter(doc => {
        const modifiedDate = new Date(doc.updated_at);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return modifiedDate > sevenDaysAgo;
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  }, [documents, currentWorkspaceId]);

  const toggleExpanded = (id: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = documents.map(doc => doc.id);
    setExpandedProjects(new Set(allIds));
  };

  const collapseAll = () => {
    setExpandedProjects(new Set());
  };

  // Handle drag and drop
  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Don't do anything if dropped in same location
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const draggedDoc = documents.find((doc) => doc.id === draggableId);
    const targetDoc = documents.find((doc) => doc.id === destination.droppableId);
    
    if (!draggedDoc) return;

    // Case 1: Dropping onto another document to make it a child
    if (destination.droppableId !== source.droppableId && targetDoc) {
      // Don't allow dropping on itself or its children
      if (
        draggedDoc.id === targetDoc.id ||
        getChildDocuments(draggedDoc.id).some(d => d.id === targetDoc.id)
      ) {
        return;
      }

      try {
        await onUpdateDocument(draggedDoc.id, {
          parent_id: targetDoc.id,
          workspace_id: targetDoc.workspace_id,
          position: destination.index
        });
      } catch (error) {
        console.error('Failed to update document parent:', error);
      }
      return;
    }

    // Case 2: Reordering within same parent
    const newDocuments = Array.from(documents);
    const movedDoc = newDocuments.find((doc) => doc.id === draggableId);
    if (!movedDoc) return;

    // Remove from old position
    newDocuments.splice(source.index, 1);
    // Insert at new position
    newDocuments.splice(destination.index, 0, movedDoc);

    // Update positions
    try {
      await onUpdateDocument(movedDoc.id, {
        position: destination.index
      });
    } catch (error) {
      console.error('Failed to update document position:', error);
    }
  };

  const startEditing = (doc: Document) => {
    setEditingId(doc.id);
    setEditingTitle(doc.title || '');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const updateLocalDocument = (id: string, updates: Partial<Document>) => {
    const updatedDocuments = documents.map(doc => doc.id === id ? { ...doc, ...updates } : doc);
    // Update local state immediately
    // This is a placeholder, you should update the local state according to your needs
  };

  const handleTitleUpdate = async (id: string) => {
    if (!editingId) return;

    try {
      await onUpdateDocument(id, { title: editingTitle });
      setEditingId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error updating title:', error);
      toast({
        title: 'Error',
        description: 'Failed to update title',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive'
      });
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent, doc: Document) => {
    if (e.key === 'ArrowRight' && !expandedProjects.has(doc.id)) {
      e.preventDefault();
      toggleExpanded(doc.id);
    } else if (e.key === 'ArrowLeft' && expandedProjects.has(doc.id)) {
      e.preventDefault();
      toggleExpanded(doc.id);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      router.push(`/dashboard/workspaces/${doc.id}`);
    }
  }, [expandedProjects, router]);

  const handleEmojiSelect = async (docId: string, emoji: string) => {
    await onUpdateDocument(docId, { emoji });
    setEmojiPickerOpen(null);
  };

  const renderDocumentContent = (doc: DocumentTreeItem) => {
    if (editingId === doc.id) {
      return (
        <Input
          ref={inputRef}
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onBlur={() => handleTitleUpdate(doc.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleTitleUpdate(doc.id);
            } else if (e.key === 'Escape') {
              setEditingId(null);
            }
          }}
          className="h-6 px-2 py-1 text-sm"
          autoFocus
        />
      );
    }

    return (
      <button
        onClick={() => {
          const path = doc.is_workspace 
            ? `/dashboard/workspaces/${doc.id}`
            : `/dashboard/workspaces/documents/${doc.id}`;
          router.push(path);
        }}
        className="flex-1 text-left truncate text-sm hover:text-foreground transition-colors"
      >
        {doc.title}
      </button>
    );
  };

  const renderDocumentItem = (doc: DocumentTreeItem, index: number) => {
    const isExpanded = expandedProjects.has(doc.id);
    
    return (
      <React.Fragment key={doc.id}>
        <Draggable draggableId={doc.id} index={index}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={cn(
                'group flex items-center gap-2 rounded-lg px-2 py-1 text-sm',
                'hover:bg-accent/50',
                snapshot.isDragging && 'bg-accent/50 opacity-50',
                doc.id === editingId && 'bg-accent'
              )}
              style={{
                ...provided.draggableProps.style,
                paddingLeft: `${doc.level * 12 + 8}px`
              }}
            >
              <div {...provided.dragHandleProps} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1">
                  {doc.children && doc.children.length > 0 ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(doc.id);
                      }}
                      className="h-4 w-4 shrink-0 hover:bg-accent/50 rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  ) : (
                    <div className="w-4" /> // Spacer for alignment
                  )}
                  {doc.icon ? (
                    <span 
                      className="cursor-pointer" 
                      onClick={() => setEmojiPickerOpen(doc.id)}
                    >
                      {doc.icon}
                    </span>
                  ) : (
                    doc.is_workspace ? (
                      <Layout className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )
                  )}
                </div>

                {editingId === doc.id ? (
                  <Input
                    ref={inputRef}
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => handleTitleUpdate(doc.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTitleUpdate(doc.id);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                    className="h-7 flex-1 min-w-0"
                    autoFocus
                  />
                ) : (
                  <span 
                    className="flex-1 truncate cursor-pointer"
                    onClick={() => {
                      const path = doc.is_workspace 
                        ? `/dashboard/workspaces/${doc.id}`
                        : `/dashboard/workspaces/documents/${doc.id}`;
                      router.push(path);
                    }}
                  >
                    {doc.title}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateDocument(doc.id);
                  }}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="h-3 w-3" />
                </Button>

                <DocumentActions 
                  doc={doc}
                  onEdit={() => {
                    setEditingId(doc.id);
                    setEditingTitle(doc.title);
                  }}
                  onDelete={() => handleDeleteDocument(doc.id)}
                  onCreateChild={() => onCreateDocument(doc.id)}
                />
              </div>
            </div>
          )}
        </Draggable>
        {isExpanded && doc.children && doc.children.length > 0 && (
          <Droppable droppableId={doc.id}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="ml-4"
              >
                {doc.children.map((child, index) => 
                  renderDocumentItem(child, index)
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </React.Fragment>
    );
  };

  const handleCreateWorkspace = async () => {
    try {
      const newWorkspace = await createWorkspace();
      // Set current workspace before navigation
      setCurrentWorkspace(newWorkspace);
      // Add to documents if not already present
      setDocuments(prevDocs => {
        if (!prevDocs.find(d => d.id === newWorkspace.id)) {
          return [...prevDocs, newWorkspace];
        }
        return prevDocs;
      });
      router.push(`/dashboard/workspaces/${newWorkspace.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create workspace',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Workspace Controls */}
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center w-full gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentWorkspace(null);
              router.push('/dashboard/workspaces');
            }}
            className={cn(
              "flex-1 justify-start h-8 text-sm font-medium",
              "hover:bg-accent/50",
              !currentWorkspaceId && "bg-accent/50"
            )}
          >
            <Layout className="h-4 w-4 mr-2" />
            All Workspaces
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={createWorkspace}
            className="h-8 w-8 p-0 hover:bg-accent/50"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-2 py-2">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="root">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-1"
                >
                  {documentTree.map((doc, index) => 
                    renderDocumentItem(doc, index)
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </ScrollArea>
    </div>
  );
}
