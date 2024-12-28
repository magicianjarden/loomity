'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import dynamic from 'next/dynamic';
import Reveal from 'reveal.js';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SlideToolbar } from '../toolbar/slide-toolbar';
import { DEFAULT_OPTIONS, SlideBlockOptions } from './slide-block-features';
import { debounce } from 'lodash';
import { SlideContainer } from '../slides/slide-container';
import 'reveal.js/dist/reveal.css';
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js';
import Highlight from 'reveal.js/plugin/highlight/highlight.esm.js';
import Math from 'reveal.js/plugin/math/math.esm.js';
import Notes from 'reveal.js/plugin/notes/notes.esm.js';
import Zoom from 'reveal.js/plugin/zoom/zoom.esm.js';

// Import Reveal.js themes
const THEME_IMPORTS: Record<string, () => Promise<void>> = {
  black: () => import('reveal.js/dist/theme/black.css'),
  white: () => import('reveal.js/dist/theme/white.css'),
  league: () => import('reveal.js/dist/theme/league.css'),
  beige: () => import('reveal.js/dist/theme/beige.css'),
  sky: () => import('reveal.js/dist/theme/sky.css'),
  night: () => import('reveal.js/dist/theme/night.css'),
  serif: () => import('reveal.js/dist/theme/serif.css'),
  simple: () => import('reveal.js/dist/theme/simple.css'),
  solarized: () => import('reveal.js/dist/theme/solarized.css'),
  moon: () => import('reveal.js/dist/theme/moon.css'),
  dracula: () => import('reveal.js/dist/theme/dracula.css'),
};

interface EnhancedSlideBlockProps {
  node?: any;
  updateAttributes?: (attrs: Record<string, any>) => void;
}

