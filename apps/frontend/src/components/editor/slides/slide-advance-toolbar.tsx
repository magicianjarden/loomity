import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Timer,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideAdvanceToolbarProps {
  currentSlide: number;
  totalSlides: number;
  isPlaying?: boolean;
  duration?: number;
  elapsedTime?: number;
  onPrevious: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
  onTogglePlay?: () => void;
  className?: string;
}

export const SlideAdvanceToolbar = memo(function SlideAdvanceToolbar({
  currentSlide,
  totalSlides,
  isPlaying = false,
  duration = 0,
  elapsedTime = 0,
  onPrevious,
  onNext,
  onFirst,
  onLast,
  onTogglePlay,
  className,
}: SlideAdvanceToolbarProps) {
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const progress = totalSlides > 0 ? ((currentSlide + 1) / totalSlides) * 100 : 0;

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border rounded-lg shadow-lg",
        className
      )}
    >
      {/* Navigation Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onFirst}
          disabled={currentSlide === 0}
          className="h-8 w-8"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          disabled={currentSlide === 0}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center justify-center min-w-[80px] px-2 text-sm">
          <span className="font-medium">{currentSlide + 1}</span>
          <span className="text-muted-foreground mx-1">/</span>
          <span className="text-muted-foreground">{totalSlides}</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          disabled={currentSlide === totalSlides - 1}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onLast}
          disabled={currentSlide === totalSlides - 1}
          className="h-8 w-8"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        {onTogglePlay && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onTogglePlay}
            className="h-8 w-8"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        )}

        {duration > 0 && (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(elapsedTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </>
        )}
      </div>

      {/* Progress Bar */}
      <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
});
