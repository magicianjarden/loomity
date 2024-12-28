import React from 'react';
import { useTableStore } from './table-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Lock,
  Unlock,
  Filter,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  List,
  Table as TableIcon,
  Columns,
  RowsIcon,
  Combine,
  Split,
} from 'lucide-react';

export const TableToolbar: React.FC = () => {
  const store = useTableStore();

  const handleAddColumn = () => {
    const newColumn = {
      id: crypto.randomUUID(),
      title: 'New Column',
      width: 200,
      format: { type: 'text' },
    };
    store.data.columns.push(newColumn);
  };

  const handleAddRow = () => {
    const newRow = {
      id: crypto.randomUUID(),
      index: store.data.rows.length,
      cells: {},
    };
    store.data.rows.push(newRow);
  };

  return (
    <div className="flex items-center gap-2 border-b p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleAddColumn}>
            <Columns className="h-4 w-4 mr-2" />
            Add Column
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddRow}>
            <RowsIcon className="h-4 w-4 mr-2" />
            Add Row
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Type className="h-4 w-4 mr-2" />
            Column Type
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Type className="h-4 w-4 mr-2" />
            Text
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Hash className="h-4 w-4 mr-2" />
            Number
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Calendar className="h-4 w-4 mr-2" />
            Date
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CheckSquare className="h-4 w-4 mr-2" />
            Checkbox
          </DropdownMenuItem>
          <DropdownMenuItem>
            <List className="h-4 w-4 mr-2" />
            Select
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="sm">
        <Filter className="h-4 w-4 mr-2" />
        Filter
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <TableIcon className="h-4 w-4 mr-2" />
            Table
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Lock className="h-4 w-4 mr-2" />
            Freeze Column
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Unlock className="h-4 w-4 mr-2" />
            Unfreeze Column
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Combine className="h-4 w-4 mr-2" />
            Merge Cells
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Split className="h-4 w-4 mr-2" />
            Split Cells
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
