import React from 'react';
import { BaseElement, BaseElementProps } from './base-element';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export const TextElement: React.FC<BaseElementProps> = (props) => {
  const editor = new Editor({
    extensions: [StarterKit],
    content: props.element.content.html,
    editable: props.isEditing,
    onUpdate: ({ editor }) => {
      // Handle text updates here
      console.log('Text updated:', editor.getHTML());
    },
  });

  return (
    <BaseElement {...props}>
      <div
        className="w-full h-full p-2"
        style={{
          color: props.element.style.color,
          fontSize: props.element.style.fontSize,
          fontFamily: props.element.style.fontFamily,
          textAlign: props.element.style.textAlign as any,
        }}
        dangerouslySetInnerHTML={{ __html: props.element.content.html }}
      />
    </BaseElement>
  );
};
