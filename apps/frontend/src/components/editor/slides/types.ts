// Layout constraints and constants
export const SLIDE_ASPECT_RATIO = 16 / 9;
export const DEFAULT_SLIDE_WIDTH = 1920;
export const DEFAULT_SLIDE_HEIGHT = DEFAULT_SLIDE_WIDTH / SLIDE_ASPECT_RATIO;

export const GRID_COLUMNS = 12;
export const GRID_ROWS = 12;
export const GRID_GAP = '8px';

export type SlideAreaType = 'text' | 'content' | 'image';

export interface SlideArea {
  id: string;
  type: SlideAreaType;
  gridArea: string;
  className?: string;
  placeholder?: string;
}

export interface SlideLayout {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  structure: {
    layout: 'grid';
    gridTemplate: {
      areas: string[];
      columns: string;
      rows: string;
    };
    areas: SlideArea[];
  };
}

export interface SlideAttributes {
  id: string;
  layout: string;
  structure: SlideLayout['structure'];
  notes?: string;
  showNotes?: boolean;
}
