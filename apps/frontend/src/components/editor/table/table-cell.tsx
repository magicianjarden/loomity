import React, { useState, useCallback } from 'react';
import { TableColumn, TableRow } from '../extensions/table-extension';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TableCellProps {
  value: any;
  column: TableColumn;
  row: TableRow;
  onUpdate: (value: any) => void;
}

export const TableCell: React.FC<TableCellProps> = ({
  value,
  column,
  row,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setEditValue(value);
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editValue !== value) {
      onUpdate(editValue);
    }
  }, [editValue, value, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value);
    }
  }, [handleBlur, value]);

  const renderCell = useCallback(() => {
    if (!isEditing) {
      switch (column.type) {
        case 'checkbox':
          return (
            <Checkbox
              checked={value}
              onCheckedChange={onUpdate}
            />
          );
        case 'select':
          return (
            <Select value={value} onValueChange={onUpdate}>
              <SelectTrigger>
                <SelectValue>{value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {column.options?.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        default:
          return (
            <div
              className="min-h-[1.5rem] cursor-text"
              onDoubleClick={handleDoubleClick}
            >
              {value}
            </div>
          );
      }
    }

    switch (column.type) {
      case 'number':
        return (
          <Input
            type="number"
            value={editValue}
            onChange={e => setEditValue(parseFloat(e.target.value))}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-7 px-1"
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-7 px-1"
          />
        );
      default:
        return (
          <Input
            type="text"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-7 px-1"
          />
        );
    }
  }, [column.type, isEditing, value, editValue, handleBlur, handleDoubleClick, handleKeyDown, onUpdate, column.options]);

  return (
    <div
      className={cn(
        "min-h-[1.5rem]",
        isEditing && "p-0",
        !isEditing && "p-1"
      )}
    >
      {renderCell()}
    </div>
  );
};
