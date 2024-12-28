import { SlideElement } from './types';

export interface SlideLayout {
  id: string;
  name: string;
  elements: SlideElement[];
}

export const slideLayouts: SlideLayout[] = [
  {
    id: 'title',
    name: 'Title Slide',
    elements: [
      {
        id: 'title',
        type: 'text',
        content: {
          html: '<h1>Click to edit title</h1>',
          plainText: 'Click to edit title',
        },
        style: {
          position: { x: 100, y: 100 },
          size: { width: 800, height: 100 },
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          fontSize: 48,
          fontFamily: 'Inter',
          textAlign: 'center',
          color: '#000000',
        },
      },
      {
        id: 'subtitle',
        type: 'text',
        content: {
          html: '<h2>Click to edit subtitle</h2>',
          plainText: 'Click to edit subtitle',
        },
        style: {
          position: { x: 100, y: 250 },
          size: { width: 800, height: 60 },
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          fontSize: 32,
          fontFamily: 'Inter',
          textAlign: 'center',
          color: '#666666',
        },
      },
    ],
  },
  {
    id: 'content',
    name: 'Content',
    elements: [
      {
        id: 'title',
        type: 'text',
        content: {
          html: '<h2>Click to edit title</h2>',
          plainText: 'Click to edit title',
        },
        style: {
          position: { x: 100, y: 50 },
          size: { width: 800, height: 60 },
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          fontSize: 32,
          fontFamily: 'Inter',
          textAlign: 'left',
          color: '#000000',
        },
      },
      {
        id: 'content',
        type: 'text',
        content: {
          html: '<ul><li>Click to edit content</li></ul>',
          plainText: 'Click to edit content',
        },
        style: {
          position: { x: 100, y: 150 },
          size: { width: 800, height: 400 },
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          fontSize: 24,
          fontFamily: 'Inter',
          textAlign: 'left',
          color: '#000000',
        },
      },
    ],
  },
  {
    id: 'two-column',
    name: 'Two Columns',
    elements: [
      {
        id: 'title',
        type: 'text',
        content: {
          html: '<h2>Click to edit title</h2>',
          plainText: 'Click to edit title',
        },
        style: {
          position: { x: 100, y: 50 },
          size: { width: 800, height: 60 },
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          fontSize: 32,
          fontFamily: 'Inter',
          textAlign: 'left',
          color: '#000000',
        },
      },
      {
        id: 'left-content',
        type: 'text',
        content: {
          html: '<ul><li>Left column content</li></ul>',
          plainText: 'Left column content',
        },
        style: {
          position: { x: 100, y: 150 },
          size: { width: 380, height: 400 },
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          fontSize: 24,
          fontFamily: 'Inter',
          textAlign: 'left',
          color: '#000000',
        },
      },
      {
        id: 'right-content',
        type: 'text',
        content: {
          html: '<ul><li>Right column content</li></ul>',
          plainText: 'Right column content',
        },
        style: {
          position: { x: 520, y: 150 },
          size: { width: 380, height: 400 },
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          fontSize: 24,
          fontFamily: 'Inter',
          textAlign: 'left',
          color: '#000000',
        },
      },
    ],
  },
  {
    id: 'image-text',
    name: 'Image with Text',
    elements: [
      {
        id: 'title',
        type: 'text',
        content: {
          html: '<h2>Click to edit title</h2>',
          plainText: 'Click to edit title',
        },
        style: {
          position: { x: 100, y: 50 },
          size: { width: 800, height: 60 },
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          fontSize: 32,
          fontFamily: 'Inter',
          textAlign: 'left',
          color: '#000000',
        },
      },
      {
        id: 'image',
        type: 'image',
        content: {
          src: '',
          alt: 'Add an image',
        },
        style: {
          position: { x: 100, y: 150 },
          size: { width: 380, height: 400 },
          rotation: 0,
          opacity: 1,
          zIndex: 1,
        },
      },
      {
        id: 'content',
        type: 'text',
        content: {
          html: '<p>Click to edit content</p>',
          plainText: 'Click to edit content',
        },
        style: {
          position: { x: 520, y: 150 },
          size: { width: 380, height: 400 },
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          fontSize: 24,
          fontFamily: 'Inter',
          textAlign: 'left',
          color: '#000000',
        },
      },
    ],
  },
];
