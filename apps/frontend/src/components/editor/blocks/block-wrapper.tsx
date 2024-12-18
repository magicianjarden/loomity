import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Block } from '@/types/blocks';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface BlockWrapperProps {
  block: Block;
  index: number;
  children: React.ReactNode;
  isDragging?: boolean;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  block,
  index,
  children,
  isDragging,
}) => {
  return (
    <Draggable draggableId={block.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            'group relative flex items-start gap-2 rounded-lg p-2 transition-colors',
            snapshot.isDragging && 'bg-muted/50 shadow-lg',
            !snapshot.isDragging && 'hover:bg-muted/50'
          )}
        >
          <div
            {...provided.dragHandleProps}
            className="mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">{children}</div>
        </div>
      )}
    </Draggable>
  );
};
