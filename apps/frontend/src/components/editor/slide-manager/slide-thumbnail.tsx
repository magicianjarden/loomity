'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  GripVertical,
  Trash2,
  Copy,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Layout,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SlideThumbnailProps {
  editor: Editor;
  slideId: string;
  order: number;
}

export function SlideThumbnail({ editor, slideId, order }: SlideThumbnailProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: slideId,
    data: {
      type: 'slide',
      order,
    },
  });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
    transition,
  } : undefined;

  const deleteSlide = () => {
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'slide' && node.attrs.slideId === slideId) {
        editor.commands.deleteNode(node.type);
        return false;
      }
    });
  };

  const duplicateSlide = () => {
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'slide' && node.attrs.slideId === slideId) {
        // Clone the node and generate a new slideId
        const newSlideId = crypto.randomUUID();
        editor.commands.insertContentAt(pos + node.nodeSize, {
          type: 'slide',
          attrs: { ...node.attrs, slideId: newSlideId, order: order + 1 },
          content: node.content.toJSON(),
        });
        return false;
      }
    });
  };

  const moveSlide = (direction: 'up' | 'down') => {
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'slide' && node.attrs.slideId === slideId) {
        const newOrder = direction === 'up' ? order - 1 : order + 1;
        editor.commands.command(({ tr }) => {
          tr.setNodeAttribute(pos, 'order', newOrder);
          return true;
        });
        return false;
      }
    });
  };

  const toggleVisibility = () => {
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'slide' && node.attrs.slideId === slideId) {
        const isHidden = node.attrs.hidden || false;
        editor.commands.command(({ tr }) => {
          tr.setNodeAttribute(pos, 'hidden', !isHidden);
          return true;
        });
        return false;
      }
    });
  };

  // Get slide content and attributes for preview
  let slideContent = '';
  let isHidden = false;
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'slide' && node.attrs.slideId === slideId) {
      slideContent = editor.state.doc.textBetween(pos, pos + node.nodeSize);
      isHidden = node.attrs.hidden || false;
    }
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex items-center gap-2 rounded-md border bg-card p-4",
        isDragging && "opacity-50",
        isHidden && "opacity-40"
      )}
      {...attributes}
    >
      <Button
        variant="ghost"
        size="icon"
        className="cursor-grab"
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </Button>

      <div className="flex-1 overflow-hidden">
        <div className="text-sm font-medium">Slide {order + 1}</div>
        <div className="truncate text-sm text-muted-foreground">
          {slideContent || 'Empty slide'}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => moveSlide('up')}>
            <ArrowUp className="mr-2 h-4 w-4" />
            Move Up
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => moveSlide('down')}>
            <ArrowDown className="mr-2 h-4 w-4" />
            Move Down
          </DropdownMenuItem>
          <DropdownMenuItem onClick={duplicateSlide}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleVisibility}>
            {isHidden ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show Slide
              </>
            ) : (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Slide
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={deleteSlide} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
