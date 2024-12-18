'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

  // Get slide content for preview
  let slideContent = '';
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'slide' && node.attrs.slideId === slideId) {
      slideContent = editor.state.doc.textBetween(pos, pos + node.nodeSize);
    }
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex items-center gap-2 rounded-md border bg-card p-4",
        isDragging && "opacity-50"
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

      <Button
        variant="ghost"
        size="icon"
        onClick={deleteSlide}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
