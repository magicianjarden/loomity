import React from 'react';
import { BaseElement, BaseElementProps } from './base-element';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const CodeElement: React.FC<BaseElementProps> = (props) => {
  return (
    <BaseElement {...props}>
      <div className="w-full h-full overflow-auto rounded-md">
        <SyntaxHighlighter
          language={props.element.content.language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            height: '100%',
            fontSize: props.element.style.fontSize,
            backgroundColor: 'transparent',
          }}
        >
          {props.element.content.code}
        </SyntaxHighlighter>
      </div>
    </BaseElement>
  );
};
