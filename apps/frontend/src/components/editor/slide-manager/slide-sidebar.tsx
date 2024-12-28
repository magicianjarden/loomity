'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus, Layout } from 'lucide-react';
import { SlideThumbnail } from './slide-thumbnail';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { slideLayouts } from '../slides/slide-layouts';

interface SlideSidebarProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
}

export function SlideSidebar({ editor, isOpen, onClose }: SlideSidebarProps) {
  const [slides, setSlides] = React.useState<Array<{ id: string; order: number }>>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  React.useEffect(() => {
    if (editor && isOpen) {
      const slideNodes: Array<{ id: string; order: number }> = [];
      editor.state.doc.descendants(node => {
        if (node.type.name === 'slide') {
          slideNodes.push({
            id: node.attrs.slideId,
            order: node.attrs.order || 0,
          });
        }
      });
      setSlides(slideNodes.sort((a, b) => a.order - b.order));
    }
  }, [editor, isOpen]);

  const addNewSlide = (layoutId: string) => {
    const layout = slideLayouts.find(l => l.id === layoutId);
    if (!layout) return;

    const newSlideId = crypto.randomUUID();
    const maxOrder = Math.max(...slides.map(s => s.order), -1);
    
    editor.commands.insertContentAt(editor.state.doc.content.size, {
      type: 'slide',
      attrs: {
        slideId: newSlideId,
        order: maxOrder + 1,
      },
      content: layout.elements.map(element => ({
        type: element.type,
        attrs: {
          ...element.content,
          ...element.style,
          id: crypto.randomUUID(),
        },
      })),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Find the positions of the active and over slides
      let activePos = -1;
      let overPos = -1;
      let activeOrder = -1;
      let overOrder = -1;

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'slide') {
          if (node.attrs.slideId === active.id) {
            activePos = pos;
            activeOrder = node.attrs.order;
          }
          if (node.attrs.slideId === over.id) {
            overPos = pos;
            overOrder = node.attrs.order;
          }
        }
      });

      if (activePos > -1 && overPos > -1) {
        editor.commands.command(({ tr, dispatch }) => {
          if (dispatch) {
            // Update all slides between active and over
            editor.state.doc.descendants((node, pos) => {
              if (node.type.name === 'slide') {
                const order = node.attrs.order;
                if (activeOrder < overOrder) {
                  if (order > activeOrder && order <= overOrder) {
                    tr.setNodeAttribute(pos, 'order', order - 1);
                  }
                } else {
                  if (order < activeOrder && order >= overOrder) {
                    tr.setNodeAttribute(pos, 'order', order + 1);
                  }
                }
              }
            });

            // Update the active slide's order
            tr.setNodeAttribute(activePos, 'order', overOrder);
          }
          return true;
        });
      }
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Slide Manager</SheetTitle>
          <SheetDescription>
            Manage your slides here. Drag to reorder.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Slide
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {slideLayouts.map((layout) => (
                <DropdownMenuItem
                  key={layout.id}
                  onClick={() => addNewSlide(layout.id)}
                >
                  <Layout className="mr-2 h-4 w-4" />
                  {layout.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={slides.map(slide => slide.id)}
              strategy={verticalListSortingStrategy}
            >
              {slides.map(slide => (
                <SlideThumbnail
                  key={slide.id}
                  editor={editor}
                  slideId={slide.id}
                  order={slide.order}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </SheetContent>
    </Sheet>
  );
}