export function EnhancedSlideBlock({
  node,
  updateAttributes,
}: EnhancedSlideBlockProps) {
  const [mounted, setMounted] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [options, setOptions] = useState<SlideBlockOptions>({
    ...DEFAULT_OPTIONS,
    ...node?.attrs?.options,
  });

  // UI state
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [scale, setScale] = useState(1);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const revealRef = useRef<Reveal.Api | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<HTMLDivElement>(null);

  // Memoize slide sections to prevent unnecessary re-renders
  const sections = useMemo(() => node?.attrs?.content?.sections || [], [node?.attrs?.content?.sections]);

  // Create virtualizer for slides
  const rowVirtualizer = useVirtualizer({
    count: sections.length,
    getScrollElement: () => slidesRef.current,
    estimateSize: () => 400, // Estimated height of each slide section
    overscan: 2, // Number of slides to render outside the viewport
  });

  // Optimized theme loading
  const loadTheme = useCallback(async (theme: string) => {
    const themeLoader = THEME_IMPORTS[theme];
    if (themeLoader) {
      await themeLoader();
    }
  }, []);

  // Debounced slide update to prevent rapid re-renders
  const debouncedUpdateSlide = useMemo(
    () => debounce((index: number) => {
      setCurrentSlide(index);
      updateAttributes?.({ currentSlide: index });
    }, 100),
    [updateAttributes]
  );

  useEffect(() => {
    setMounted(true);
    loadTheme(options.theme);
  }, [options.theme, loadTheme]);

  useEffect(() => {
    if (typeof window !== 'undefined' && mounted && containerRef.current) {
      // Initialize Reveal.js with enhanced configuration
      revealRef.current = new Reveal(containerRef.current, {
        ...options,
        embedded: !isPresenting,
        margin: 0.1,
        hash: false,
        transition: options.transition || 'none',
        backgroundTransition: options.backgroundTransition || 'none',
        touch: true,
        hideInactiveCursor: true,
        preloadIframes: true,
        autoPlayMedia: true,
        viewDistance: 2,
        center: true,
        // Enable plugins
        plugins: [Markdown, Highlight, Math, Notes, Zoom],
        // Enhanced configuration
        width: 1280,
        height: 720,
        minScale: 0.2,
        maxScale: 2.0,
        controls: isPresenting,
        progress: isPresenting,
        slideNumber: true,
        keyboard: true,
        overview: true,
        // Enable markdown in slides
        markdown: {
          smartypants: true,
          smartLists: true,
        },
        // Code highlighting options
        highlight: {
          highlightOnLoad: true,
          escapeHTML: false,
        },
        // Math options
        math: {
          mathjax: 'https://cdn.jsdelivr.net/gh/mathjax/mathjax@2.7.8/MathJax.js',
          config: 'TeX-AMS_HTML-full',
        },
        // Notes options
        notes: {
          markdown: true,
        },
        // Zoom options
        zoom: {
          scale: 2,
          pan: true,
        },
      });

      revealRef.current.initialize().then(() => {
        // Add event listeners for enhanced functionality
        revealRef.current?.on('slidechanged', (event: any) => {
          debouncedUpdateSlide(event.indexh);
          // Update fragment visibility
          const fragments = event.currentSlide.querySelectorAll('.fragment');
          fragments.forEach((fragment: Element) => {
            fragment.classList.remove('visible', 'current-fragment');
          });
        });

        revealRef.current?.on('fragmentshown', (event: any) => {
          const { fragment } = event;
          fragment.classList.add('visible', 'current-fragment');
        });

        revealRef.current?.on('fragmenthidden', (event: any) => {
          const { fragment } = event;
          fragment.classList.remove('visible', 'current-fragment');
        });

        // Handle overview mode
        revealRef.current?.on('overviewshown', () => {
          setIsOverview(true);
        });

        revealRef.current?.on('overviewhidden', () => {
          setIsOverview(false);
        });
      });

      return () => {
        debouncedUpdateSlide.cancel();
        revealRef.current?.destroy();
      };
    }
  }, [mounted, isPresenting, options, debouncedUpdateSlide]);

  const handleOptionsChange = useCallback((newOptions: Partial<SlideBlockOptions>) => {
    setOptions((prev) => {
      const updated = { ...prev, ...newOptions };
      updateAttributes?.({ options: updated });
      return updated;
    });
  }, [updateAttributes]);

  const togglePresentation = useCallback(() => {
    setIsPresenting((prev) => !prev);
  }, []);

  // Navigation functions
  const goToSlide = useCallback((index: number) => {
    if (revealRef.current) {
      revealRef.current.slide(index);
      debouncedUpdateSlide(index);
    }
  }, [debouncedUpdateSlide]);

  const goToFirst = useCallback(() => {
    goToSlide(0);
  }, [goToSlide]);

  const goToLast = useCallback(() => {
    if (sections.length > 0) {
      goToSlide(sections.length - 1);
    }
  }, [goToSlide, sections.length]);

  const goToPrevious = useCallback(() => {
    if (revealRef.current) {
      revealRef.current.prev();
    }
  }, []);

  const goToNext = useCallback(() => {
    if (revealRef.current) {
      revealRef.current.next();
    }
  }, []);

  // Playback functions
  const startPlayback = useCallback(() => {
    if (!isPlaying) {
      setIsPlaying(true);
      const startTime = Date.now() - elapsedTime;
      
      playbackTimerRef.current = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        setElapsedTime(elapsed);
        
        // Auto-advance slides based on timing
        const slideIndex = Math.floor(elapsed / (options.autoSlide || 5000));
        if (slideIndex < sections.length && slideIndex !== currentSlide) {
          goToSlide(slideIndex);
        }
        
        // Stop when we reach the end
        if (slideIndex >= sections.length) {
          stopPlayback();
        }
      }, 100);
    }
  }, [isPlaying, elapsedTime, options.autoSlide, sections.length, currentSlide, goToSlide]);

  const stopPlayback = useCallback(() => {
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }, [isPlaying, startPlayback, stopPlayback]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, []);

  // Calculate total duration based on number of slides and auto-slide duration
  useEffect(() => {
    const slideDuration = options.autoSlide || 5000;
    setDuration(sections.length * slideDuration);
  }, [sections.length, options.autoSlide]);

  // Add overview mode state
  const [isOverview, setIsOverview] = useState(false);

  // Add methods for fragment navigation
  const nextFragment = useCallback(() => {
    if (revealRef.current) {
      revealRef.current.next();
    }
  }, []);

  const previousFragment = useCallback(() => {
    if (revealRef.current) {
      revealRef.current.prev();
    }
  }, []);

  // Add method for overview toggle
  const toggleOverview = useCallback(() => {
    if (revealRef.current) {
      if (isOverview) {
        revealRef.current.toggleOverview(false);
      } else {
        revealRef.current.toggleOverview(true);
      }
    }
  }, [isOverview]);

  if (!mounted) {
    return (
      <NodeViewWrapper className="relative my-4">
        <div className="rounded-md bg-muted p-4">
          <div className="h-8 w-full animate-pulse bg-muted-foreground/10 rounded" />
          <div className="mt-4 h-[400px] animate-pulse bg-muted-foreground/10 rounded" />
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className={`relative my-4 ${isPresenting ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <div className="rounded-md border bg-background shadow">
        <SlideToolbar
          editor={node.editor}
          options={options}
          onOptionsChange={handleOptionsChange}
          onToggleNotes={() => setShowNotes(!showNotes)}
          onPreview={togglePresentation}
          showNotes={showNotes}
          isPresenting={isPresenting}
          onTogglePresentation={togglePresentation}
          showGrid={showGrid}
          showRulers={showRulers}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onToggleRulers={() => setShowRulers(!showRulers)}
          onLayoutSelect={() => {}}
          onFullscreen={() => {}}
          onAddElement={(type) => {
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
              zIndex: 1,
              backgroundColor: type === 'shape' ? '#e2e8f0' : undefined,
              borderRadius: type === 'shape' ? 4 : undefined,
            };

            const newElement = {
              id: crypto.randomUUID(),
              type,
              content: defaultContent[type],
              style: defaultStyle,
            };

            const elements = node.attrs.elements || [];
            updateAttributes?.({ elements: [...elements, newElement] });
          }}
          onToggleAnimation={() => {}}
        />
        
        <SlideContainer
          aspectRatio="16:9"
          showGrid={showGrid}
          showRulers={showRulers}
          isEditing={!isPresenting}
          onZoom={setScale}
          currentSlide={currentSlide}
          totalSlides={sections.length}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onFirst={goToFirst}
          onLast={goToLast}
          onTogglePlay={togglePlayback}
          isPlaying={isPlaying}
          duration={duration}
          elapsedTime={elapsedTime}
        >
          <div 
            ref={containerRef}
            className="reveal"
          >
            <div className="slides" ref={slidesRef}>
              {/* Default welcome slide */}
              {sections.length === 0 && (
                <section>
                  <h2>Welcome to Your Presentation</h2>
                  <p>Click the + button to add your first slide</p>
                </section>
              )}

              {/* Virtualized slides */}
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const section = sections[virtualRow.index];
                return (
                  <section key={section.id} data-index={virtualRow.index}>
                    <h2>{section.title}</h2>
                    {section.slides.map((slide) => (
                      <section
                        key={slide.id}
                        data-transition={slide.transition || options.transition}
                        data-background-color={slide.background?.color}
                        data-background-image={slide.background?.image}
                        data-background-video={slide.background?.video}
                        data-background-iframe={slide.background?.iframe}
                      >
                        <div dangerouslySetInnerHTML={{ __html: slide.content }} />
                        {showNotes && slide.notes && (
                          <aside className="notes">{slide.notes}</aside>
                        )}
                      </section>
                    ))}
                  </section>
                );
              })}
            </div>
          </div>
        </SlideContainer>

        {/* Speaker notes panel */}
        {showNotes && !isPresenting && (
          <div className="border-t bg-muted p-4">
            <h3 className="text-sm font-medium">Speaker Notes</h3>
            <div className="mt-2 text-sm text-muted-foreground">
              {sections[currentSlide]?.slides?.[0]?.notes || 'No notes for this slide'}
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
