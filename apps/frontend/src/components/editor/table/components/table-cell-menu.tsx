import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Combine,
  Split,
  MessageSquare,
  Trash,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { useTableStore } from '../table-store';
import { TableCell, TableColumn } from '../table-types';
import { mergeCells, splitCells, addCellComment, removeCellComment } from '../utils/table-cell-operations';
import { getTableHistory } from '../utils/table-history';

interface TableCellMenuProps {
  rowId: string;
  columnId: string;
  cell: TableCell;
  column: TableColumn;
}

export const TableCellMenu: React.FC<TableCellMenuProps> = ({
  rowId,
  columnId,
  cell,
  column,
}) => {
  const { data, setData } = useTableStore();
  const [commentText, setCommentText] = useState(cell.comment || '');
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  const handleMergeCells = () => {
    if (!data.state.selection) return;

    const newData = mergeCells(data, data.state.selection);
    if (Object.keys(newData).length > 0) {
      setData({ ...data, ...newData });
      getTableHistory(data).record({ ...data, ...newData });
    }
  };

  const handleSplitCells = () => {
    if (!data.state.selection) return;

    const newData = splitCells(data, data.state.selection);
    if (Object.keys(newData).length > 0) {
      setData({ ...data, ...newData });
      getTableHistory(data).record({ ...data, ...newData });
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newData = addCellComment(data, rowId, columnId, commentText.trim());
    if (Object.keys(newData).length > 0) {
      setData({ ...data, ...newData });
      getTableHistory(data).record({ ...data, ...newData });
    }
    setIsCommentOpen(false);
  };

  const handleRemoveComment = () => {
    const newData = removeCellComment(data, rowId, columnId);
    if (Object.keys(newData).length > 0) {
      setData({ ...data, ...newData });
      getTableHistory(data).record({ ...data, ...newData });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <span className="sr-only">Open cell menu</span>
          <AlertCircle className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {data.state.selection && (
          <>
            <DropdownMenuItem onClick={handleMergeCells}>
              <Combine className="h-4 w-4 mr-2" />
              Merge Cells
            </DropdownMenuItem>
            {(cell.rowspan || cell.colspan) && (
              <DropdownMenuItem onClick={handleSplitCells}>
                <Split className="h-4 w-4 mr-2" />
                Split Cells
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}

        <Dialog open={isCommentOpen} onOpenChange={setIsCommentOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <MessageSquare className="h-4 w-4 mr-2" />
              {cell.comment ? 'Edit Comment' : 'Add Comment'}
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {cell.comment ? 'Edit Comment' : 'Add Comment'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <textarea
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                placeholder="Enter your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCommentOpen(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleAddComment}>
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {cell.comment && (
          <DropdownMenuItem
            onClick={handleRemoveComment}
            className="text-red-600"
          >
            <Trash className="h-4 w-4 mr-2" />
            Remove Comment
          </DropdownMenuItem>
        )}

        {cell.error && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
              Validation Error
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <div className="px-2 py-1.5 text-sm text-red-500">
                {cell.error}
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
