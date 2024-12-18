import { SlideLayout } from './types';

export const slideLayouts: SlideLayout[] = [
  {
    id: 'title',
    name: 'Title Slide',
    description: 'A slide with a large title and optional subtitle',
    structure: {
      layout: 'grid',
      gridTemplate: {
        areas: [
          'title title title',
          'subtitle subtitle subtitle'
        ],
        columns: '1fr 1fr 1fr',
        rows: '60% 40%'
      },
      areas: [
        {
          id: 'title',
          type: 'text',
          gridArea: 'title',
          className: 'text-4xl font-bold text-center',
          placeholder: 'Title',
        },
        {
          id: 'subtitle',
          type: 'text',
          gridArea: 'subtitle',
          className: 'text-xl text-muted-foreground text-center',
          placeholder: 'Subtitle',
        },
      ],
    },
    thumbnail: '/layouts/title-slide.svg',
  },
  {
    id: 'content',
    name: 'Content',
    description: 'A slide with a title and content area',
    structure: {
      layout: 'grid',
      gridTemplate: {
        areas: [
          'header header header',
          'content content content'
        ],
        columns: '1fr 1fr 1fr',
        rows: '20% 80%'
      },
      areas: [
        {
          id: 'header',
          type: 'text',
          gridArea: 'header',
          className: 'text-2xl font-semibold',
          placeholder: 'Title',
        },
        {
          id: 'content',
          type: 'content',
          gridArea: 'content',
          className: 'prose dark:prose-invert max-w-none',
          placeholder: 'Content',
        },
      ],
    },
    thumbnail: '/layouts/content.svg',
  },
  {
    id: 'two-column',
    name: 'Two Columns',
    description: 'A slide with two equal columns',
    structure: {
      layout: 'grid',
      gridTemplate: {
        areas: [
          'header header header',
          'left right right'
        ],
        columns: '1fr 1fr 1fr',
        rows: '20% 80%'
      },
      areas: [
        {
          id: 'header',
          type: 'text',
          gridArea: 'header',
          className: 'text-2xl font-semibold',
          placeholder: 'Title',
        },
        {
          id: 'left',
          type: 'content',
          gridArea: 'left',
          className: 'prose dark:prose-invert max-w-none',
          placeholder: 'Left Column',
        },
        {
          id: 'right',
          type: 'content',
          gridArea: 'right',
          className: 'prose dark:prose-invert max-w-none',
          placeholder: 'Right Column',
        },
      ],
    },
    thumbnail: '/layouts/two-column.svg',
  },
  {
    id: 'image-content',
    name: 'Image with Content',
    description: 'A slide with an image on one side and content on the other',
    structure: {
      layout: 'grid',
      gridTemplate: {
        areas: [
          'header header header',
          'image content content'
        ],
        columns: '1fr 1fr 1fr',
        rows: '20% 80%'
      },
      areas: [
        {
          id: 'header',
          type: 'text',
          gridArea: 'header',
          className: 'text-2xl font-semibold',
          placeholder: 'Title',
        },
        {
          id: 'image',
          type: 'image',
          gridArea: 'image',
          className: 'aspect-square',
          placeholder: 'Click to add image',
        },
        {
          id: 'content',
          type: 'content',
          gridArea: 'content',
          className: 'prose dark:prose-invert max-w-none',
          placeholder: 'Content',
        },
      ],
    },
    thumbnail: '/layouts/image-content.svg',
  },
  {
    id: 'section',
    name: 'Section Break',
    description: 'A slide to mark a new section',
    structure: {
      layout: 'grid',
      areas: [
        {
          id: 'title',
          type: 'text',
          gridArea: '1 / 1 / 2 / 2',
          className: 'text-5xl font-bold text-center',
          placeholder: 'Section Title',
        },
      ],
    },
    thumbnail: '/layouts/section.svg',
  },
  {
    id: 'blank',
    name: 'Blank',
    description: 'A blank slide for custom content',
    structure: {
      layout: 'grid',
      areas: [
        {
          id: 'content',
          type: 'content',
          gridArea: '1 / 1 / 2 / 2',
          className: 'prose dark:prose-invert max-w-none',
          placeholder: 'Content',
        },
      ],
    },
    thumbnail: '/layouts/blank.svg',
  },
];
