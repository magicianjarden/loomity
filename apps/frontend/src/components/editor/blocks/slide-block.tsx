import React, { useCallback } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { SlideArea } from '../slides/slide-area';
import { Slide, ElementType } from '../slides/types';
import { cn } from '@/lib/utils';

export interface SlideBlockProps extends NodeViewProps {
  onUpdate?: (slide: Slide) => void;
  onOpenManager?: () => void;
}

export const SlideBlock: React.FC<SlideBlockProps> = ({ 
  node,
  selected,
  onUpdate,
  extension,
  updateAttributes,
}) => {
  const slide: Slide = {
    id: node.attrs.id || '',
    elements: node.attrs.elements || [],
    background: node.attrs.background || { type: 'color', value: '#ffffff' },
    notes: node.attrs.notes || '',
  };

  const onOpenManager = extension?.options?.onOpenManager;

  const handleAddElement = useCallback((type: ElementType) => {
    console.log('Adding element:', type);
    console.log('Current elements:', slide.elements);
    
    const defaultContent = {
      text: { html: '<p>New text</p>', plainText: 'New text' },
      shape: { shapeType: 'rectangle' },
      image: { src: '', alt: '' },
      code: { code: '', language: 'javascript' },
      table: { rows: 3, cols: 3, data: Array(3).fill(Array(3).fill('')) },
      chart: {
        type: 'bar',
        data: {
          labels: ['Label 1', 'Label 2', 'Label 3'],
          datasets: [{
            label: 'Dataset 1',
            data: [65, 59, 80],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1
          }]
        }
      }
    };

    const defaultStyle = {
      position: { x: 100, y: 100 },
      size: { 
        width: type === 'text' ? 300 : 400,
        height: type === 'text' ? 100 : 300 
      },
      rotation: 0,
      opacity: 1,
      zIndex: (slide.elements?.length || 0) + 1,
      backgroundColor: type === 'shape' ? '#e2e8f0' : undefined,
      borderRadius: type === 'shape' ? 4 : undefined,
    };

    const newElement = {
      id: crypto.randomUUID(),
      type,
      content: defaultContent[type],
      style: defaultStyle,
    };

    console.log('New element:', newElement);
    const updatedElements = [...(slide.elements || []), newElement];
    console.log('Updated elements:', updatedElements);
    
    // Schedule the update for the next tick
    setTimeout(() => {
      updateAttributes({ elements: updatedElements });
    }, 0);
  }, [slide.elements, updateAttributes]);

  const handleElementsUpdate = useCallback((updatedElements) => {
    if (onUpdate) {
      onUpdate({ ...slide, elements: updatedElements });
    }
    updateAttributes({ elements: updatedElements });
  }, [onUpdate, slide, updateAttributes]);

  return (
    <NodeViewWrapper
      className={cn(
        "relative my-6 rounded-xl",
        "transition-all duration-300 ease-in-out",
        "hover:shadow-xl hover:scale-[1.002]",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      onClick={(e) => {
        // Don't open manager if clicking on the add element menu
        if (e.target instanceof Element && 
            (e.target.closest('.slide-toolbar') || 
             e.target.closest('[role="menu"]'))) {
          return;
        }
        
        if (onOpenManager) {
          onOpenManager();
        }
      }}
    >
      <SlideArea
        slide={slide}
        isEditing={selected}
        onUpdate={handleElementsUpdate}
        onAddElement={handleAddElement}
      />
    </NodeViewWrapper>
  );
};
