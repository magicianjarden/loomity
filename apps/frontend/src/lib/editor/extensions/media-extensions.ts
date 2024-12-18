import { Extension } from '@tiptap/core';
import { Node } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

// Custom extension for file attachments
const FileAttachment = Node.create({
  name: 'fileAttachment',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      filename: {
        default: null,
      },
      filesize: {
        default: null,
      },
      filetype: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-file-attachment]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-file-attachment': '', ...HTMLAttributes }];
  },
});

// Custom extension for user mentions
const UserMention = Node.create({
  name: 'mention',
  group: 'inline',
  inline: true,
  selectable: false,
  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-mention-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {};
          }

          return {
            'data-mention-id': attributes.id,
          };
        },
      },
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-mention-label'),
        renderHTML: attributes => {
          if (!attributes.label) {
            return {};
          }

          return {
            'data-mention-label': attributes.label,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-mention]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { 'data-mention': '', ...HTMLAttributes }];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('mention'),
        props: {
          decorations: state => {
            const { doc } = state;
            const decorations: Decoration[] = [];

            doc.descendants((node, pos) => {
              if (node.type.name !== this.name) {
                return;
              }

              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  class: 'mention',
                })
              );
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

// Configure YouTube extension
const CustomYoutube = Youtube.configure({
  width: 840,
  height: 472.5,
  allowFullscreen: true,
  HTMLAttributes: {
    class: 'youtube-embed',
  },
});

// Configure Image extension
const CustomImage = Image.configure({
  allowBase64: true,
  HTMLAttributes: {
    class: 'editor-image',
  },
});

export const mediaExtensions = [
  FileAttachment,
  UserMention,
  CustomYoutube,
  CustomImage,
];
