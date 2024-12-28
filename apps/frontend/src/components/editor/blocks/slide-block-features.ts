export interface SlideTheme {
  name: string;
  label: string;
  className: string;
  preload?: boolean;
}

export const SLIDE_THEMES: SlideTheme[] = [
  // Commonly used themes (preloaded)
  { name: 'black', label: 'Black', className: 'theme-black', preload: true },
  { name: 'white', label: 'White', className: 'theme-white', preload: true },
  { name: 'league', label: 'League', className: 'theme-league', preload: true },
  
  // Other themes (lazy loaded)
  { name: 'beige', label: 'Beige', className: 'theme-beige' },
  { name: 'sky', label: 'Sky', className: 'theme-sky' },
  { name: 'night', label: 'Night', className: 'theme-night' },
  { name: 'serif', label: 'Serif', className: 'theme-serif' },
  { name: 'simple', label: 'Simple', className: 'theme-simple' },
  { name: 'solarized', label: 'Solarized', className: 'theme-solarized' },
  { name: 'moon', label: 'Moon', className: 'theme-moon' },
  { name: 'dracula', label: 'Dracula', className: 'theme-dracula' },
];

export interface SlideTransition {
  name: string;
  label: string;
  performance: 'high' | 'medium' | 'low';
}

export const SLIDE_TRANSITIONS: SlideTransition[] = [
  // High-performance transitions
  { name: 'none', label: 'None', performance: 'high' },
  { name: 'fade', label: 'Fade', performance: 'high' },
  { name: 'slide', label: 'Slide', performance: 'high' },
  
  // Medium-performance transitions
  { name: 'convex', label: 'Convex', performance: 'medium' },
  { name: 'concave', label: 'Concave', performance: 'medium' },
  
  // Low-performance transitions
  { name: 'zoom', label: 'Zoom', performance: 'low' },
];

export interface SlideBackground {
  color?: string;
  image?: string;
  video?: string;
  iframe?: string;
  transition?: string;
  opacity?: number;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  size?: 'cover' | 'contain' | 'auto';
  repeat?: boolean;
}

export interface SlideContent {
  id: string;
  title: string;
  content: string;
  notes?: string;
  background?: SlideBackground;
  transition?: string;
  timing?: {
    duration?: number;
    autoSlide?: boolean;
    autoSlideDelay?: number;
  };
}

export interface SlideSection {
  id: string;
  title: string;
  slides: SlideContent[];
  background?: SlideBackground;
  transition?: string;
}

export interface SlideBlockOptions {
  theme: string;
  transition: string;
  backgroundTransition: string;
  autoSlide: number;
  layout: string;
  enableMarkdown: boolean;
  enableHighlight: boolean;
  enableMath: boolean;
  enableZoom: boolean;
}

export const DEFAULT_OPTIONS: SlideBlockOptions = {
  theme: 'black',
  transition: 'slide',
  backgroundTransition: 'fade',
  autoSlide: 5000,
  layout: 'default',
  enableMarkdown: true,
  enableHighlight: true,
  enableMath: false,
  enableZoom: true,
};

export interface PresentationData {
  title: string;
  sections: SlideSection[];
  options: SlideBlockOptions;
}

// Performance optimization utilities
export const getOptimalTransition = (slideCount: number): string => {
  if (slideCount > 100) return 'none';
  if (slideCount > 50) return 'fade';
  return 'slide';
};

export const getOptimalViewDistance = (slideCount: number): number => {
  if (slideCount > 100) return 1;
  if (slideCount > 50) return 2;
  return 3;
};

export const shouldPreloadMedia = (slideCount: number): boolean => {
  return slideCount <= 20;
};

export const getOptimalSettings = (slideCount: number): Partial<SlideBlockOptions> => {
  return {
    transition: getOptimalTransition(slideCount),
    viewDistance: getOptimalViewDistance(slideCount),
    preloadIframes: shouldPreloadMedia(slideCount),
    autoPlayMedia: shouldPreloadMedia(slideCount),
    fragments: slideCount <= 50,
    backgroundTransition: 'none',
    disableLayout: slideCount > 100,
  };
};
