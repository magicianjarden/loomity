import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useGesture } from '@use-gesture/react';
import { motion } from 'framer-motion';
import { SlideControls } from './slide-controls';
import { SlideAdvanceToolbar } from './slide-advance-toolbar';
import { useElementSize } from '@/hooks/use-element-size';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { usePrevious } from '@/hooks/use-previous';
import { useUndo } from '@/hooks/use-undo';

export const SLIDE_WIDTH = 1280;
export const SLIDE_HEIGHT = 720;
export const SLIDE_ASPECT_RATIO = SLIDE_WIDTH / SLIDE_HEIGHT;

export interface SlideContainerProps {
  children: React.ReactNode;
  aspectRatio?: string;
  showGrid?: boolean;
  showRulers?: boolean;
  isEditing?: boolean;
  backgroundColor?: string;
  onBackgroundChange?: (color: string) => void;
  onAlignChange?: (align: 'left' | 'center' | 'right' | 'justify') => void;
  onFullscreen?: () => void;
  className?: string;
  currentSlide?: number;
  totalSlides?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onFirst?: () => void;
  onLast?: () => void;
  onTogglePlay?: () => void;
  isPlaying?: boolean;
  duration?: number;
  elapsedTime?: number;
}

export const SlideContainer = forwardRef<HTMLDivElement, SlideContainerProps>(
  function SlideContainer(
    {
      children,
      aspectRatio = '16:9',
      showGrid = false,
      showRulers = false,
      isEditing = false,
      backgroundColor = '#ffffff',
      onBackgroundChange,
      onAlignChange,
      onFullscreen,
      className,
      currentSlide,
      totalSlides,
      onPrevious,
      onNext,
      onFirst,
      onLast,
      onTogglePlay,
      isPlaying,
      duration,
      elapsedTime,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [gridSize, setGridSize] = useState(16);
    const [showMinimap, setShowMinimap] = useState(false);
    const [showAnimations, setShowAnimations] = useState(true);
    const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
    const [backgroundPattern, setBackgroundPattern] = useState<string>('none');
    const [isDragging, setIsDragging] = useState(false);

    const { width, height } = useElementSize(containerRef);
    const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
    const prevZoom = usePrevious(zoom);
    const { canUndo, canRedo, undo, redo, addToHistory } = useUndo();

    // Handle keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        const isCtrlOrCmd = e.ctrlKey || e.metaKey;
        
        if (isCtrlOrCmd) {
          switch (e.key) {
            case 'z':
              if (e.shiftKey) {
                e.preventDefault();
                canRedo && redo();
              } else {
                e.preventDefault();
                canUndo && undo();
              }
              break;
            case '=':
              e.preventDefault();
              setZoom((z) => Math.min(2, z + 0.1));
              break;
            case '-':
              e.preventDefault();
              setZoom((z) => Math.max(0.1, z - 0.1));
              break;
            case '0':
              e.preventDefault();
              setZoom(1);
              break;
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canUndo, canRedo, undo, redo]);

    // Handle gestures
    const bind = useGesture(
      {
        onDrag: ({ movement: [mx, my], first, last }) => {
          if (first) setIsDragging(true);
          if (last) setIsDragging(false);
          setPan((p) => ({ x: p.x + mx, y: p.y + my }));
        },
        onWheel: ({ delta: [, dy], ctrlKey, event }) => {
          event.preventDefault();
          if (ctrlKey) {
            setZoom((z) => Math.max(0.1, Math.min(2, z - dy * 0.01)));
          } else {
            setPan((p) => ({ x: p.x, y: p.y - dy }));
          }
        },
        onPinch: ({ delta: [d] }) => {
          setZoom((z) => Math.max(0.1, Math.min(2, z + d * 0.01)));
        },
      },
      {
        drag: {
          filterTaps: true,
          threshold: 5,
        },
        pinch: {
          filterTaps: true,
          threshold: 5,
        },
      }
    );

    // Handle zoom changes
    useEffect(() => {
      if (prevZoom && zoom !== prevZoom) {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        setPan((p) => ({
          x: centerX - (centerX - p.x) * (zoom / prevZoom),
          y: centerY - (centerY - p.y) * (zoom / prevZoom),
        }));
      }
    }, [zoom, prevZoom]);

    const handleAlignChange = useCallback(
      (align: 'left' | 'center' | 'right' | 'justify') => {
        setTextAlign(align);
        onAlignChange?.(align);
      },
      [onAlignChange]
    );

    const handleFullscreenToggle = useCallback(() => {
      toggleFullscreen();
      onFullscreen?.();
    }, [toggleFullscreen, onFullscreen]);

    return (
      <div
        ref={containerRef}
        className={cn(
          'relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800',
          isEditing && 'border rounded-lg shadow-lg',
          className
        )}
        style={{
          width: '100%',
          paddingTop: `${(SLIDE_HEIGHT / SLIDE_WIDTH) * 100}%`,
        }}
        {...bind()}
      >
        <div className="absolute inset-0 p-8">
          <div className="relative w-full h-full">
            {/* Background grid pattern */}
            <div 
              className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"
              style={{ backgroundSize: '40px 40px' }}
            />

            {/* Slide container with shadow and border */}
            <div className="relative w-full h-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden">
              {isEditing && (
                <div className="absolute top-4 left-4 z-50">
                  <SlideControls
                    backgroundColor={backgroundColor}
                    onBackgroundChange={onBackgroundChange}
                    textAlign={textAlign}
                    onAlignChange={handleAlignChange}
                    showGrid={showGrid}
                    onGridToggle={() => setShowGrid(!showGrid)}
                    gridSize={gridSize}
                    onGridSizeChange={setGridSize}
                    showRulers={showRulers}
                    onRulersToggle={() => setShowRulers(!showRulers)}
                    zoom={zoom}
                    onZoomChange={setZoom}
                    isFullscreen={isFullscreen}
                    onFullscreenToggle={handleFullscreenToggle}
                    showMinimap={showMinimap}
                    onMinimapToggle={() => setShowMinimap(!showMinimap)}
                    showAnimations={showAnimations}
                    onAnimationsToggle={() => setShowAnimations(!showAnimations)}
                    backgroundPattern={backgroundPattern}
                    onBackgroundPatternChange={setBackgroundPattern}
                    onUndo={canUndo ? undo : undefined}
                    onRedo={canRedo ? redo : undefined}
                    className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-gray-200/20 dark:border-gray-700/20 rounded-lg shadow-2xl p-3"
                  />
                </div>
              )}

              {isEditing && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
                  <SlideAdvanceToolbar
                    currentSlide={currentSlide || 0}
                    totalSlides={totalSlides || 1}
                    onPrevious={onPrevious || (() => {})}
                    onNext={onNext || (() => {})}
                    onFirst={onFirst || (() => {})}
                    onLast={onLast || (() => {})}
                    onTogglePlay={onTogglePlay}
                    isPlaying={isPlaying}
                    duration={duration}
                    elapsedTime={elapsedTime}
                  />
                </div>
              )}

              {showRulers && (
                <>
                  <div className="absolute top-0 left-0 w-full h-6 bg-gray-100/20 dark:bg-gray-800/20 border-b border-gray-200/20 dark:border-gray-700/20">
                    {/* Horizontal ruler markers */}
                    {Array.from({ length: Math.ceil(width / gridSize) }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 h-full border-l border-gray-300/20 dark:border-gray-600/20"
                        style={{ left: i * gridSize }}
                      >
                        <span className="absolute top-1 left-1 text-[10px] text-gray-500 dark:text-gray-400">
                          {i * gridSize}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-0 left-0 w-6 h-full bg-gray-100/20 dark:bg-gray-800/20 border-r border-gray-200/20 dark:border-gray-700/20">
                    {/* Vertical ruler markers */}
                    {Array.from({ length: Math.ceil(height / gridSize) }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute left-0 w-full border-t border-gray-300/20 dark:border-gray-600/20"
                        style={{ top: i * gridSize }}
                      >
                        <span className="absolute top-1 left-1 text-[10px] text-gray-500 dark:text-gray-400">
                          {i * gridSize}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <motion.div
                className={cn(
                  'absolute inset-0',
                  showGrid && 'bg-grid-pattern opacity-10',
                  backgroundPattern !== 'none' && `bg-pattern-${backgroundPattern}`
                )}
                style={{
                  backgroundColor,
                  backgroundSize: `${gridSize}px ${gridSize}px`,
                  scale: zoom,
                  x: pan.x,
                  y: pan.y,
                  cursor: isDragging ? 'grabbing' : 'grab',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {children}
              </motion.div>

              {showMinimap && (
                <div className="absolute bottom-4 right-4 w-48 h-32 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-gray-200/20 dark:border-gray-700/20 rounded-lg shadow-2xl overflow-hidden">
                  <div
                    className="relative w-full h-full"
                    style={{
                      transform: `scale(${48 / width})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    {children}
                    <div
                      className="absolute border-2 border-primary pointer-events-none"
                      style={{
                        width: width / zoom,
                        height: height / zoom,
                        transform: `translate(${-pan.x}px, ${-pan.y}px)`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
