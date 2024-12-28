'use client';

import React, { useCallback, useRef, useState, memo } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { cn } from '@/lib/utils';
import { SlideToolbar } from '../toolbar/slide-toolbar';
import { SlideArea } from '../slides/slide-area';
import { slideLayouts } from '../slides/slide-layouts';
import { ElementType, SlideElement, ElementStyle } from '../slides/types';
import dynamic from 'next/dynamic';

interface SlideComponentProps extends NodeViewProps {
  onOpenManager?: () => void;
}

const SlideComponentBase = memo(function SlideComponent({ 
  node, 
  updateAttributes, 
  selected,
  onOpenManager,
}: SlideComponentProps) {
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showAnimations, setShowAnimations] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle layout selection
  const handleLayoutSelect = useCallback((layoutId: string) => {
    const layout = slideLayouts.find(l => l.id === layoutId);
    if (!layout) return;

    updateAttributes({
      layout: layoutId,
      elements: layout.elements,
    });
  }, [updateAttributes]);

  // Get default content for new elements
  const getDefaultContent = (type: ElementType) => {
    switch (type) {
      case 'text':
        return {
          html: '<p>Double click to edit text</p>',
          plainText: 'Double click to edit text',
        };
      case 'shape':
        return {
          shapeType: 'rectangle' as const,
        };
      case 'image':
        return {
          src: '',
          alt: '',
        };
      case 'code':
        return {
          code: '// Add your code here',
          language: 'javascript',
        };
      case 'table':
        return {
          rows: 3,
          cols: 3,
          data: Array(3).fill(Array(3).fill('')),
        };
      case 'chart':
        return {
          type: 'bar' as const,
          data: {
            labels: ['A', 'B', 'C'],
            datasets: [{
              label: 'Sample Data',
              data: [1, 2, 3],
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            }],
          },
        };
      default:
        return {};
    }
  };

  // Handle adding new elements
  const handleAddElement = useCallback((type: ElementType) => {
    console.log('Adding element:', type);
    console.log('Before update - node.attrs:', node.attrs);
    
    const defaultStyle: ElementStyle = {
      position: { x: 100, y: 100 },
      size: { 
        width: type === 'text' ? 300 : 400,
        height: type === 'text' ? 100 : 300 
      },
      rotation: 0,
      opacity: 1,
      zIndex: (node.attrs.elements?.length || 0) + 1,
      backgroundColor: type === 'shape' ? '#e2e8f0' : undefined,
      borderRadius: type === 'shape' ? 4 : undefined,
      padding: type === 'text' ? '1rem' : undefined,
      fontSize: type === 'text' ? '1rem' : undefined,
      fontFamily: type === 'text' ? 'inherit' : undefined,
    };

    const newElement: SlideElement = {
      id: crypto.randomUUID(),
      type,
      content: getDefaultContent(type),
      style: defaultStyle,
    };

    console.log('Current elements:', node.attrs.elements);
    console.log('New element:', newElement);

    const currentElements = node.attrs.elements || [];
    console.log('Before update - currentElements:', currentElements);
    updateAttributes({ 
      elements: [...currentElements, newElement],
      version: (node.attrs.version || 0) + 1,
    });
    console.log('After update - newElement:', newElement);
    console.log('After update - node.attrs:', node.attrs);
  }, [node.attrs.elements, node.attrs.version, updateAttributes]);

  // Handle fullscreen
  const handleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  }, []);

  // Handle element updates
  const handleElementUpdate = useCallback((elements: SlideElement[]) => {
    console.log('Updating elements:', elements);
    updateAttributes({ 
      elements,
      version: (node.attrs.version || 0) + 1,
    });
  }, [node.attrs.version, updateAttributes]);

  return (
    <NodeViewWrapper
      className={cn(
        "relative my-6 rounded-xl border bg-background",
        "transition-all duration-300 ease-in-out",
        "hover:shadow-xl hover:scale-[1.002] hover:border-primary/20",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
      ref={containerRef}
      onClick={(e) => {
        // Prevent click event from opening slide manager
        e.stopPropagation();
      }}
    >
      <SlideToolbar
        editor={node.editor}
        showGrid={showGrid}
        showRulers={showRulers}
        showNotes={showNotes}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onToggleRulers={() => setShowRulers(!showRulers)}
        onToggleNotes={() => setShowNotes(!showNotes)}
        onLayoutSelect={handleLayoutSelect}
        onFullscreen={handleFullscreen}
        onAddElement={handleAddElement}
        onToggleAnimation={() => setShowAnimations(!showAnimations)}
      />

      <div className="p-4">
        <SlideArea
          slide={{
            id: node.attrs.id,
            elements: node.attrs.elements || [],
            background: node.attrs.background || { type: 'color', value: '#ffffff' },
            notes: node.attrs.notes || '',
          }}
          isEditing={true}
          showGrid={showGrid}
          showRulers={showRulers}
          showAnimations={showAnimations}
          onUpdate={handleElementUpdate}
        />
      </div>

      {showNotes && (
        <div className="p-4 border-t bg-muted/50">
          <textarea
            placeholder="Add speaker notes..."
            value={node.attrs.notes || ''}
            onChange={(e) => updateAttributes({ notes: e.target.value })}
            className="w-full min-h-[100px] bg-transparent border-none resize-none focus:ring-0"
          />
        </div>
      )}
    </NodeViewWrapper>
  );
});

// Export the dynamic component with SSR disabled
export const SlideComponent = dynamic(() => Promise.resolve(SlideComponentBase), {
  ssr: false,
});
