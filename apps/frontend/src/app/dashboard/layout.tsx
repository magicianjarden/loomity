'use client';

import * as React from "react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, BookText, Store, MoreHorizontal, 
  File, Settings, Home, FileText, Plus, Grid, Layout, ChevronLeft, ChevronRight, FolderOpen
} from "lucide-react";
import { getUserProfile, type Profile, updateProfile } from "@/lib/api";
import { SettingsTab } from "@/components/dashboard/settings-tab";
import { UserAvatarMenu } from "@/components/dashboard/user-avatar-menu";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DocumentProjects } from "@/components/dashboard/document-projects";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import { useDocuments } from "@/hooks/use-documents";
import { UniversalSearch } from "@/components/dashboard/universal-search";
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type SidebarContext = 'home' | 'docs' | 'marketplace' | 'other';

const sidebarItems = [
  { 
    value: 'home', 
    icon: <LayoutDashboard className="lucide lucide-layout-dashboard h-4 w-4" aria-hidden="true" />, 
    label: 'Home' 
  },
  { 
    value: 'docs', 
    icon: <BookText className="lucide lucide-book-text h-4 w-4" aria-hidden="true" />, 
    label: 'Documents' 
  },
  { 
    value: 'marketplace', 
    icon: <Store className="lucide lucide-store h-4 w-4" aria-hidden="true" />, 
    label: 'Marketplace' 
  },
  { 
    value: 'other', 
    icon: <MoreHorizontal className="lucide lucide-more-horizontal h-4 w-4" aria-hidden="true" />, 
    label: 'Other' 
  },
];

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { params } = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [sidebarContext, setSidebarContext] = useState<SidebarContext>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const pathname = usePathname();
  const { toast } = useToast();
  const { documents, loading: documentsLoading, setDocuments } = useDocuments();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [currentWorkspace, setCurrentWorkspace] = useState<any | null>(null);
  
  // Update sidebar context based on pathname
  useEffect(() => {
    if (pathname.includes('/workspaces')) {
      setSidebarContext('docs');
    } else if (pathname.includes('/marketplace')) {
      setSidebarContext('marketplace');
    } else if (pathname.includes('/other')) {
      setSidebarContext('other');
    } else {
      setSidebarContext('home');
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname?.includes('/workspaces/')) {
      const segments = pathname.split('/');
      const workspaceIndex = segments.indexOf('workspaces');
      if (workspaceIndex !== -1 && workspaceIndex + 1 < segments.length) {
        const workspaceId = segments[workspaceIndex + 1].split('/')[0]; // Get just the workspace ID
        
        // If we're in a document view, we need to find its workspace
        if (pathname.includes('/documents/')) {
          const documentId = segments[segments.length - 1];
          const document = documents?.find(d => d.id === documentId);
          if (document) {
            // Find the root workspace by traversing up the parent chain
            let currentDoc = document;
            while (currentDoc && !currentDoc.is_workspace && currentDoc.parent_id) {
              currentDoc = documents?.find(d => d.id === currentDoc.parent_id) || null;
            }
            if (currentDoc && currentDoc.is_workspace) {
              setCurrentWorkspace(currentDoc);
            }
          }
        } else {
          // We're in a workspace view
          const workspace = documents?.find(d => d.id === workspaceId && d.is_workspace);
          if (workspace) {
            setCurrentWorkspace(workspace);
          } else {
            // If we can't find the workspace in documents, fetch it
            const fetchWorkspace = async () => {
              try {
                const { data: workspace, error } = await supabase
                  .from('documents')
                  .select('*')
                  .eq('id', workspaceId)
                  .eq('is_workspace', true)
                  .single();
                
                if (error) throw error;
                if (workspace) {
                  setCurrentWorkspace(workspace);
                  // Add to documents if not already present
                  setDocuments(prevDocs => {
                    if (!prevDocs.find(d => d.id === workspace.id)) {
                      return [...prevDocs, workspace];
                    }
                    return prevDocs;
                  });
                }
              } catch (error) {
                console.error('Error fetching workspace:', error);
              }
            };
            fetchWorkspace();
          }
        }
      }
    } else {
      setCurrentWorkspace(null);
    }
  }, [pathname, documents]);

  const loadProfile = React.useCallback(async () => {
    try {
      setLoading(true);
      const profileData = await getUserProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Convert flat documents array to tree structure
  const buildDocumentTree = (docs: any[], parentId: string | null = null, level: number = 0): any[] => {
    return docs
      .filter(doc => doc.parent_id === parentId)
      .sort((a, b) => {
        // Sort by pinned first, then by position
        if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1;
        return a.position - b.position;
      })
      .map(doc => ({
        ...doc,
        level,
        children: buildDocumentTree(docs, doc.id, level + 1)
      }));
  };

  const documentTree = buildDocumentTree(documents || []);

  const renderSidebarContent = () => {
    switch (sidebarContext) {
      case 'docs':
        return (
          <div className="flex-1 overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Document Tree */}
              <div className="flex-1 overflow-y-auto">
                <DocumentProjects
                  documents={documents || []}
                  onUpdateDocument={handleUpdateDocument}
                  onCreateDocument={handleCreateDocument}
                  onMoveDocument={handleMoveDocument}
                  onDocumentUpdate={handleDocumentUpdate}
                  currentWorkspaceId={currentWorkspace?.id}
                  createWorkspace={createWorkspace}
                  setCurrentWorkspace={setCurrentWorkspace}
                  setDocuments={setDocuments}
                />
              </div>
            </div>
          </div>
        );

      case 'marketplace':
        return (
          <MarketplaceFilters
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        );

      case 'other':
        return (
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                pathname === "/dashboard/other"
                  ? "bg-muted"
                  : "hover:bg-muted"
              )}
              onClick={() => router.push('/dashboard/other')}
            >
              <span>Other Features</span>
            </Button>
          </div>
        );

      case 'home':
      default:
        return (
          <div className="space-y-6">
            <div className="px-3">
              <div className="mt-2 space-y-1">
                <button
                  onClick={() => router.push('/dashboard')}
                  className={cn(
                    "w-full flex items-center rounded-xl p-3 text-sm font-medium transition-all duration-200 ease-in-out",
                    pathname === "/dashboard"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <LayoutDashboard className="lucide lucide-layout-dashboard h-4 w-4" aria-hidden="true" />
                  <span className="ml-3">Dashboard</span>
                </button>
              </div>
            </div>

            <div className="px-3">
              <div className="mt-2 space-y-1">
                <button
                  onClick={() => router.push('/dashboard/marketplace')}
                  className={cn(
                    "w-full flex items-center rounded-xl p-3 text-sm font-medium transition-all duration-200 ease-in-out",
                    pathname === "/dashboard/marketplace"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Store className="lucide lucide-store h-4 w-4" aria-hidden="true" />
                  <span className="ml-3">Marketplace</span>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  const renderContent = () => {
    return children;
  };

  const createWorkspace = async () => {
    try {
      const newWorkspace = {
        title: 'New Workspace',
        content: '',
        type: 'workspace',
        parent_id: null,
        workspace_id: null,
        is_workspace: true,
        is_template: false,
        is_pinned: false,
        is_favorite: false,
        has_children: false,
        position: documents?.length || 0,
        owner_id: (await supabase.auth.getUser()).data.user?.id
      };

      console.log('Creating workspace:', newWorkspace);

      const { data: workspace, error } = await supabase
        .from('documents')
        .insert([newWorkspace])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Update local state immediately
      setDocuments(prevDocs => [...prevDocs, workspace]);
      
      // Set the current workspace immediately
      setCurrentWorkspace(workspace);

      console.log('Created workspace:', workspace);
      return workspace;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  };

  const handleCreateDocument = async (parentId?: string | null) => {
    try {
      console.log('Creating document with workspace:', currentWorkspace);
      
      let workspaceId = currentWorkspace?.id;
      
      if (!workspaceId) {
        toast({
          title: 'No Workspace Selected',
          description: 'Please select or create a workspace first',
          variant: 'destructive',
        });
        return;
      }

      const newDocument = {
        title: 'Untitled',
        content: '',
        type: 'doc',
        parent_id: parentId,
        workspace_id: workspaceId,
        is_workspace: false,
        is_template: false,
        is_pinned: false,
        is_favorite: false,
        has_children: false,
        position: documents?.length || 0,
        owner_id: (await supabase.auth.getUser()).data.user?.id
      };

      console.log('Attempting to create document:', newDocument);

      const { data: newDoc, error } = await supabase
        .from('documents')
        .insert([newDocument])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Created document:', newDoc);
      
      // Update local state immediately
      setDocuments(prevDocs => [...prevDocs, newDoc]);
      
      // Navigate to the document using the correct route
      const newUrl = `/dashboard/workspaces/documents/${newDoc.id}`;
      router.push(newUrl);
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: 'Error',
        description: 'Failed to create document',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    const initializeWorkspace = async () => {
      if (!documentsLoading && documents?.length === 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            const { data, error } = await supabase
              .from('documents')
              .select('*')
              .eq('owner_id', user.id)
              .eq('is_workspace', true)
              .limit(1);

            if (error) throw error;
            
            // Just set the current workspace if one exists
            if (data && data.length > 0) {
              setCurrentWorkspace(data[0]);
            }
          } catch (error) {
            console.error('Error checking for existing workspaces:', error);
            toast({
              title: 'Error',
              description: 'Failed to check workspaces',
              variant: 'destructive',
            });
          }
        }
      }
    };

    initializeWorkspace();
  }, [documents, documentsLoading]);

  const handleUpdateDocument = async (id: string, updates: Partial<any>) => {
    try {
      const { data: updatedDoc, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.id === id ? { ...doc, ...updatedDoc } : doc
        )
      );

      return updatedDoc;
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: 'Error',
        description: 'Failed to update document',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDocumentUpdate = (updatedDoc: any) => {
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === updatedDoc.id ? updatedDoc : doc
      )
    );
  };

  const handleMoveDocument = async (documentId: string, destinationId: string | null, position: number) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          parent_id: destinationId,
          position: position,
        })
        .eq('id', documentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error moving document:', error);
      toast({
        title: 'Error',
        description: 'Failed to move document',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 h-screen transition-transform duration-300 ease-in-out w-[280px] bg-background p-4",
          isSidebarVisible ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            {/* Sidebar Header */}
            <div className="flex items-center px-3 mb-4">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={profile?.avatar_url || ''} 
                          alt={profile?.full_name || 'User'} 
                        />
                        <AvatarFallback>
                          {profile?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {profile?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600" 
                      onClick={handleSignOut}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium whitespace-nowrap">
                    Hello,
                  </span>
                  <span className="text-xs font-medium truncate bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-transparent bg-clip-text">
                    {profile?.full_name?.split(' ')[0] || 'User'}
                  </span>
                </div>
              </div>
            </div>

            {/* Universal Search */}
            <div className="px-2 mb-2">
              <div className="w-full relative rounded-md">
                <UniversalSearch 
                  currentContext={sidebarContext} 
                  className="w-full h-9"
                />
              </div>
            </div>

            {/* Sidebar Tabs */}
            <div className="flex items-center gap-1 px-2">
              {sidebarItems.map((tab) => (
                <Button
                  key={tab.value}
                  variant={sidebarContext === tab.value ? "default" : "ghost"}
                  size="sm"
                  className="flex-1 px-0"
                  onClick={() => setSidebarContext(tab.value)}
                >
                  {tab.icon}
                </Button>
              ))}
            </div>

            {/* Context-specific content */}
            <div className="flex-1 overflow-auto px-3">
              {renderSidebarContent()}
            </div>
          </div>
        </div>
      </aside>

      {/* Show/Hide button */}
      <button
        onClick={() => setIsSidebarVisible(!isSidebarVisible)}
        className={cn(
          "fixed z-50 bg-white dark:bg-gray-800 rounded-full p-1.5 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 ease-in-out",
          isSidebarVisible ? "left-[280px] bottom-8" : "left-6 bottom-8"
        )}
      >
        {isSidebarVisible ? (
          <ChevronLeft className="lucide lucide-chevron-left h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronRight className="lucide lucide-chevron-right h-4 w-4" aria-hidden="true" />
        )}
      </button>

      {/* Main content */}
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isSidebarVisible ? "ml-[280px]" : "ml-0"
      )}>
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayoutContent>
      {children}
    </DashboardLayoutContent>
  );
}
