import React from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Block } from '@/types/blocks';
import { BlockWrapper } from './block-wrapper';
import { BlockContent } from './block-content';
import { useToast } from '@/components/ui/use-toast';

interface BlockListProps {
  blocks: Block[];
  documentId: string;
  parentBlockId?: string;
  onReorder: (result: DropResult) => Promise<void>;
}

export const BlockList: React.FC<BlockListProps> = ({
  blocks,
  documentId,
  parentBlockId,
  onReorder,
}) => {
  const { toast } = useToast();

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    try {
      await onReorder(result);
    } catch (error) {
      toast({
        title: 'Error reordering blocks',
        description: 'There was an error reordering the blocks. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable
        droppableId={parentBlockId || documentId}
        type={`BLOCK-${parentBlockId || documentId}`}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={snapshot.isDraggingOver ? 'bg-muted/30' : ''}
          >
            {blocks.map((block, index) => (
              <BlockWrapper
                key={block.id}
                block={block}
                index={index}
                isDragging={snapshot.isDraggingOver}
              >
                <BlockContent block={block} />
              </BlockWrapper>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
