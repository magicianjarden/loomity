'use client';

import React, { useState, useRef } from 'react';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, GripVertical, Grid } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { slideLayouts } from '../slides/slide-layouts';
import { SlideArea } from '../slides/slide-area';
import { useSlideInteractions } from '../slides/use-slide-interactions';
import {
  GRID_GAP,
  SLIDE_ASPECT_RATIO,
  DEFAULT_SLIDE_WIDTH,
  DEFAULT_SLIDE_HEIGHT,
} from '../slides/types';

interface SlideComponentProps extends NodeViewProps {
  onOpenManager?: () => void;
}

export function SlideComponent({ ...props }: SlideComponentProps) {
  const { attributes, node } = props;
  const [showNotes, setShowNotes] = useState(node.attrs.showNotes || false);
  const [showGrid, setShowGrid] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    attributes: sortableAttributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: node.attrs.id,
  });

  const {
    activeAreaId,
    isDragging,
    isMobile,
    handleAreaClick,
    handleDragStart,
    handleDragEnd,
    getAreaStyles,
  } = useSlideInteractions();

  const calculateSlideDimensions = () => {
    if (!containerRef.current) return { width: '100%', height: 'auto' };
    const containerWidth = containerRef.current.clientWidth;
    const width = Math.min(containerWidth, DEFAULT_SLIDE_WIDTH);
    const height = width / SLIDE_ASPECT_RATIO;
    
    // Calculate relative padding based on slide width
    const basePadding = Math.max(16, width * 0.03); // Min 16px, max 3% of width
    
    return { 
      width: `${width}px`, 
      height: `${height}px`,
      padding: `${basePadding}px`,
    };
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const layout = slideLayouts.find(l => l.id === node.attrs.layout) || slideLayouts[0];
  const { structure } = layout;

  const getGridStyles = () => {
    const dimensions = calculateSlideDimensions();
    const { gridTemplate } = structure;

    return {
      display: 'grid',
      gridTemplateAreas: `'${gridTemplate.areas.join("' '")}'`,
      gridTemplateColumns: gridTemplate.columns,
      gridTemplateRows: gridTemplate.rows,
      gap: GRID_GAP,
      width: dimensions.width,
      height: dimensions.height,
      padding: dimensions.padding,
    };
  };

  const updateNotes = (notes: string) => {
    if (props.updateAttributes) {
      props.updateAttributes({ notes });
    }
  };

  const handleAreaDuplicate = (areaId: string) => {
    // Implementation for duplicating areas
    console.log('Duplicate area:', areaId);
  };

  const handleAreaDelete = (areaId: string) => {
    // Implementation for deleting areas
    console.log('Delete area:', areaId);
  };

  return (
    <NodeViewWrapper
      ref={setNodeRef}
      style={style}
      className="relative group"
      {...attributes}
      {...sortableAttributes}
    >
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-grab"
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowGrid(!showGrid)}
        >
          <Grid className={cn("h-4 w-4", showGrid && "text-primary")} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowNotes(!showNotes)}
        >
          {showNotes ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div 
        ref={containerRef}
        className={cn(
          "relative rounded-lg border bg-background shadow-sm",
          "transition-shadow duration-200",
          "hover:shadow-md",
          isDragging && "shadow-lg"
        )}
      >
        <div
          className={cn(
            "relative w-full h-full",
            showGrid && "bg-grid-pattern"
          )}
          style={getGridStyles()}
        >
          {structure.areas.map((area) => (
            <SlideArea
              key={area.id}
              id={area.id}
              type={area.type}
              gridArea={area.gridArea}
              className={cn(
                area.className,
                // Add specific styling based on area type
                area.type === 'text' && 'text-area',
                area.type === 'content' && 'content-area',
                area.type === 'image' && 'image-area',
                // Add layout-specific styling
                `${layout.id}-${area.id}-area`
              )}
              style={getAreaStyles(area.id)}
              placeholder={area.placeholder}
              onDragStart={() => handleDragStart()}
              onDragEnd={() => handleDragEnd()}
              onDelete={() => handleAreaDelete(area.id)}
              onDuplicate={() => handleAreaDuplicate(area.id)}
            />
          ))}
        </div>

        {showNotes && (
          <div className="p-4 border-t bg-muted/5">
            <Textarea
              ref={notesRef}
              placeholder="Speaker notes..."
              value={node.attrs.notes || ''}
              onChange={e => updateNotes(e.target.value)}
              className="min-h-[100px] resize-none bg-background"
            />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
