import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { cn } from '@/lib/utils';
import { Slide, SlideElement, ElementType, ElementStyle } from './types';
import { TextElement } from './elements/text-element';
import { ShapeElement } from './elements/shape-element';
import { ImageElement } from './elements/image-element';
import { CodeElement } from './elements/code-element';
import { TableElement } from './elements/table-element';
import { ChartElement } from './elements/chart-element';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/client-icon';

interface SlideAreaProps {
  slide: Slide;
  isEditing: boolean;
  showGrid?: boolean;
  showRulers?: boolean;
  showAnimations?: boolean;
  onUpdate?: (elements: SlideElement[]) => void;
  onAddElement?: (type: ElementType) => void;
}

export function SlideArea({
  slide,
  isEditing,
  showGrid,
  showRulers,
  showAnimations,
  onUpdate,
  onAddElement,
}: SlideAreaProps) {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle element selection
  const handleElementSelect = useCallback((elementId: string) => {
    setSelectedElement(elementId);
  }, []);

  // Handle element drag
  const handleElementDrag = useCallback((elementId: string, position: { x: number; y: number }) => {
    if (!onUpdate || !slide.elements) return;

    const updatedElements = slide.elements.map(element => {
      if (element.id === elementId) {
        return {
          ...element,
          style: {
            ...element.style,
            position,
          },
        };
      }
      return element;
    });

    onUpdate(updatedElements);
  }, [onUpdate, slide.elements]);

  // Handle element resize
  const handleElementResize = useCallback((elementId: string, size: { width: number; height: number }) => {
    if (!onUpdate || !slide.elements) return;

    const updatedElements = slide.elements.map(element => {
      if (element.id === elementId) {
        return {
          ...element,
          style: {
            ...element.style,
            size,
          },
        };
      }
      return element;
    });

    onUpdate(updatedElements);
  }, [onUpdate, slide.elements]);

  // Handle element rotation
  const handleElementRotate = useCallback((elementId: string, rotation: number) => {
    if (!onUpdate || !slide.elements) return;

    const updatedElements = slide.elements.map(element => {
      if (element.id === elementId) {
        return {
          ...element,
          style: {
            ...element.style,
            rotation,
          },
        };
      }
      return element;
    });

    onUpdate(updatedElements);
  }, [onUpdate, slide.elements]);

  // Delete element
  const handleDeleteElement = useCallback((elementId: string) => {
    if (!onUpdate || !slide.elements) return;

    const updatedElements = slide.elements.filter(element => element.id !== elementId);
    onUpdate(updatedElements);
  }, [onUpdate, slide.elements]);

  const renderElement = useCallback((element: SlideElement) => {
    const isSelected = element.id === selectedElement;
    const props = {
      element,
      isSelected,
      isEditing,
      onSelect: handleElementSelect,
      onDrag: handleElementDrag,
      onResize: handleElementResize,
      onRotate: handleElementRotate,
      onDelete: handleDeleteElement,
      showAnimations,
    };

    switch (element.type) {
      case 'text':
        return <TextElement key={element.id} {...props} />;
      case 'shape':
        return <ShapeElement key={element.id} {...props} />;
      case 'image':
        return <ImageElement key={element.id} {...props} />;
      case 'code':
        return <CodeElement key={element.id} {...props} />;
      case 'table':
        return <TableElement key={element.id} {...props} />;
      case 'chart':
        return <ChartElement key={element.id} {...props} />;
      default:
        return null;
    }
  }, [selectedElement, isEditing, handleElementSelect, handleElementDrag, handleElementResize, handleElementRotate, handleDeleteElement, showAnimations]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full aspect-[16/9] bg-white rounded-lg overflow-hidden",
        showGrid && "bg-grid-pattern",
      )}
      style={{
        backgroundColor: slide.background.type === 'color' ? slide.background.value : undefined,
        backgroundImage: slide.background.type === 'image' ? `url(${slide.background.value})` : undefined,
      }}
      onClick={(e) => {
        // Prevent click event from bubbling up
        e.stopPropagation();
      }}
    >
      {showRulers && (
        <>
          <div className="absolute top-0 left-0 w-full h-6 bg-muted/20" />
          <div className="absolute top-0 left-0 w-6 h-full bg-muted/20" />
        </>
      )}

      {isEditing && (
        <div className="absolute right-4 top-4 z-50 slide-toolbar">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
              >
                <Icon name="Layers" className="h-4 w-4 mr-1" />
                Add Element
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  className="w-full flex items-center px-2 py-1.5 text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddElement?.('text');
                  }}
                >
                  <Icon name="Type" className="h-4 w-4 mr-2" />
                  Text
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  className="w-full flex items-center px-2 py-1.5 text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddElement?.('shape');
                  }}
                >
                  <Icon name="Square" className="h-4 w-4 mr-2" />
                  Shape
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  className="w-full flex items-center px-2 py-1.5 text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddElement?.('image');
                  }}
                >
                  <Icon name="Image" className="h-4 w-4 mr-2" />
                  Image
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  className="w-full flex items-center px-2 py-1.5 text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddElement?.('code');
                  }}
                >
                  <Icon name="Code2" className="h-4 w-4 mr-2" />
                  Code
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  className="w-full flex items-center px-2 py-1.5 text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddElement?.('table');
                  }}
                >
                  <Icon name="Table" className="h-4 w-4 mr-2" />
                  Table
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  className="w-full flex items-center px-2 py-1.5 text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddElement?.('chart');
                  }}
                >
                  <Icon name="BarChart3" className="h-4 w-4 mr-2" />
                  Chart
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <AnimatePresence>
        {slide.elements?.map(element => (
          <motion.div
            key={element.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {renderElement(element)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
