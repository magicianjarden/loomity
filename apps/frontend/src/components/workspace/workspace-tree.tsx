import { useState } from 'react';
import { ChevronRight, File, Folder, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { type WorkspaceTreeItem } from '@/types/workspace';

interface WorkspaceTreeProps {
  items: WorkspaceTreeItem[];
  onToggle?: (id: string) => void;
  onSelect?: (id: string) => void;
  className?: string;
}

export function WorkspaceTree({ items, onToggle, onSelect, className }: WorkspaceTreeProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
    onToggle?.(id);
  };

  const renderItem = (item: WorkspaceTreeItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <div key={item.id} className="space-y-1">
        <div
          className={cn(
            "group flex items-center gap-1",
            "pl-[calc(12px*var(--level))]",
            { "hover:bg-accent": true }
          )}
          style={{ "--level": item.level } as any}
        >
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-6 w-6 p-0", !hasChildren && "invisible")}
            onClick={() => toggleExpand(item.id)}
          >
            <ChevronRight
              className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")}
            />
          </Button>

          <Button
            variant="ghost"
            className="h-8 flex-1 justify-start gap-2 px-2"
            onClick={() => onSelect?.(item.id)}
          >
            {item.is_workspace ? (
              <Folder className="h-4 w-4" />
            ) : (
              <File className="h-4 w-4" />
            )}
            <span className="truncate">{item.title}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children.map(child => renderItem({ ...child, level: item.level + 1 }))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("py-2", className)}>
      {items.map(item => renderItem({ ...item, level: 0 }))}
    </div>
  );
}
