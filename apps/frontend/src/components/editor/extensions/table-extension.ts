import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TableComponent } from '../table/table-component';

export interface TableData {
  columns: TableColumn[];
  rows: TableRow[];
  frozenColumns?: number;
  frozenRows?: number;
}

export interface TableColumn {
  id: string;
  title: string;
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  width?: number;
  frozen?: boolean;
  options?: string[]; // For select type
  format?: string; // For number/date formatting
}

export interface TableRow {
  id: string;
  cells: Record<string, TableCell>;
  frozen?: boolean;
}

export interface TableCell {
  value: any;
  formatted?: string;
  backgroundColor?: string;
  textColor?: string;
  alignment?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  rowSpan?: number;
  colSpan?: number;
  isMerged?: boolean;
  mergeParentCell?: string; // Reference to the parent cell's ID if this is part of a merge
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    table: {
      /**
       * Add a table
       */
      setTable: (options: { data: TableData }) => ReturnType;
      /**
       * Update table data
       */
      updateTable: (options: { data: Partial<TableData> }) => ReturnType;
      /**
       * Merge selected cells
       */
      mergeCells: () => ReturnType;
      /**
       * Split merged cells
       */
      splitCells: () => ReturnType;
    };
  }
}

export const TableExtension = Node.create({
  name: 'table',
  
  group: 'block',
  
  atom: true,

  addAttributes() {
    return {
      data: {
        default: {
          columns: [],
          rows: [],
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="table"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'table' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TableComponent);
  },

  addCommands() {
    return {
      setTable:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { data: options.data },
          });
        },
      updateTable:
        (options) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            const pos = tr.selection.from;
            const node = tr.doc.nodeAt(pos);
            if (node?.type.name === this.name) {
              tr.setNodeAttribute(pos, 'data', {
                ...node.attrs.data,
                ...options.data,
              });
            }
          }
          return true;
        },
      mergeCells:
        () =>
        ({ tr, dispatch, state }) => {
          if (dispatch) {
            const pos = tr.selection.from;
            const node = tr.doc.nodeAt(pos);
            if (node?.type.name === this.name) {
              const selectedCells = getSelectedCells(state);
              if (selectedCells.length > 1) {
                const { startRow, endRow, startCol, endCol } = getSelectionBounds(selectedCells);
                const rowSpan = endRow - startRow + 1;
                const colSpan = endCol - startCol + 1;
                
                // Update the first cell to be the merged cell
                const firstCell = selectedCells[0];
                const updatedData = {
                  ...node.attrs.data,
                  rows: node.attrs.data.rows.map((row, rowIndex) => {
                    if (rowIndex < startRow || rowIndex > endRow) return row;
                    return {
                      ...row,
                      cells: Object.fromEntries(
                        Object.entries(row.cells).map(([colId, cell], colIndex) => {
                          if (colIndex < startCol || colIndex > endCol) return [colId, cell];
                          if (rowIndex === startRow && colIndex === startCol) {
                            return [colId, { ...cell, rowSpan, colSpan }];
                          }
                          return [colId, { ...cell, isMerged: true, mergeParentCell: firstCell.id }];
                        })
                      ),
                    };
                  }),
                };
                tr.setNodeAttribute(pos, 'data', updatedData);
              }
            }
          }
          return true;
        },
      splitCells:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            const pos = tr.selection.from;
            const node = tr.doc.nodeAt(pos);
            if (node?.type.name === this.name) {
              const selectedCells = getSelectedCells(tr.selection);
              const updatedData = {
                ...node.attrs.data,
                rows: node.attrs.data.rows.map(row => ({
                  ...row,
                  cells: Object.fromEntries(
                    Object.entries(row.cells).map(([colId, cell]) => {
                      if (selectedCells.some(selected => selected.id === colId)) {
                        return [colId, {
                          ...cell,
                          rowSpan: undefined,
                          colSpan: undefined,
                          isMerged: undefined,
                          mergeParentCell: undefined,
                        }];
                      }
                      return [colId, cell];
                    })
                  ),
                })),
              };
              tr.setNodeAttribute(pos, 'data', updatedData);
            }
          }
          return true;
        },
    };
  },
});
