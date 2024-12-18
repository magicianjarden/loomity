import { useState } from 'react';
import { ChevronUp, Clock, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type Workspace } from '@/types/workspace';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WorkspaceListProps {
  recentWorkspaces: Workspace[];
  allWorkspaces: Workspace[];
}

export function WorkspaceList({ recentWorkspaces, allWorkspaces }: WorkspaceListProps) {
  const [isRecentExpanded, setIsRecentExpanded] = useState(false);
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  const renderWorkspaceItem = (workspace: Workspace) => (
    <Button
      key={workspace.id}
      variant="ghost"
      className="w-full justify-start gap-2 px-2"
      onClick={() => {/* TODO: Navigate to workspace */}}
    >
      {workspace.icon || <Folder className="h-4 w-4" />}
      <span className="truncate">{workspace.title}</span>
    </Button>
  );

  return (
    <div className="absolute bottom-0 left-0 right-0 border-t">
      {/* Recent Workspaces */}
      <div className="border-b">
        <Button
          variant="ghost"
          className="w-full justify-between px-2"
          onClick={() => setIsRecentExpanded(!isRecentExpanded)}
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Recent Workspaces</span>
          </div>
          <ChevronUp className={cn(
            "h-4 w-4 transition-transform",
            !isRecentExpanded && "rotate-180"
          )} />
        </Button>
        {isRecentExpanded && (
          <ScrollArea className="h-[200px]">
            <div className="space-y-1 p-2">
              {recentWorkspaces.map(renderWorkspaceItem)}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* All Workspaces */}
      <div>
        <Button
          variant="ghost"
          className="w-full justify-between px-2"
          onClick={() => setIsAllExpanded(!isAllExpanded)}
        >
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            <span>All Workspaces</span>
          </div>
          <ChevronUp className={cn(
            "h-4 w-4 transition-transform",
            !isAllExpanded && "rotate-180"
          )} />
        </Button>
        {isAllExpanded && (
          <ScrollArea className="h-[200px]">
            <div className="space-y-1 p-2">
              {allWorkspaces.map(renderWorkspaceItem)}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
