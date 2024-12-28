import { SlideCategory } from './types';

export interface LayoutCategoryConfig {
  id: SlideCategory;
  name: string;
  description: string;
  icon: string;
  order: number;
}

export const LAYOUT_CATEGORIES: LayoutCategoryConfig[] = [
  {
    id: 'title',
    name: 'Title Slides',
    description: 'Slides for starting your presentation or introducing new sections',
    icon: 'text-heading',
    order: 1,
  },
  {
    id: 'content',
    name: 'Content',
    description: 'General purpose slides for text and content',
    icon: 'layout',
    order: 2,
  },
  {
    id: 'comparison',
    name: 'Comparison',
    description: 'Slides for comparing items or showing relationships',
    icon: 'git-compare',
    order: 3,
  },
  {
    id: 'media',
    name: 'Media',
    description: 'Slides optimized for images, videos, and other media',
    icon: 'image',
    order: 4,
  },
  {
    id: 'data',
    name: 'Data',
    description: 'Slides for charts, tables, and data visualization',
    icon: 'bar-chart',
    order: 5,
  },
  {
    id: 'section',
    name: 'Section',
    description: 'Slides for dividing your presentation into sections',
    icon: 'separator-horizontal',
    order: 6,
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Your custom and saved slide layouts',
    icon: 'settings',
    order: 7,
  },
];
