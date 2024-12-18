import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import { Markdown } from 'tiptap-markdown';

// Custom extension for smart typography
const SmartTypography = Typography;

// Custom extension for text alignment
const CustomTextAlign = TextAlign.configure({
  types: ['heading', 'paragraph'],
  alignments: ['left', 'center', 'right', 'justify'],
});

// Custom extension for font families
const CustomFontFamily = FontFamily.configure({
  types: ['heading', 'paragraph', 'text'],
});

// Custom extension for text colors and background colors
const CustomTextStyle = TextStyle;

const CustomColor = Color;

const CustomHighlight = Highlight.configure({
  multicolor: true,
});

export const baseExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },
    bulletList: {},
    orderedList: {},
    listItem: {},
    strike: {},
    bold: {},
    italic: {},
    code: {},
    codeBlock: false, // We'll use a custom code block extension
  }),
  SmartTypography,
  CustomTextAlign,
  CustomFontFamily,
  CustomTextStyle,
  CustomColor,
  CustomHighlight,
  Subscript,
  Superscript,
  Markdown,
];
