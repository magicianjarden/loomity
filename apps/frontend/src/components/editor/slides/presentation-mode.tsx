import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSlideStore } from './slide-store';
import { SlideComponent } from './slide-component';

const slideTransitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
  },
  zoom: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 },
  },
};

export const PresentationMode: React.FC = () => {
  const presentation = useSlideStore(state => state.presentation);
  const slides = useSlideStore(state => state.slides);
  const currentSlideIndex = useSlideStore(state => state.currentSlideIndex);
  const nextSlide = useSlideStore(state => state.nextSlide);
  const previousSlide = useSlideStore(state => state.previousSlide);
  const endPresentation = useSlideStore(state => state.endPresentation);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Space':
          nextSlide();
          break;
        case 'ArrowLeft':
          previousSlide();
          break;
        case 'Escape':
          endPresentation();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, previousSlide, endPresentation]);

  if (!presentation || slides.length === 0) return null;

  const currentSlide = slides[currentSlideIndex];
  const transitionType = currentSlide.transitions.in.type;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          maxWidth: presentation.settings.aspectRatio === '16:9' ? '177.78vh' : '133.33vh',
          maxHeight: presentation.settings.aspectRatio === '16:9' ? '56.25vw' : '75vw',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            {...slideTransitions[transitionType]}
            transition={{
              duration: presentation.settings.transitionDuration,
            }}
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            <SlideComponent
              id={currentSlide.id}
              index={currentSlideIndex}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation controls */}
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '1rem',
            color: 'white',
          }}
        >
          <button
            onClick={previousSlide}
            disabled={currentSlideIndex === 0}
            style={{
              opacity: currentSlideIndex === 0 ? 0.5 : 1,
            }}
          >
            Previous
          </button>
          <span>
            {currentSlideIndex + 1} / {slides.length}
          </span>
          <button
            onClick={nextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            style={{
              opacity: currentSlideIndex === slides.length - 1 ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>

        {/* Exit button */}
        <button
          onClick={endPresentation}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            color: 'white',
          }}
        >
          Exit
        </button>

        {/* Speaker notes */}
        {currentSlide.notes && (
          <div
            style={{
              position: 'absolute',
              bottom: '4rem',
              left: '1rem',
              right: '1rem',
              padding: '1rem',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              borderRadius: '0.5rem',
              maxHeight: '20vh',
              overflowY: 'auto',
            }}
          >
            <h3>Speaker Notes:</h3>
            <p>{currentSlide.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
