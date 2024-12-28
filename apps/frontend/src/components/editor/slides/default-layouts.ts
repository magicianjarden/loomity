import { SlideLayout, GRID_COLUMNS, GRID_ROWS } from './types';

// Helper function to convert grid coordinates to percentages
const gridToPercent = (grid: { x: number; y: number; w: number; h: number }) => ({
  position: {
    x: (grid.x / GRID_COLUMNS) * 100,
    y: (grid.y / GRID_ROWS) * 100,
  },
  size: {
    width: (grid.w / GRID_COLUMNS) * 100,
    height: (grid.h / GRID_ROWS) * 100,
  },
});

export const DEFAULT_LAYOUTS: SlideLayout[] = [
  {
    id: 'title-slide',
    name: 'Title Slide',
    thumbnail: '/layouts/title-slide.svg',
    type: 'default',
    structure: {
      areas: [
        {
          id: 'title',
          type: 'title',
          ...gridToPercent({ x: 2, y: 3, w: 8, h: 2 }),
          defaultContent: 'Click to add title',
        },
        {
          id: 'subtitle',
          type: 'content',
          ...gridToPercent({ x: 2, y: 5, w: 8, h: 1 }),
          defaultContent: 'Click to add subtitle',
        },
      ],
    },
  },
  {
    id: 'content',
    name: 'Content',
    thumbnail: '/layouts/content.svg',
    type: 'default',
    structure: {
      areas: [
        {
          id: 'title',
          type: 'title',
          ...gridToPercent({ x: 1, y: 1, w: 10, h: 1 }),
          defaultContent: 'Click to add title',
        },
        {
          id: 'content',
          type: 'content',
          ...gridToPercent({ x: 1, y: 2.5, w: 10, h: 8 }),
          defaultContent: 'Click to add content',
        },
      ],
    },
  },
  {
    id: 'two-column',
    name: 'Two Columns',
    thumbnail: '/layouts/two-column.svg',
    type: 'default',
    structure: {
      areas: [
        {
          id: 'title',
          type: 'title',
          ...gridToPercent({ x: 1, y: 1, w: 10, h: 1 }),
          defaultContent: 'Click to add title',
        },
        {
          id: 'left-content',
          type: 'content',
          ...gridToPercent({ x: 1, y: 2.5, w: 5, h: 8 }),
          defaultContent: 'Left column content',
        },
        {
          id: 'right-content',
          type: 'content',
          ...gridToPercent({ x: 6, y: 2.5, w: 5, h: 8 }),
          defaultContent: 'Right column content',
        },
      ],
    },
  },
  {
    id: 'image-content',
    name: 'Image with Content',
    thumbnail: '/layouts/image-content.svg',
    type: 'default',
    structure: {
      areas: [
        {
          id: 'title',
          type: 'title',
          ...gridToPercent({ x: 1, y: 1, w: 10, h: 1 }),
          defaultContent: 'Click to add title',
        },
        {
          id: 'image',
          type: 'image',
          ...gridToPercent({ x: 1, y: 2.5, w: 5, h: 8 }),
        },
        {
          id: 'content',
          type: 'content',
          ...gridToPercent({ x: 6, y: 2.5, w: 5, h: 8 }),
          defaultContent: 'Click to add content',
        },
      ],
    },
  },
  {
    id: 'section',
    name: 'Section Break',
    thumbnail: '/layouts/section.svg',
    type: 'default',
    structure: {
      areas: [
        {
          id: 'title',
          type: 'title',
          ...gridToPercent({ x: 2, y: 4, w: 8, h: 4 }),
          defaultContent: 'Section Title',
        },
      ],
    },
  },
  {
    id: 'blank',
    name: 'Blank',
    thumbnail: '/layouts/blank.svg',
    type: 'default',
    structure: {
      areas: [],
    },
  },
  {
    id: 'quote',
    name: 'Quote',
    thumbnail: '/layouts/quote.svg',
    type: 'default',
    structure: {
      areas: [
        {
          id: 'quote',
          type: 'content',
          ...gridToPercent({ x: 2, y: 3, w: 8, h: 4 }),
          defaultContent: '"Click to add your quote here"',
        },
        {
          id: 'author',
          type: 'content',
          ...gridToPercent({ x: 2, y: 7, w: 8, h: 1 }),
          defaultContent: '- Author Name',
        },
      ],
    },
  },
];
