import { Extension } from '@tiptap/core';
import { Node } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import data from '@emoji-mart/data';
import { init, SearchIndex } from 'emoji-mart';
import { EmojiMart } from 'emoji-mart';
import { PluginDefinition, PluginAPI, PluginContext } from '../../lib/plugin-sdk/types';

interface EmojiAttributes {
  id: string;
  native: string;
  shortcodes: string[];
}

const EmojiNode = Node.create({
  name: 'emoji',
  group: 'inline',
  inline: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      native: {
        default: null,
      },
      shortcodes: {
        default: [],
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-emoji]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { 'data-emoji': '', ...HTMLAttributes }, HTMLAttributes.native];
  },

  addCommands() {
    return {
      insertEmoji:
        (attributes: EmojiAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },
});

const EmojiExtension = Extension.create({
  name: 'emoji',

  addNodes() {
    return [EmojiNode];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('emoji'),
        props: {
          handleTextInput: (view, from, to, text) => {
            if (text === ':') {
              // Show emoji picker
              return false;
            }
            return false;
          },
        },
      }),
    ];
  },
});

let searchIndex: SearchIndex;

init({ data }).then((searchApi) => {
  searchIndex = searchApi;
});

export const EmojiPickerPlugin: PluginDefinition = {
  metadata: {
    id: 'emoji-picker',
    name: 'Emoji Picker',
    description: 'Add emojis to your documents with a searchable picker',
    version: '1.0.0',
    author: 'Loomity',
    website: 'https://loomity.dev/plugins/emoji-picker',
    repository: 'https://github.com/loomity/emoji-picker',
    license: 'MIT',
    category: 'media_embeds',
    tags: ['emoji', 'picker', 'media'],
    status: 'active',
    permissions: {
      read: true,
      write: true,
      execute: false,
    },
    pricing: {
      type: 'free',
    },
  },

  async initialize(context: PluginContext) {
    const { editor } = context;
    editor.registerExtension(EmojiExtension);
  },

  async activate() {
    // Plugin is ready to use
  },

  async deactivate() {
    // Clean up any resources
  },

  getAPI(): PluginAPI {
    return {
      insertContent: async (content: string) => {
        // Implementation
      },
      replaceContent: async (content: string) => {
        // Implementation
      },
      getContent: async () => {
        return '';
      },
      getSelection: async () => {
        return { from: 0, to: 0 };
      },
      insertEmoji: async (emoji: EmojiAttributes) => {
        const { editor } = this.context;
        editor.commands.insertEmoji(emoji);
      },
      searchEmojis: async (query: string) => {
        if (!searchIndex) {
          await init({ data });
        }
        return searchIndex.search(query);
      },
    };
  },
};
