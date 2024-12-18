'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Grid, List, MoreVertical, FileText, 
  Clock, Copy, Star, StarOff, Pencil, Pin
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
import { type Document, type DocumentView } from '@/types/documents';
import { getDocuments, createDocument, deleteDocument, updateDocument, toggleDocumentPin, toggleDocumentFavorite } from '@/lib/api';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek, format, formatDistance } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type DocumentGroup = {
  title: string;
  documents: Document[];
};

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<DocumentView>('gallery');
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const newDoc = await createDocument({
        title: 'Untitled',
        content: '{}',
        parent_id: null,
        is_template: false,
      });
      
      await router.push(`/dashboard/documents/${newDoc.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "Error",
        description: "Failed to create document",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments(docs => docs.filter(d => d.id !== id));
      toast({
        title: "Success",
        description: "Document deleted",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateDocument = async (doc: Document) => {
    try {
      const newDoc = await createDocument({
        title: `${doc.title} (Copy)`,
        content: doc.content,
        parent_id: doc.parent_id,
        is_template: doc.is_template,
      });
      
      toast({
        title: "Success",
        description: "Document duplicated",
      });
      
      loadDocuments();
    } catch (error) {
      console.error('Error duplicating document:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate document",
        variant: "destructive",
      });
    }
  };

  const handleTogglePin = async (doc: Document) => {
    try {
      await toggleDocumentPin(doc.id, !doc.is_pinned);
      setDocuments(docs => 
        docs.map(d => 
          d.id === doc.id ? { ...d, is_pinned: !d.is_pinned } : d
        )
      );
      toast({
        title: doc.is_pinned ? "Document unpinned" : "Document pinned",
        description: doc.is_pinned ? "Document removed from pinned" : "Document added to pinned",
      });
    } catch (error) {
      console.error('Error toggling document pin:', error);
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async (doc: Document) => {
    try {
      await toggleDocumentFavorite(doc.id, !doc.is_favorite);
      setDocuments(docs => 
        docs.map(d => 
          d.id === doc.id ? { ...d, is_favorite: !d.is_favorite } : d
        )
      );
      toast({
        title: doc.is_favorite ? "Removed from favorites" : "Added to favorites",
        description: doc.is_favorite ? "Document removed from favorites" : "Document added to favorites",
      });
    } catch (error) {
      console.error('Error toggling document favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "destructive",
      });
    }
  };

  const groupDocuments = (docs: Document[]): DocumentGroup[] => {
    const favorites = docs.filter(doc => doc.is_favorite);
    const nonFavorites = docs.filter(doc => !doc.is_favorite);

    const groups: DocumentGroup[] = [];

    if (favorites.length > 0) {
      groups.push({
        title: 'Pinned',
        documents: favorites.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
      });
    }

    const today = nonFavorites.filter(doc => isToday(new Date(doc.updated_at)));
    const yesterday = nonFavorites.filter(doc => isYesterday(new Date(doc.updated_at)));
    const thisWeek = nonFavorites.filter(doc => 
      isThisWeek(new Date(doc.updated_at)) && 
      !isToday(new Date(doc.updated_at)) && 
      !isYesterday(new Date(doc.updated_at))
    );
    const older = nonFavorites.filter(doc => 
      !isThisWeek(new Date(doc.updated_at))
    );

    if (today.length > 0) {
      groups.push({ title: 'Today', documents: today });
    }
    if (yesterday.length > 0) {
      groups.push({ title: 'Yesterday', documents: yesterday });
    }
    if (thisWeek.length > 0) {
      groups.push({ title: 'This Week', documents: thisWeek });
    }
    if (older.length > 0) {
      groups.push({ title: 'Older', documents: older });
    }

    return groups;
  };

  const documentGroups = groupDocuments(documents);

  const DocumentCard = ({ doc }: { doc: Document }) => (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200 hover:shadow-lg',
        doc.is_pinned && 'border-primary/50',
        doc.is_favorite && 'ring-1 ring-yellow-500/20',
        'hover:scale-[1.02] active:scale-[0.98]'
      )}
      onClick={() => router.push(`/dashboard/documents/${doc.id}`)}
    >
      {doc.is_pinned && (
        <div className="absolute top-2 left-2">
          <Pin className="h-4 w-4 text-primary" />
        </div>
      )}
      
      {doc.is_favorite && (
        <div className="absolute top-2 right-2">
          <Star className="h-4 w-4 text-yellow-500" />
        </div>
      )}
      
      <CardHeader className="relative space-y-0 pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium line-clamp-2">
            {doc.title || 'Untitled'}
          </CardTitle>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleTogglePin(doc);
              }}>
                {doc.is_pinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(doc);
              }}>
                {doc.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleDuplicateDocument(doc);
              }}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDocument(doc.id);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Last edited {formatDistance(new Date(doc.updated_at), new Date(), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Documents</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage your documents
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setView(view === 'gallery' ? 'list' : 'gallery')}
            variant="outline"
            size="icon"
            className="h-8 w-8"
          >
            {view === 'gallery' ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid className="h-4 w-4" />
            )}
          </Button>

          <Button onClick={handleCreateDocument} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            New Document
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
            <p className="text-sm text-muted-foreground">Loading documents...</p>
          </div>
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse opacity-20" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse opacity-40" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2 max-w-sm">
            <h3 className="font-semibold text-lg">Create your first document</h3>
            <p className="text-sm text-muted-foreground">
              Get started by creating a new document or use one of our templates
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateDocument}>
              <Plus className="mr-1 h-4 w-4" />
              New Document
            </Button>
            <Button variant="outline">
              Browse Templates
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {documentGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 py-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {group.title}
                </h3>
              </div>
              <div className={cn(
                'grid gap-4',
                view === 'gallery' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
              )}>
                {group.documents.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
