import React from 'react';
import { cn } from '@/lib/utils';
import { NodeViewContent } from '@tiptap/react';
import { Plus, Grip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { motion } from 'framer-motion';

interface SlideAreaProps {
  id: string;
  type: 'text' | 'content' | 'image';
  gridArea: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export function SlideArea({
  id,
  type,
  gridArea,
  className,
  style,
  placeholder,
  onDragStart,
  onDragEnd,
  onDelete,
  onDuplicate,
}: SlideAreaProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isEmpty, setIsEmpty] = React.useState(true);

  const handleContentChange = (content: string) => {
    setIsEmpty(!content.trim());
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          whileHover={{ scale: 1.01 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className={cn(
            'relative rounded-lg border border-dashed border-muted-foreground/20',
            'transition-all duration-200',
            'group focus-within:border-primary/50 hover:border-primary/30',
            'w-full h-full flex flex-col',
            isEmpty && 'min-h-[120px]',
            className
          )}
          style={{
            gridArea,
            ...style,
          }}
          role="region"
          aria-label={`${type} content area`}
        >
          {/* Drag Handle */}
          {isHovered && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={onDragStart}
              onMouseUp={onDragEnd}
              aria-label="Drag to reorder"
            >
              <Grip className="h-4 w-4" />
            </Button>
          )}

          {/* Content */}
          <div className="flex-1 w-full h-full p-4">
            {type === 'text' ? (
              <div className="prose dark:prose-invert max-w-none w-full h-full flex items-center justify-center">
                <NodeViewContent 
                  className="outline-none break-words whitespace-pre-wrap w-full text-center" 
                  as="p" 
                  onInput={(e) => handleContentChange(e.currentTarget.textContent || '')}
                />
              </div>
            ) : type === 'content' ? (
              <NodeViewContent 
                className="outline-none break-words whitespace-pre-wrap prose dark:prose-invert max-w-none w-full h-full" 
                onInput={(e) => handleContentChange(e.currentTarget.textContent || '')}
              />
            ) : type === 'image' ? (
              <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">{placeholder}</p>
                {isHovered && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute inset-0 m-auto w-fit h-fit opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                )}
              </div>
            ) : null}
          </div>

          {/* Empty State */}
          {isEmpty && type !== 'image' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-sm text-muted-foreground">
                Click to add {type === 'text' ? 'text' : 'content'}
              </p>
            </div>
          )}
        </motion.div>
      </ContextMenuTrigger>
      
      <ContextMenuContent>
        <ContextMenuItem onClick={onDuplicate}>Duplicate</ContextMenuItem>
        <ContextMenuItem onClick={onDelete} className="text-destructive">
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
