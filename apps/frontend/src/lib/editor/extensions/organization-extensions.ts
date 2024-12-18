import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import CharacterCount from '@tiptap/extension-character-count';

// Custom extension for footnotes
const Footnote = Extension.create({
  name: 'footnote',
  addAttributes() {
    return {
      id: {
        default: null,
      },
      content: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'sup[data-footnote]',
        getAttrs: (dom: HTMLElement) => ({
          id: dom.getAttribute('data-footnote-id'),
          content: dom.getAttribute('data-footnote-content'),
        }),
      },
    ];
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ['sup', { ...HTMLAttributes, 'data-footnote': '' }, 0];
  },
});

// Custom extension for reading time estimate
const ReadingTime = Extension.create({
  name: 'readingTime',

  addStorage() {
    return {
      readingTime: 0,
      wordCount: 0,
    };
  },

  onCreate() {
    // @ts-ignore - These methods are added in the extension
    this.storage.readingTime = this.calculateReadingTime();
    // @ts-ignore - These methods are added in the extension
    this.storage.wordCount = this.calculateWordCount();
  },

  addProseMirrorPlugins() {
    const extension = this;
    return [
      new Plugin({
        key: new PluginKey('readingTime'),
        view: () => ({
          update: () => {
            // @ts-ignore - These methods are added in the extension
            extension.storage.readingTime = extension.calculateReadingTime();
            // @ts-ignore - These methods are added in the extension
            extension.storage.wordCount = extension.calculateWordCount();
          },
        }),
      }),
    ];
  },

  calculateReadingTime() {
    const text = this.editor.getText();
    const words = text.trim().split(/\s+/).length;
    const wordsPerMinute = 200;
    return Math.ceil(words / wordsPerMinute);
  },

  calculateWordCount() {
    const text = this.editor.getText();
    return text.trim().split(/\s+/).length;
  },
});

// Custom Table of Contents configuration
const CustomCharacterCount = CharacterCount.configure({
  limit: null,
});

export const organizationExtensions = [
  Footnote,
  ReadingTime,
  CustomCharacterCount,
];
