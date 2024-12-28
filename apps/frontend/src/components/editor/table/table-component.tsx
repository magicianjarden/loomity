import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
} from '@tanstack/react-table';
import { TableToolbar } from './table-toolbar';
import { TableMenu } from './table-menu';
import { TableCellMenu } from './components/table-cell-menu';
import { TableRowOperations } from './components/table-row-operations';
import { TableColumnOperations } from './components/table-column-operations';
import { TableValidationMenu } from './components/table-validation-menu';
import { useTableStore } from './table-store';
import { useTableDnd } from './hooks/use-table-dnd';
import { TableData, TableColumn, TableRow, TableCell } from './table-types';
import { cn } from '@/lib/utils';

interface TableCellProps {
  value: any;
  column: TableColumn;
  row: TableRow;
  cell: TableCell;
  onUpdate: (value: any) => void;
}

const TableCell: React.FC<TableCellProps> = ({ value, column, row, cell, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value ?? '');
  const store = useTableStore();

  useEffect(() => {
    setEditValue(value ?? '');
  }, [value]);

  const handleDoubleClick = () => {
    if (!column.locked && !row.locked) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onUpdate(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      setIsEditing(false);
      if (editValue !== value) {
        onUpdate(editValue);
      }
    }
  };

  const renderContent = () => {
    if (cell.mergeRef) {
      return null; // This cell is part of a merged cell
    }

    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full h-full border-none focus:outline-none bg-transparent"
          autoFocus
        />
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span>{value}</span>
        {(cell.error || cell.comment) && (
          <TableCellMenu
            rowId={row.id}
            columnId={column.id}
            cell={cell}
            column={column}
          />
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'relative p-2',
        cell.error && 'border-red-500',
        cell.comment && 'border-blue-500',
        cell.isSelected && 'bg-blue-100',
        column.locked && 'bg-gray-50',
        row.locked && 'bg-gray-50'
      )}
      style={{
        ...cell.style,
        gridColumn: cell.colspan ? `span ${cell.colspan}` : undefined,
        gridRow: cell.rowspan ? `span ${cell.rowspan}` : undefined,
      }}
      onDoubleClick={handleDoubleClick}
    >
      {renderContent()}
    </div>
  );
};

export const TableComponent: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
  const store = useTableStore();
  const {
    isDragging,
    handleRowDragStart,
    handleColumnDragStart,
    handleDrag,
    endDrag,
  } = useTableDnd();

  useEffect(() => {
    if (node.attrs.data) {
      store.setData(node.attrs.data);
    } else {
      updateAttributes({ data: store.data });
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleDrag(e);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        endDrag();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleDrag, endDrag]);

  const tableStyles = useMemo(() => {
    if (!store.theme) return {};

    const config = store.themeConfig;
    return {
      header: {
        background: config.header?.background,
        color: config.header?.text,
        borderColor: config.header?.border,
      },
      body: {
        background: config.body?.background,
        color: config.body?.text,
        borderColor: config.body?.border,
      },
      row: {
        hover: config.row?.hover,
        selected: config.row?.selected,
      },
      cell: {
        padding: config.cell?.padding,
        fontSize: config.cell?.fontSize,
      },
    };
  }, [store.theme, store.themeConfig]);

  return (
    <NodeViewWrapper className="relative my-4">
      <div className="rounded-lg border bg-background shadow">
        <TableToolbar />
        <div className="overflow-auto">
          <table 
            className="w-full border-collapse"
            style={{
              borderColor: tableStyles.body?.borderColor,
              background: tableStyles.body?.background,
              color: tableStyles.body?.text,
            }}
          >
            <thead>
              <tr>
                <th 
                  className="w-10 p-2 border"
                  style={{
                    background: tableStyles.header?.background,
                    color: tableStyles.header?.text,
                    borderColor: tableStyles.header?.borderColor,
                  }}
                >
                </th>
                {store.data.columns.map((column, index) => (
                  <th
                    key={column.id}
                    className={cn(
                      'relative p-2 font-medium text-left border',
                      column.hidden && 'hidden',
                      isDragging && 'cursor-grabbing'
                    )}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth,
                      background: tableStyles.header?.background,
                      color: tableStyles.header?.text,
                      borderColor: tableStyles.header?.borderColor,
                      padding: tableStyles.cell?.padding,
                      fontSize: tableStyles.cell?.fontSize,
                      ...column.style,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <TableColumnOperations
                        column={column}
                        index={index}
                        onDragStart={handleColumnDragStart}
                      />
                      <input
                        type="text"
                        value={column.title}
                        className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary px-1 rounded"
                        style={{
                          color: tableStyles.header?.text,
                        }}
                        onChange={(e) => store.updateColumnTitle(column.id, e.target.value)}
                      />
                      <TableValidationMenu column={column} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {store.data.rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={cn(
                    'group',
                    row.isSelected && 'bg-blue-50',
                    isDragging && 'cursor-grabbing'
                  )}
                  style={{
                    background: row.isSelected 
                      ? tableStyles.row?.selected 
                      : index % 2 === 0 
                        ? tableStyles.body?.background 
                        : tableStyles.body?.alternateBackground,
                    '&:hover': {
                      background: tableStyles.row?.hover,
                    },
                  }}
                >
                  <td 
                    className="relative p-2 border"
                    style={{
                      borderColor: tableStyles.body?.borderColor,
                      padding: tableStyles.cell?.padding,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <TableRowOperations
                        row={row}
                        index={index}
                        onDragStart={handleRowDragStart}
                      />
                      <input
                        type="text"
                        value={row.title}
                        className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary px-1 rounded w-20"
                        style={{
                          color: tableStyles.body?.text,
                        }}
                        onChange={(e) => store.updateRowTitle(row.id, e.target.value)}
                      />
                    </div>
                  </td>
                  {store.data.columns.map((column) => {
                    const cell = row.cells[column.id];
                    if (!cell || cell.mergeRef) return null;

                    return (
                      <td
                        key={column.id}
                        className={cn(
                          'relative p-0 border',
                          column.hidden && 'hidden'
                        )}
                        style={{
                          borderColor: tableStyles.body?.borderColor,
                          padding: tableStyles.cell?.padding,
                        }}
                      >
                        <TableCell
                          value={cell.value}
                          column={column}
                          row={row}
                          cell={cell}
                          onUpdate={(value) =>
                            store.updateCell(row.id, column.id, value)
                          }
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TableMenu />
      </div>
    </NodeViewWrapper>
  );
};
