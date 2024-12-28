export enum SlideLayout {
  TITLE = 'TITLE',
  CONTENT = 'CONTENT',
  IMAGE_TEXT = 'IMAGE_TEXT',
  TWO_COLUMN = 'TWO_COLUMN',
  FULL_IMAGE = 'FULL_IMAGE',
  QUOTE = 'QUOTE',
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number | 'auto';
  height: number | 'auto';
}

export interface ElementStyle {
  position: Position;
  size: Size;
  rotation: number;
  opacity: number;
}

export interface Animation {
  id: string;
  type: 'fadeIn' | 'slideIn' | 'bounce' | 'zoom' | 'custom';
  delay: number;
  duration: number;
  easing: string;
  properties?: Record<string, any>;
}

export interface Transition {
  type: 'fade' | 'slide' | 'zoom';
  duration: number;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export interface SlideTransitions {
  in: Transition;
  out: Transition;
}

export interface Background {
  type: 'color' | 'image' | 'gradient';
  value: string;
}

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: {
    padding: string;
    gap: string;
  };
}

export interface PresentationSettings {
  aspectRatio: '16:9' | '4:3' | 'custom';
  showSlideNumbers: boolean;
  autoPlay: boolean;
  loop: boolean;
  transitionDuration: number;
}

export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'video' | 'chart';
  content: any;
  style: ElementStyle;
  animations: Animation[];
}

export interface Slide {
  id: string;
  presentationId: string;
  layout: SlideLayout;
  content: {
    elements: SlideElement[];
  };
  background: Background;
  transitions: SlideTransitions;
  animations: Animation[];
  notes?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Presentation {
  id: string;
  title: string;
  theme: Theme;
  settings: PresentationSettings;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PresentationAsset {
  id: string;
  presentationId: string;
  type: 'image' | 'video' | 'font';
  name: string;
  url: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
