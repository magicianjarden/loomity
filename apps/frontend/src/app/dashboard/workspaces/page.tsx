'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Grid, List, MoreVertical, FileText, 
  Clock, Copy, Star, StarOff, Pencil, Pin, Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { type Workspace } from '@/types/workspace';
import { getDocuments, createDocument, deleteDocument, updateDocument, toggleDocumentPin, toggleDocumentFavorite } from '@/lib/api';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type WorkspaceGroup = {
  title: string;
  workspaces: Workspace[];
};

type SortOption = 'updated' | 'created' | 'name';

export default function WorkspacesPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const { toast } = useToast();

  useEffect(() => {
    loadWorkspaces();
    loadDocuments();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const docs = await getDocuments();
      setWorkspaces(docs.filter(doc => doc.is_workspace));
    } catch (error) {
      console.error('Error loading workspaces:', error);
      toast({
        title: "Error",
        description: "Failed to load workspaces",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs.filter(doc => !doc.is_workspace));
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    }
  };

  const handleCreateWorkspace = async () => {
    try {
      const newWorkspace = await createDocument({
        title: 'Untitled Workspace',
        is_workspace: true,
      });
      await router.push(`/dashboard/workspaces/${newWorkspace.id}`);
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: "Error",
        description: "Failed to create workspace",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWorkspace = async (workspace: Workspace) => {
    try {
      // Delete all documents in the workspace first
      const docsInWorkspace = documents.filter(doc => doc.workspace_id === workspace.id);
      for (const doc of docsInWorkspace) {
        await deleteDocument(doc.id);
      }

      // Then delete the workspace itself
      await deleteDocument(workspace.id);
      
      // Refresh the lists
      await loadWorkspaces();
      await loadDocuments();

      toast({
        title: "Success",
        description: "Workspace deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        title: "Error",
        description: "Failed to delete workspace",
        variant: "destructive",
      });
    }
  };

  const sortWorkspaces = (workspaces: Workspace[]): Workspace[] => {
    return [...workspaces].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });
  };

  const groupWorkspaces = (workspaces: Workspace[]): WorkspaceGroup[] => {
    const groups: WorkspaceGroup[] = [];
    const now = new Date('2024-12-15T19:22:54-05:00');

    // First add pinned workspaces
    const pinnedWorkspaces = workspaces.filter(w => w.is_pinned);
    if (pinnedWorkspaces.length > 0) {
      groups.push({
        title: 'Pinned',
        workspaces: sortWorkspaces(pinnedWorkspaces)
      });
    }

    // Then add recent workspaces
    const recentWorkspaces = workspaces.filter(w => 
      !w.is_pinned && 
      (isToday(new Date(w.updated_at)) || isYesterday(new Date(w.updated_at)))
    );
    if (recentWorkspaces.length > 0) {
      groups.push({
        title: 'Recent',
        workspaces: sortWorkspaces(recentWorkspaces)
      });
    }

    // Add all other workspaces
    const otherWorkspaces = workspaces.filter(w => 
      !w.is_pinned && 
      !isToday(new Date(w.updated_at)) && 
      !isYesterday(new Date(w.updated_at))
    );
    if (otherWorkspaces.length > 0) {
      groups.push({
        title: 'All Workspaces',
        workspaces: sortWorkspaces(otherWorkspaces)
      });
    }

    return groups;
  };

  // Color schemes for cards
  const colorSchemes = [
    {
      gradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50',
      icon: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
    },
    {
      gradient: 'from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50',
      icon: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
    },
    {
      gradient: 'from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50',
      icon: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
    },
    {
      gradient: 'from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50',
      icon: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
    },
    {
      gradient: 'from-cyan-50 to-sky-50 dark:from-cyan-950/50 dark:to-sky-950/50',
      icon: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400'
    }
  ];

  // Function to get a random color scheme
  const getRandomColorScheme = (id: string) => {
    // Use the workspace ID to consistently get the same color for the same workspace
    const index = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0) % colorSchemes.length;
    return colorSchemes[index];
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workspaces</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Date Created</option>
              <option value="name">Name</option>
            </select>
          </div>
          <Button onClick={handleCreateWorkspace}>
            <Plus className="h-4 w-4 mr-2" />
            New Workspace
          </Button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : workspaces.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No workspaces yet</p>
          <Button onClick={handleCreateWorkspace} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create your first workspace
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {groupWorkspaces(workspaces).map((group) => (
            <div key={group.title}>
              <h2 className="text-lg font-semibold mb-4">{group.title}</h2>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {group.workspaces.map((workspace) => {
                  const colorScheme = getRandomColorScheme(workspace.id);
                  return (
                    <Card 
                      key={workspace.id}
                      className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => router.push(`/dashboard/workspaces/${workspace.id}`)}
                    >
                      <div className={cn("absolute inset-0 bg-gradient-to-br", colorScheme.gradient)} />
                      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {workspace.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <div className={cn("rounded-full p-2", colorScheme.icon)}>
                            <FileText className="h-4 w-4" />
                          </div>
                          <WorkspaceActions workspace={workspace} onDelete={handleDeleteWorkspace} />
                        </div>
                      </CardHeader>
                      <CardContent className="relative">
                        <div className="text-xs text-muted-foreground">
                          Updated {formatDistanceToNow(new Date(workspace.updated_at))} ago
                        </div>
                        {workspace.is_pinned && (
                          <Badge variant="secondary" className="mt-2">
                            Pinned
                          </Badge>
                        )}
                        <div className="mt-4 text-sm text-muted-foreground">
                          {documents.filter(d => d.parent_id === workspace.id).length} documents
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WorkspaceActions({ workspace, onDelete }: { workspace: Workspace; onDelete: (workspace: Workspace) => void }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleRename = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newTitle = window.prompt('Enter new workspace name:', workspace.title);
    if (newTitle) {
      try {
        await updateDocument(workspace.id, { title: newTitle });
        toast({
          title: "Success",
          description: "Workspace renamed successfully",
        });
        window.location.reload();
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

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleDocumentPin(workspace.id, !workspace.is_pinned);
      toast({
        title: "Success",
        description: workspace.is_pinned ? "Workspace unpinned" : "Workspace pinned",
      });
      window.location.reload();
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: "Error",
        description: "Failed to update workspace",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleDocumentFavorite(workspace.id, !workspace.is_favorite);
      toast({
        title: "Success",
        description: workspace.is_favorite ? "Removed from favorites" : "Added to favorites",
      });
      window.location.reload();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update workspace",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${workspace.title}"? This action cannot be undone.`)) {
      onDelete(workspace);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 border-none shadow-lg rounded-xl bg-white dark:bg-gray-950" 
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem className="flex items-center gap-2 py-2.5 px-3 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-900" onClick={handleRename}>
          <Pencil className="h-4 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 py-2.5 px-3 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-900" onClick={handleDuplicate}>
          <Copy className="h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 py-2.5 px-3 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-900" onClick={handleTogglePin}>
          <Pin className="h-4 w-4" />
          {workspace.is_pinned ? 'Unpin' : 'Pin to Top'}
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 py-2.5 px-3 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-900" onClick={handleToggleFavorite}>
          {workspace.is_favorite ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
          {workspace.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-800" />
        <DropdownMenuItem 
          className="flex items-center gap-2 py-2.5 px-3 cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
