'use client';

import * as React from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/theme';

interface BreadcrumbItem {
  id: string;
  title: string;
  type: 'folder' | 'document';
}

interface DocumentBreadcrumbProps {
  path?: BreadcrumbItem[];
  onNavigate?: (id: string) => void;
}

export function DocumentBreadcrumb({ path = [], onNavigate }: DocumentBreadcrumbProps) {
  // If path is too long, show ellipsis dropdown for middle items
  const showEllipsis = path.length > 4;
  const visiblePath = showEllipsis 
    ? [...path.slice(0, 2), ...path.slice(-2)]
    : path;

  const hiddenItems = showEllipsis 
    ? path.slice(2, -2)
    : [];

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {visiblePath.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === visiblePath.length - 1;
        const showEllipsisHere = showEllipsis && index === 1;

        return (
          <React.Fragment key={item.id}>
            {!isFirst && <ChevronRight className="h-4 w-4 text-gray-400" />}
            
            {showEllipsisHere && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {hiddenItems.map((hidden) => (
                      <DropdownMenuItem
                        key={hidden.id}
                        onClick={() => onNavigate?.(hidden.id)}
                      >
                        {hidden.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6",
                isLast && "font-medium"
              )}
              onClick={() => onNavigate?.(item.id)}
            >
              {item.title}
            </Button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
