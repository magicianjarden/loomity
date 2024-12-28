import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const SelectionHighlight = Extension.create({
  name: 'selectionHighlight',

  addProseMirrorPlugins() {
    const key = new PluginKey('selectionHighlight');

    return [
      new Plugin({
        key,
        props: {
          decorations(state) {
            const { empty, from, to } = state.selection;
            
            // Don't highlight if there's no selection
            if (empty) {
              return DecorationSet.empty;
            }

            // Create decoration for the current selection
            const decoration = Decoration.inline(from, to, {
              class: 'selection-highlight',
            });

            return DecorationSet.create(state.doc, [decoration]);
          },
        },
      }),
    ];
  },
});
