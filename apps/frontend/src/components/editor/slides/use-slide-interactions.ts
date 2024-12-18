import { useState, useCallback } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';

export function useSlideInteractions() {
  const [activeAreaId, setActiveAreaId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleAreaClick = useCallback((id: string) => {
    setActiveAreaId(id);
  }, []);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const getAreaStyles = useCallback((id: string) => {
    const isActive = id === activeAreaId;
    return {
      transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      zIndex: isActive ? 1 : 0,
      transition: 'all 0.2s ease',
    };
  }, [activeAreaId, isDragging]);

  return {
    activeAreaId,
    isDragging,
    isMobile,
    handleAreaClick,
    handleDragStart,
    handleDragEnd,
    getAreaStyles,
  };
}
