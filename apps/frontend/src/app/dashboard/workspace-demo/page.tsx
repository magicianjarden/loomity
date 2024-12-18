'use client';

import { useState } from 'react';
import { WorkspaceList } from '@/components/workspace/workspace-list';
import { WorkspaceTree } from '@/components/workspace/workspace-tree';
import { WorkspaceActions } from '@/components/workspace/workspace-actions';
import { Button } from '@/components/ui/button';
import { ChevronDown, Plus } from 'lucide-react';
import { type Workspace, type WorkspaceTreeItem } from '@/types/workspace';

// Mock data for demonstration
const mockWorkspaces: Workspace[] = [
  {
    id: '1',
    title: 'Marketing Campaign 2024',
    content: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: '1',
    owner_id: '1',
    is_workspace: true,
    workspace_id: null,
    parent_id: null,
    is_template: false,
    is_pinned: true,
    is_favorite: true,
    icon: '📢'
  },
  {
    id: '2',
    title: 'Product Roadmap',
    content: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: '1',
    owner_id: '1',
    is_workspace: true,
    workspace_id: null,
    parent_id: null,
    is_template: false,
    is_pinned: false,
    is_favorite: true,
    icon: '🗺️'
  },
  {
    id: '3',
    title: 'Team Documentation',
    content: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: '1',
    owner_id: '1',
    is_workspace: true,
    workspace_id: null,
    parent_id: null,
    is_template: false,
    is_pinned: false,
    is_favorite: false,
    icon: '📚'
  }
];

const mockTreeItems: WorkspaceTreeItem[] = [
  {
    ...mockWorkspaces[0],
    level: 0,
    children: [
      {
        id: '1-1',
        title: 'Campaign Strategy',
        content: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: '1',
        owner_id: '1',
        is_workspace: false,
        workspace_id: '1',
        parent_id: '1',
        is_template: false,
        is_pinned: false,
        is_favorite: false,
        level: 1,
        children: [
          {
            id: '1-1-1',
            title: 'Q1 Goals',
            content: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: '1',
            owner_id: '1',
            is_workspace: false,
            workspace_id: '1',
            parent_id: '1-1',
            is_template: false,
            is_pinned: false,
            is_favorite: false,
            level: 2
          }
        ]
      },
      {
        id: '1-2',
        title: 'Content Calendar',
        content: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: '1',
        owner_id: '1',
        is_workspace: false,
        workspace_id: '1',
        parent_id: '1',
        is_template: false,
        is_pinned: false,
        is_favorite: false,
        level: 1
      }
    ]
  }
];

export default function WorkspaceDemo() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="h-screen bg-background p-4">
      <div className="grid grid-cols-[300px_1fr] gap-4 h-full">
        {/* Left sidebar */}
        <div className="border rounded-lg relative">
          {/* Top controls */}
          <div className="p-2 border-b">
            <Button variant="outline" className="w-full justify-between" onClick={() => setIsExpanded(!isExpanded)}>
              <span>Marketing Campaign 2024</span>
              <ChevronDown className={isExpanded ? "rotate-180" : ""} />
            </Button>
            <div className="mt-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                New Document
              </Button>
            </div>
          </div>

          {/* Tree view */}
          {isExpanded && (
            <div className="overflow-auto" style={{ height: 'calc(100% - 200px)' }}>
              <WorkspaceTree
                items={mockTreeItems}
                onSelect={(id) => console.log('Selected:', id)}
                onToggle={(id) => console.log('Toggled:', id)}
              />
            </div>
          )}

          {/* Bottom workspace list */}
          <WorkspaceList
            recentWorkspaces={mockWorkspaces.slice(0, 2)}
            allWorkspaces={mockWorkspaces}
          />
        </div>

        {/* Main content area */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Marketing Campaign 2024</h1>
            <WorkspaceActions
              workspace={mockWorkspaces[0]}
              onPin={(id) => console.log('Pin:', id)}
              onFavorite={(id) => console.log('Favorite:', id)}
              onRename={(id) => console.log('Rename:', id)}
              onDuplicate={(id) => console.log('Duplicate:', id)}
              onDelete={(id) => console.log('Delete:', id)}
              onShare={(id) => console.log('Share:', id)}
            />
          </div>
          <p className="text-muted-foreground">
            This is a demo of the workspace components. The left sidebar shows the workspace tree
            and the bottom accordion for recent and all workspaces. The main area will contain
            the document editor.
          </p>
        </div>
      </div>
    </div>
  );
}
