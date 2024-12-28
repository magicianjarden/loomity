import React from 'react';
import { BaseElement, BaseElementProps } from './base-element';
import { cn } from '@/lib/utils';

export const ImageElement: React.FC<BaseElementProps> = (props) => {
  return (
    <BaseElement {...props}>
      <img
        src={props.element.content.src}
        alt={props.element.content.alt || ''}
        className={cn(
          "w-full h-full object-contain",
          props.element.style.objectFit,
        )}
        style={{
          borderRadius: props.element.style.borderRadius,
          border: props.element.style.borderWidth 
            ? `${props.element.style.borderWidth}px solid ${props.element.style.borderColor}` 
            : undefined,
        }}
      />
    </BaseElement>
  );
};
