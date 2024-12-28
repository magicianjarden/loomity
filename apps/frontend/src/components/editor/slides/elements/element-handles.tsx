import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ElementHandlesProps {
  width: number;
  height: number;
  rotation: number;
  isSelected: boolean;
  aspectRatio?: number;
  onResize: (width: number, height: number, corner: string) => void;
  onRotate: (rotation: number) => void;
  className?: string;
}

const HANDLE_SIZE = 8;

export const ElementHandles: React.FC<ElementHandlesProps> = ({
  width,
  height,
  rotation,
  isSelected,
  aspectRatio,
  onResize,
  onRotate,
  className,
}) => {
  if (!isSelected) return null;

  const handleResizeStart = (corner: string) => (e: React.PointerEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;

    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      switch (corner) {
        case 'top-left':
          newWidth = startWidth - dx;
          newHeight = startHeight - dy;
          break;
        case 'top-right':
          newWidth = startWidth + dx;
          newHeight = startHeight - dy;
          break;
        case 'bottom-left':
          newWidth = startWidth - dx;
          newHeight = startHeight + dy;
          break;
        case 'bottom-right':
          newWidth = startWidth + dx;
          newHeight = startHeight + dy;
          break;
      }

      if (aspectRatio) {
        if (Math.abs(dx) > Math.abs(dy)) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
      }

      onResize(Math.max(20, newWidth), Math.max(20, newHeight), corner);
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handleRotateStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const startRotation = rotation;

    const handlePointerMove = (e: PointerEvent) => {
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const delta = (angle - startAngle) * (180 / Math.PI);
      const newRotation = (startRotation + delta) % 360;
      onRotate(newRotation);
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <>
      {/* Resize handles */}
      <div className={cn('absolute inset-0', className)} style={{ transform: `rotate(${rotation}deg)` }}>
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
          <motion.div
            key={corner}
            className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full cursor-nwse-resize"
            style={{
              top: corner.includes('top') ? -HANDLE_SIZE / 2 : undefined,
              bottom: corner.includes('bottom') ? -HANDLE_SIZE / 2 : undefined,
              left: corner.includes('left') ? -HANDLE_SIZE / 2 : undefined,
              right: corner.includes('right') ? -HANDLE_SIZE / 2 : undefined,
            }}
            onPointerDown={handleResizeStart(corner)}
          />
        ))}

        {/* Rotation handle */}
        <motion.div
          className="absolute top-0 left-1/2 w-1 h-6 bg-blue-500 origin-bottom cursor-move"
          style={{
            transform: 'translateX(-50%) translateY(-100%)',
          }}
          onPointerDown={handleRotateStart}
        >
          <div className="absolute top-0 left-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </motion.div>
      </div>
    </>
  );
};
