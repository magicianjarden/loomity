'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Minimize2,
  Clock,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { slideThemes, slideTransitions } from './presentation-themes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PresentationModeProps {
  editor: Editor;
  onClose: () => void;
}

export function PresentationMode({ editor, onClose }: PresentationModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [theme, setTheme] = useState<keyof typeof slideThemes>('default');
  const [transition, setTransition] = useState<keyof typeof slideTransitions>('fade');

  const slides = editor.view.dom.querySelectorAll('[data-type="slide"]');
  const totalSlides = slides.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === ' ') {
      setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
    } else if (event.key === 'ArrowLeft') {
      setCurrentSlide(prev => Math.max(prev - 1, 0));
    } else if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'f') {
      toggleFullscreen();
    }
  }, [totalSlides, onClose, toggleFullscreen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex flex-col',
      slideThemes[theme].background,
      slideThemes[theme].text
    )}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Select value={theme} onValueChange={(value) => setTheme(value as keyof typeof slideThemes)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(slideThemes).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={transition} onValueChange={(value) => setTransition(value as keyof typeof slideTransitions)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Transition" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(slideTransitions).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" onClick={() => setShowNotes(!showNotes)}>
          <Eye className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>

        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Timer */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          {formatTime(elapsedTime)}
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className={cn(
          'w-full max-w-6xl aspect-video bg-white rounded-lg shadow-xl overflow-hidden',
          slideTransitions[transition].enter
        )}>
          {slides[currentSlide]?.cloneNode(true)}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="text-sm">
          {currentSlide + 1} / {totalSlides}
        </div>

        <Button
          variant="ghost"
          onClick={() => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1))}
          disabled={currentSlide === totalSlides - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Presenter Notes */}
      {showNotes && (
        <div className="absolute bottom-20 left-4 right-4 bg-white/90 rounded-lg p-4 shadow-lg">
          <div className="text-sm font-medium mb-2">Presenter Notes</div>
          <div className="text-sm">
            {slides[currentSlide]?.getAttribute('data-notes') || 'No notes for this slide'}
          </div>
        </div>
      )}

      {/* Thumbnails */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/10 overflow-x-auto">
        <div className="flex items-center gap-2 p-2">
          {Array.from(slides).map((slide, index) => (
            <button
              key={index}
              className={cn(
                'h-12 aspect-video rounded overflow-hidden border-2',
                index === currentSlide ? 'border-blue-500' : 'border-transparent'
              )}
              onClick={() => setCurrentSlide(index)}
            >
              {slide.cloneNode(true)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
