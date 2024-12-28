import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface TextHighlightOptions {
  pattern?: string | RegExp;
  decorationClass?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textHighlight: {
      setTextHighlight: (pattern: string | RegExp) => ReturnType;
      clearTextHighlight: () => ReturnType;
    };
  }
}

export const TextHighlight = Extension.create<TextHighlightOptions>({
  name: 'textHighlight',

  addOptions() {
    return {
      pattern: '',
      decorationClass: 'text-highlight',
    };
  },

  addCommands() {
    return {
      setTextHighlight:
        (pattern: string | RegExp) =>
        ({ editor }) => {
          this.options.pattern = pattern;
          editor.view.dispatch(editor.state.tr);
          return true;
        },
      clearTextHighlight:
        () =>
        ({ editor }) => {
          this.options.pattern = '';
          editor.view.dispatch(editor.state.tr);
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const key = new PluginKey('textHighlight');
    const extension = this;

    return [
      new Plugin({
        key,
        props: {
          decorations(state) {
            const { pattern, decorationClass } = extension.options;
            if (!pattern) return DecorationSet.empty;

            const decorations: Decoration[] = [];
            const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'gi');

            state.doc.descendants((node, pos) => {
              if (node.isText) {
                const text = node.text || '';
                let match;

                while ((match = regex.exec(text)) !== null) {
                  const from = pos + match.index;
                  const to = from + match[0].length;

                  decorations.push(
                    Decoration.inline(from, to, {
                      class: decorationClass,
                    })
                  );
                }
              }
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
