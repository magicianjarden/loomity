import { 
  Copy, 
  MoreHorizontal, 
  Pencil, 
  Star, 
  StarOff, 
  Pin, 
  Trash,
  Share
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Workspace } from '@/types/workspace';

interface WorkspaceActionsProps {
  workspace: Workspace;
  onPin?: (id: string) => void;
  onFavorite?: (id: string) => void;
  onRename?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
}

export function WorkspaceActions({
  workspace,
  onPin,
  onFavorite,
  onRename,
  onDuplicate,
  onDelete,
  onShare,
}: WorkspaceActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => onPin?.(workspace.id)}>
          <Pin className="mr-2 h-4 w-4" />
          {workspace.is_pinned ? 'Unpin' : 'Pin'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFavorite?.(workspace.id)}>
          {workspace.is_favorite ? (
            <>
              <StarOff className="mr-2 h-4 w-4" />
              Remove from favorites
            </>
          ) : (
            <>
              <Star className="mr-2 h-4 w-4" />
              Add to favorites
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onRename?.(workspace.id)}>
          <Pencil className="mr-2 h-4 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDuplicate?.(workspace.id)}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShare?.(workspace.id)}>
          <Share className="mr-2 h-4 w-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onDelete?.(workspace.id)}
          className="text-destructive focus:text-destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
