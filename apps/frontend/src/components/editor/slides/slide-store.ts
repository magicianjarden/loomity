import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Presentation,
  Slide,
  SlideElement,
  SlideLayout,
  Theme,
  PresentationSettings,
  Animation,
} from './slide-types';
import * as slideApi from '@/lib/supabase/slide-api';

interface SlideStore {
  // Presentation state
  presentation: Presentation | null;
  slides: Slide[];
  currentSlideIndex: number;
  selectedElementId: string | null;
  isPresenting: boolean;
  isDragging: boolean;

  // Presentation actions
  loadPresentation: (id: string) => Promise<void>;
  createPresentation: (title: string) => Promise<void>;
  updatePresentation: (updates: Partial<Presentation>) => Promise<void>;
  deletePresentation: () => Promise<void>;
  updateTheme: (theme: Theme) => Promise<void>;
  updateSettings: (settings: PresentationSettings) => Promise<void>;

  // Slide actions
  addSlide: (layout: SlideLayout) => Promise<void>;
  duplicateSlide: (slideId: string) => Promise<void>;
  updateSlide: (slideId: string, updates: Partial<Slide>) => Promise<void>;
  deleteSlide: (slideId: string) => Promise<void>;
  reorderSlides: (slideIds: string[]) => Promise<void>;
  setCurrentSlide: (index: number) => void;
  nextSlide: () => void;
  previousSlide: () => void;

  // Element actions
  addElement: (slideId: string, element: Partial<SlideElement>) => Promise<void>;
  updateElement: (elementId: string, updates: Partial<SlideElement>) => Promise<void>;
  deleteElement: (elementId: string) => Promise<void>;
  selectElement: (elementId: string | null) => void;
  setElementPosition: (elementId: string, x: number, y: number) => Promise<void>;
  setElementSize: (elementId: string, width: number | 'auto', height: number | 'auto') => Promise<void>;
  setElementRotation: (elementId: string, rotation: number) => Promise<void>;
  addAnimation: (elementId: string, animation: Animation) => Promise<void>;
  removeAnimation: (elementId: string, animationId: string) => Promise<void>;

  // Presentation mode
  startPresentation: () => void;
  endPresentation: () => void;
  setDragging: (isDragging: boolean) => void;
}

