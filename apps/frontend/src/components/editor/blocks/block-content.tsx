import React from 'react';
import { Block } from '@/types/blocks';
import { cn } from '@/lib/utils';

interface BlockContentProps {
  block: Block;
}

export const BlockContent: React.FC<BlockContentProps> = ({ block }) => {
  const { blockType, content, properties } = block;

  const getBlockStyle = () => {
    return {
      textAlign: properties.textAlign,
      backgroundColor: properties.backgroundColor,
      color: properties.textColor,
    };
  };

  switch (blockType) {
    case 'heading1':
      return (
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl" style={getBlockStyle()}>
          {content}
        </h1>
      );
    case 'heading2':
      return (
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight" style={getBlockStyle()}>
          {content}
        </h2>
      );
    case 'heading3':
      return (
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight" style={getBlockStyle()}>
          {content}
        </h3>
      );
    case 'quote':
      return (
        <blockquote className="mt-6 border-l-2 pl-6 italic" style={getBlockStyle()}>
          {content}
        </blockquote>
      );
    case 'codeBlock':
      return (
        <pre className={cn(
          'rounded-lg p-4',
          'bg-muted font-mono text-sm'
        )}>
          <code>{content}</code>
        </pre>
      );
    case 'image':
      return (
        <figure className="relative">
          <img
            src={properties.url}
            alt={properties.alt || ''}
            className="rounded-lg"
            style={getBlockStyle()}
          />
          {properties.alt && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2">
              {properties.alt}
            </figcaption>
          )}
        </figure>
      );
    case 'bulletList':
      return (
        <ul className="my-6 ml-6 list-disc [&>li]:mt-2" style={getBlockStyle()}>
          {content}
        </ul>
      );
    case 'numberedList':
      return (
        <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" style={getBlockStyle()}>
          {content}
        </ol>
      );
    case 'listItem':
      return <li style={getBlockStyle()}>{content}</li>;
    case 'paragraph':
    default:
      return (
        <p className="leading-7 [&:not(:first-child)]:mt-6" style={getBlockStyle()}>
          {content}
        </p>
      );
  }
};
