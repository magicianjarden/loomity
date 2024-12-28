import React from 'react';
import { Table } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/client-icon';

interface TableMenuProps {
  table: Table<any>;
  onDeleteColumn: () => void;
  onDeleteRow: () => void;
  onDuplicateColumn: () => void;
  onDuplicateRow: () => void;
  onSortAsc: () => void;
  onSortDesc: () => void;
  onHideColumn: () => void;
}

export const TableMenu: React.FC<TableMenuProps> = ({
  table,
  onDeleteColumn,
  onDeleteRow,
  onDuplicateColumn,
  onDuplicateRow,
  onSortAsc,
  onSortDesc,
  onHideColumn,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Icon name="MoreHorizontal" className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onDuplicateColumn}>
          <Icon name="Copy" className="h-4 w-4 mr-2" />
          Duplicate Column
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicateRow}>
          <Icon name="Copy" className="h-4 w-4 mr-2" />
          Duplicate Row
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSortAsc}>
          <Icon name="ArrowUp" className="h-4 w-4 mr-2" />
          Sort Ascending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSortDesc}>
          <Icon name="ArrowDown" className="h-4 w-4 mr-2" />
          Sort Descending
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onHideColumn}>
          <Icon name="EyeOff" className="h-4 w-4 mr-2" />
          Hide Column
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDeleteColumn} className="text-destructive">
          <Icon name="Trash" className="h-4 w-4 mr-2" />
          Delete Column
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDeleteRow} className="text-destructive">
          <Icon name="Trash" className="h-4 w-4 mr-2" />
          Delete Row
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
