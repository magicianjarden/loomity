import React from 'react';
import { motion } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { SlideElement } from '../types';

export interface BaseElementProps {
  element: SlideElement;
  isSelected: boolean;
  isEditing: boolean;
  showAnimations?: boolean;
  onSelect: (id: string) => void;
  onDrag: (id: string, position: { x: number; y: number }) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  onRotate: (id: string, rotation: number) => void;
}

export const BaseElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isEditing,
  showAnimations,
  onSelect,
  onDrag,
  onResize,
  onRotate,
  children,
}) => {
  const bindDrag = useDrag(({ movement: [mx, my], first, last }) => {
    if (first) {
      onSelect(element.id);
    }
    onDrag(element.id, {
      x: element.style.position.x + mx,
      y: element.style.position.y + my,
    });
  });

  const handleRotate = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    onRotate(element.id, angle * (180 / Math.PI));
  };

  return (
    <motion.div
      className="absolute"
      style={{
        transform: `translate(${element.style.position.x}px, ${element.style.position.y}px) rotate(${element.style.rotation}deg)`,
        width: element.style.size.width,
        height: element.style.size.height,
        opacity: element.style.opacity,
        zIndex: element.style.zIndex,
      }}
      animate={showAnimations ? element.animation : undefined}
      onClick={() => onSelect(element.id)}
      {...bindDrag()}
    >
      {children}

      {isSelected && isEditing && (
        <>
          {/* Resize handles */}
          <div
            className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              const startWidth = element.style.size.width;
              const startHeight = element.style.size.height;
              const startX = e.clientX;
              const startY = e.clientY;

              const handleMouseMove = (e: MouseEvent) => {
                const dx = startX - e.clientX;
                const dy = startY - e.clientY;
                onResize(element.id, {
                  width: Math.max(50, startWidth + dx),
                  height: Math.max(50, startHeight + dy),
                });
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
          {/* Add other resize handles as needed */}

          {/* Rotation handle */}
          <div
            className="absolute -top-8 left-1/2 w-3 h-3 bg-primary rounded-full cursor-pointer"
            onMouseDown={(e) => {
              e.stopPropagation();
              document.addEventListener('mousemove', handleRotate);
              document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', handleRotate);
              }, { once: true });
            }}
          />
        </>
      )}
    </motion.div>
  );
};
