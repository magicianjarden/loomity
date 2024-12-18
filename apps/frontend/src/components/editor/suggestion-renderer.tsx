import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { SuggestionList } from './suggestion-list';

export const renderSuggestion = () => {
  let component: any;
  let popup: any;

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(SuggestionList, {
        props,
        editor: props.editor,
      });

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
        theme: 'light-border',
        animation: 'scale-subtle',
        duration: 100,
      });

      // Add dark mode support
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const isDark = document.documentElement.classList.contains('dark');
            popup[0].popper.classList.toggle('dark', isDark);
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    },

    onUpdate: (props: any) => {
      component.updateProps(props);
      popup[0].setProps({
        getReferenceClientRect: props.clientRect,
      });
    },

    onKeyDown: (props: any) => {
      if (props.event.key === 'Escape') {
        popup[0].hide();
        return true;
      }
      return component.ref?.onKeyDown(props);
    },

    onExit: () => {
      popup[0].destroy();
      component.destroy();
    },
  };
};
