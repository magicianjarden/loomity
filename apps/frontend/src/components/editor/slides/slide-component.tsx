import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSlideStore } from './slide-store';
import type { SlideElement } from './slide-types';
import { ElementHandles } from './elements/element-handles';
import { SnapLines } from './elements/snap-lines';
import { useSnapToGrid } from '@/hooks/use-snap-to-grid';

interface SlideProps {
  id: string;
  index: number;
}

export const SlideComponent: React.FC<SlideProps> = ({ id, index }) => {
  const slide = useSlideStore(state => 
    state.slides.find(s => s.id === id)
  );
  const selectedElementId = useSlideStore(state => state.selectedElementId);
  const isDragging = useSlideStore(state => state.isDragging);
  const setDragging = useSlideStore(state => state.setDragging);
  const selectElement = useSlideStore(state => state.selectElement);
  const updateElement = useSlideStore(state => state.updateElement);
  const setElementPosition = useSlideStore(state => state.setElementPosition);
  const setElementSize = useSlideStore(state => state.setElementSize);
  const setElementRotation = useSlideStore(state => state.setElementRotation);

  const slideRef = useRef<HTMLDivElement>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [selectionBox, setSelectionBox] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);
  const [snapLines, setSnapLines] = useState<{ vertical: number[]; horizontal: number[] }>({ vertical: [], horizontal: [] });

  const snapToGrid = useSnapToGrid({
    gridSize: 8,
    threshold: 5,
    elements: slide?.content.elements.map(el => ({
      id: el.id,
      position: el.style.position,
      size: {
        width: typeof el.style.size.width === 'number' ? el.style.size.width : 0,
        height: typeof el.style.size.height === 'number' ? el.style.size.height : 0,
      },
    })) || [],
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (slideRef.current && !slideRef.current.contains(e.target as Node)) {
        selectElement(null);
        setSelectedElements([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectElement]);

  if (!slide) return null;

  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (e.shiftKey) {
      // Multi-select
      const newSelected = selectedElements.includes(elementId)
        ? selectedElements.filter(id => id !== elementId)
        : [...selectedElements, elementId];
      setSelectedElements(newSelected);
      selectElement(elementId);
    } else {
      // Single select
      setSelectedElements([elementId]);
      selectElement(elementId);
    }
  };

  const handleDragStart = () => {
    setDragging(true);
  };

  const handleDragEnd = (elementId: string, info: any) => {
    setDragging(false);
    const element = slide?.content.elements.find(el => el.id === elementId);
    if (!element) return;

    const size = {
      width: typeof element.style.size.width === 'number' ? element.style.size.width : 0,
      height: typeof element.style.size.height === 'number' ? element.style.size.height : 0,
    };

    const { x, y, snapLines: newSnapLines } = snapToGrid(elementId, { x: info.point.x, y: info.point.y }, size);
    setElementPosition(elementId, x, y);
    setSnapLines(newSnapLines);

    // Clear snap lines after a short delay
    setTimeout(() => {
      setSnapLines({ vertical: [], horizontal: [] });
    }, 500);
  };

  const handleResize = (elementId: string, width: number, height: number) => {
    setElementSize(elementId, width, height);
  };

  const handleRotate = (elementId: string, rotation: number) => {
    setElementRotation(elementId, rotation);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Start selection box
    const rect = slideRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setSelectionBox({
      start: { x: startX, y: startY },
      end: { x: startX, y: startY },
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!rect) return;
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      setSelectionBox(prev => prev ? {
        ...prev,
        end: { x: currentX, y: currentY },
      } : null);
    };

    const handleMouseUp = () => {
      // Calculate selected elements based on intersection with selection box
      if (selectionBox) {
        const selected = slide.content.elements.filter(element => {
          const elementRect = {
            left: element.style.position.x,
            top: element.style.position.y,
            right: element.style.position.x + (typeof element.style.size.width === 'number' ? element.style.size.width : 0),
            bottom: element.style.position.y + (typeof element.style.size.height === 'number' ? element.style.size.height : 0),
          };

          const boxRect = {
            left: Math.min(selectionBox.start.x, selectionBox.end.x),
            top: Math.min(selectionBox.start.y, selectionBox.end.y),
            right: Math.max(selectionBox.start.x, selectionBox.end.x),
            bottom: Math.max(selectionBox.start.y, selectionBox.end.y),
          };

          return (
            elementRect.left < boxRect.right &&
            elementRect.right > boxRect.left &&
            elementRect.top < boxRect.bottom &&
            elementRect.bottom > boxRect.top
          );
        });

        setSelectedElements(selected.map(el => el.id));
        if (selected.length === 1) {
          selectElement(selected[0].id);
        }
      }

      setSelectionBox(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderElement = (element: SlideElement) => {
    const isSelected = selectedElements.includes(element.id);

    const elementStyle = {
      position: 'absolute' as const,
      left: element.style.position.x,
      top: element.style.position.y,
      width: element.style.size.width,
      height: element.style.size.height,
      rotate: element.style.rotation,
      opacity: element.style.opacity,
      cursor: isDragging ? 'grabbing' : 'grab',
      border: isSelected ? '2px solid #1a73e8' : 'none',
      padding: '4px',
    };

    const animations = element.animations.map(animation => ({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: {
        duration: animation.duration,
        delay: animation.delay,
        ease: animation.easing,
      },
    }));

    return (
      <motion.div
        key={element.id}
        style={elementStyle}
        drag
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={(_, info) => handleDragEnd(element.id, info)}
        onClick={(e) => handleElementClick(element.id, e)}
        {...animations[0]}
      >
        {/* Element content */}
        {element.type === 'text' && (
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              updateElement(element.id, {
                content: { text: e.currentTarget.textContent || '' },
              });
            }}
            dangerouslySetInnerHTML={{ __html: element.content.text }}
          />
        )}
        {element.type === 'image' && (
          <img
            src={element.content.url}
            alt={element.content.alt || ''}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
        {element.type === 'shape' && (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: element.content.color,
              borderRadius: element.content.borderRadius,
            }}
          />
        )}

        {/* Resize and rotate handles */}
        {isSelected && typeof element.style.size.width === 'number' && typeof element.style.size.height === 'number' && (
          <ElementHandles
            width={element.style.size.width as number}
            height={element.style.size.height as number}
            rotation={element.style.rotation}
            isSelected={isSelected}
            aspectRatio={element.type === 'image' ? element.style.size.width as number / element.style.size.height as number : undefined}
            onResize={(width, height) => handleResize(element.id, width, height)}
            onRotate={(rotation) => handleRotate(element.id, rotation)}
          />
        )}
      </motion.div>
    );
  };

  return (
    <div
      ref={slideRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: slide.background.value,
        overflow: 'hidden',
      }}
      onClick={() => {
        selectElement(null);
        setSelectedElements([]);
      }}
      onMouseDown={handleMouseDown}
    >
      <AnimatePresence>
        {slide.content.elements.map(renderElement)}
      </AnimatePresence>

      {/* Selection box */}
      {selectionBox && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(selectionBox.start.x, selectionBox.end.x),
            top: Math.min(selectionBox.start.y, selectionBox.end.y),
            width: Math.abs(selectionBox.end.x - selectionBox.start.x),
            height: Math.abs(selectionBox.end.y - selectionBox.start.y),
            border: '1px solid #1a73e8',
            backgroundColor: 'rgba(26, 115, 232, 0.1)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Snap lines */}
      <SnapLines
        vertical={snapLines.vertical}
        horizontal={snapLines.horizontal}
        containerWidth="100%"
        containerHeight="100%"
      />
    </div>
  );
};