export const useSlideStore = create<SlideStore>()(
  devtools((set, get) => ({
    // Initial state
    presentation: null,
    slides: [],
    currentSlideIndex: 0,
    selectedElementId: null,
    isPresenting: false,
    isDragging: false,

    // Presentation actions
    loadPresentation: async (id: string) => {
      const presentation = await slideApi.getPresentation(id);
      const slides = await slideApi.getSlides(id);
      set({ presentation, slides, currentSlideIndex: 0 });
    },

    createPresentation: async (title: string) => {
      const presentation = await slideApi.createPresentation({ title });
      set({ presentation, slides: [], currentSlideIndex: 0 });
    },

    updatePresentation: async (updates: Partial<Presentation>) => {
      const { presentation } = get();
      if (!presentation) return;

      const updated = await slideApi.updatePresentation(presentation.id, updates);
      set({ presentation: updated });
    },

    deletePresentation: async () => {
      const { presentation } = get();
      if (!presentation) return;

      await slideApi.deletePresentation(presentation.id);
      set({ presentation: null, slides: [], currentSlideIndex: 0 });
    },

    updateTheme: async (theme: Theme) => {
      const { presentation } = get();
      if (!presentation) return;

      await slideApi.updatePresentation(presentation.id, { theme });
      set({ presentation: { ...presentation, theme } });
    },

    updateSettings: async (settings: PresentationSettings) => {
      const { presentation } = get();
      if (!presentation) return;

      await slideApi.updatePresentation(presentation.id, { settings });
      set({ presentation: { ...presentation, settings } });
    },

    // Slide actions
    addSlide: async (layout: SlideLayout) => {
      const { presentation, slides } = get();
      if (!presentation) return;

      const newSlide = await slideApi.createSlide({
        presentationId: presentation.id,
        layout,
        orderIndex: slides.length,
      });

      set({ slides: [...slides, newSlide] });
    },

    duplicateSlide: async (slideId: string) => {
      const { presentation, slides } = get();
      if (!presentation) return;

      const sourceSlide = slides.find(s => s.id === slideId);
      if (!sourceSlide) return;

      const newSlide = await slideApi.createSlide({
        ...sourceSlide,
        id: undefined,
        orderIndex: slides.length,
      });

      set({ slides: [...slides, newSlide] });
    },

    updateSlide: async (slideId: string, updates: Partial<Slide>) => {
      const { slides } = get();
      const updated = await slideApi.updateSlide(slideId, updates);
      set({
        slides: slides.map(s => (s.id === slideId ? updated : s)),
      });
    },

    deleteSlide: async (slideId: string) => {
      const { slides, currentSlideIndex } = get();
      await slideApi.deleteSlide(slideId);

      const newSlides = slides.filter(s => s.id !== slideId);
      const newIndex = Math.min(currentSlideIndex, newSlides.length - 1);

      set({
        slides: newSlides,
        currentSlideIndex: newIndex,
      });
    },

    reorderSlides: async (slideIds: string[]) => {
      const { presentation } = get();
      if (!presentation) return;

      await slideApi.reorderSlides(presentation.id, slideIds);
      const slides = await slideApi.getSlides(presentation.id);
      set({ slides });
    },

    setCurrentSlide: (index: number) => {
      const { slides } = get();
      if (index >= 0 && index < slides.length) {
        set({ currentSlideIndex: index });
      }
    },

    nextSlide: () => {
      const { currentSlideIndex, slides } = get();
      if (currentSlideIndex < slides.length - 1) {
        set({ currentSlideIndex: currentSlideIndex + 1 });
      }
    },

    previousSlide: () => {
      const { currentSlideIndex } = get();
      if (currentSlideIndex > 0) {
        set({ currentSlideIndex: currentSlideIndex - 1 });
      }
    },

    // Element actions
    addElement: async (slideId: string, element: Partial<SlideElement>) => {
      const { slides } = get();
      const slide = slides.find(s => s.id === slideId);
      if (!slide) return;

      const newElement = await slideApi.createElement({
        ...element,
        slideId,
      });

      const updatedSlide = {
        ...slide,
        content: {
          ...slide.content,
          elements: [...slide.content.elements, newElement],
        },
      };

      set({
        slides: slides.map(s => (s.id === slideId ? updatedSlide : s)),
      });
    },

    updateElement: async (elementId: string, updates: Partial<SlideElement>) => {
      const { slides } = get();
      const updated = await slideApi.updateElement(elementId, updates);

      const updatedSlides = slides.map(slide => ({
        ...slide,
        content: {
          ...slide.content,
          elements: slide.content.elements.map(el =>
            el.id === elementId ? updated : el
          ),
        },
      }));

      set({ slides: updatedSlides });
    },

    deleteElement: async (elementId: string) => {
      const { slides } = get();
      await slideApi.deleteElement(elementId);

      const updatedSlides = slides.map(slide => ({
        ...slide,
        content: {
          ...slide.content,
          elements: slide.content.elements.filter(el => el.id !== elementId),
        },
      }));

      set({
        slides: updatedSlides,
        selectedElementId: null,
      });
    },

    selectElement: (elementId: string | null) => {
      set({ selectedElementId: elementId });
    },

    setElementPosition: async (elementId: string, x: number, y: number) => {
      const { slides } = get();
      const element = slides
        .flatMap(s => s.content.elements)
        .find(e => e.id === elementId);

      if (!element) return;

      await slideApi.updateElement(elementId, {
        style: {
          ...element.style,
          position: { x, y },
        },
      });
    },

    setElementSize: async (elementId: string, width: number | 'auto', height: number | 'auto') => {
      const { slides } = get();
      const element = slides
        .flatMap(s => s.content.elements)
        .find(e => e.id === elementId);

      if (!element) return;

      await slideApi.updateElement(elementId, {
        style: {
          ...element.style,
          size: { width, height },
        },
      });
    },

    setElementRotation: async (elementId: string, rotation: number) => {
      const { slides } = get();
      const element = slides
        .flatMap(s => s.content.elements)
        .find(e => e.id === elementId);

      if (!element) return;

      await slideApi.updateElement(elementId, {
        style: {
          ...element.style,
          rotation,
        },
      });
    },

    addAnimation: async (elementId: string, animation: Animation) => {
      const { slides } = get();
      const element = slides
        .flatMap(s => s.content.elements)
        .find(e => e.id === elementId);

      if (!element) return;

      await slideApi.updateElement(elementId, {
        animations: [...element.animations, animation],
      });
    },

    removeAnimation: async (elementId: string, animationId: string) => {
      const { slides } = get();
      const element = slides
        .flatMap(s => s.content.elements)
        .find(e => e.id === elementId);

      if (!element) return;

      await slideApi.updateElement(elementId, {
        animations: element.animations.filter(a => a.id !== animationId),
      });
    },

    // Presentation mode
    startPresentation: () => {
      set({ isPresenting: true });
    },

    endPresentation: () => {
      set({ isPresenting: false });
    },

    setDragging: (isDragging: boolean) => {
      set({ isDragging });
    },
  }))
);
