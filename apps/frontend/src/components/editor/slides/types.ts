import { Editor } from '@tiptap/core';

export const SLIDE_ASPECT_RATIO = 16 / 9;
export const DEFAULT_SLIDE_WIDTH = 1920;
export const DEFAULT_SLIDE_HEIGHT = DEFAULT_SLIDE_WIDTH / SLIDE_ASPECT_RATIO;

export const GRID_COLUMNS = 12;
export const GRID_ROWS = 12;
export const GRID_GAP = '8px';

export type ElementType = 'text' | 'shape' | 'image' | 'code' | 'table' | 'chart';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Animation {
  type: 'fade' | 'slide' | 'scale';
  duration: number;
  delay: number;
}

export interface Background {
  type: 'color' | 'image' | 'gradient';
  value: string;
}

export interface ElementStyle {
  position: Position;
  size: Size;
  rotation: number;
  opacity: number;
  zIndex: number;
  color?: string;
  backgroundColor?: string;
  fontSize?: string | number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  borderRadius?: string | number;
  borderWidth?: number;
  borderColor?: string;
  padding?: string | number;
  objectFit?: 'contain' | 'cover' | 'fill';
}

export interface TextContent {
  html: string;
  plainText: string;
}

export interface ShapeContent {
  shapeType: 'rectangle' | 'circle';
}

export interface ImageContent {
  src: string;
  alt?: string;
}

export interface CodeContent {
  code: string;
  language: string;
}

export interface TableContent {
  rows: number;
  cols: number;
  data: string[][];
}

export interface ChartContent {
  type: 'bar' | 'line' | 'pie';
  data: any[];
}

export interface SlideElement {
  id: string;
  type: ElementType;
  content: TextContent | ShapeContent | ImageContent | CodeContent | TableContent | ChartContent;
  style: ElementStyle;
  animation?: Animation;
}

export interface Slide {
  id: string;
  elements: SlideElement[];
  background: Background;
  notes?: string;
}

export interface SlideLayout {
  id: string;
  name: string;
  elements: SlideElement[];
  background: Background;
}

export interface SlideEditorProps {
  editor: Editor;
  slide: Slide;
  isEditing: boolean;
  onUpdate: (slide: Slide) => void;
}

export interface SlideToolbarProps {
  editor: Editor;
  slide: Slide;
  onElementAdd: (type: ElementType) => void;
  onElementDelete: (id: string) => void;
  onElementStyle: (id: string, style: Partial<ElementStyle>) => void;
  onElementAnimation: (id: string, animation: Animation) => void;
  onSlideBackground: (background: Background) => void;
}

export interface ElementToolbarProps {
  element: SlideElement;
  onUpdate: (updates: Partial<SlideElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onLock: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}
