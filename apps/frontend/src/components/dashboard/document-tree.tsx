import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronDown, Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DocumentTreeItem } from '@/types/document';
import { createDocument } from '@/lib/api';

interface DocumentTreeProps {
  items: DocumentTreeItem[];
  currentDocumentId?: string;
  onToggle?: (id: string) => void;
  expandedItems?: Set<string>;
  level?: number;
}

export function DocumentTree({
  items,
  currentDocumentId,
  onToggle,
  expandedItems = new Set(),
  level = 0,
}: DocumentTreeProps) {
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleCreateSubpage = async (parentId: string) => {
    try {
      const newDoc = await createDocument({
        title: 'Untitled',
        type: 'page',
        parent_id: parentId,
        position: items.length,
      });
      router.push(`/dashboard/documents/${newDoc.id}`);
    } catch (error) {
      console.error('Error creating subpage:', error);
    }
  };

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const isExpanded = expandedItems.has(item.id);
        const isActive = item.id === currentDocumentId;
        const hasChildren = item.has_children || (item.children && item.children.length > 0);

        return (
          <div key={item.id}>
            <div
              className={cn(
                'group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent/50',
                isActive && 'bg-accent text-accent-foreground',
                level > 0 && 'ml-3'
              )}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Expand/Collapse Button */}
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle?.(item.id);
                  }}
                  className="h-4 w-4 shrink-0 text-muted-foreground/50"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <div className="w-4" />
              )}

              {/* Icon/Emoji */}
              <span className="w-4 h-4 shrink-0">
                {item.emoji || (item.type === 'folder' ? '📁' : '📄')}
              </span>

              {/* Title */}
              <button
                onClick={() => router.push(`/dashboard/documents/${item.id}`)}
                className="flex-1 truncate text-left"
              >
                {item.title || 'Untitled'}
              </button>

              {/* Actions */}
              {hoveredItem === item.id && (
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateSubpage(item.id);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add subpage</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleCreateSubpage(item.id)}>
                        Add subpage
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {/* Handle delete */}}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Render children recursively */}
            {isExpanded && item.children && item.children.length > 0 && (
              <DocumentTree
                items={item.children}
                currentDocumentId={currentDocumentId}
                onToggle={onToggle}
                expandedItems={expandedItems}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
