import React from 'react';
import { BaseElement, BaseElementProps } from './base-element';

export const ShapeElement: React.FC<BaseElementProps> = (props) => {
  return (
    <BaseElement {...props}>
      <div
        className="w-full h-full"
        style={{
          backgroundColor: props.element.style.backgroundColor,
          borderRadius: props.element.style.borderRadius,
          border: props.element.style.borderWidth 
            ? `${props.element.style.borderWidth}px solid ${props.element.style.borderColor}` 
            : undefined,
        }}
      />
    </BaseElement>
  );
};
