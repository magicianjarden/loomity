import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { TableData, TableColumn, TableRow, TableCell, TableState, TableEvent } from './table-types';
import { tableApi } from '@/lib/supabase/table-api';
import { tableThemeApi, TableTheme } from '@/lib/supabase/table-theme-api';

type TableEventHandler = (event: TableEvent) => void;

interface TableEvent {
  type: string;
  data: any;
}

interface TableHistory {
  past: TableData[];
  present: TableData;
  future: TableData[];
}

interface TableStore {
  tableId: string | null;
  data: TableData;
  theme: TableTheme | null;
  themeConfig: any;
  history: TableHistory;
  clipboard: {
    type: 'cell' | 'row' | 'column' | 'range';
    data: any;
  } | null;
  loading: boolean;
  error: string | null;
  undoStack: TableData[];
  redoStack: TableData[];
  eventHandlers: Map<string, TableEventHandler[]>;

  // Actions
  initTable: (name: string) => Promise<void>;
  loadTable: (tableId: string) => Promise<void>;
  saveTable: () => Promise<void>;
  setData: (data: TableData) => void;
  addColumn: (column: Partial<TableColumn>) => void;
  addRow: (row?: Partial<TableRow>) => void;
  updateCell: (rowId: string, columnId: string, value: any) => void;
  removeRow: (rowId: string) => void;
  removeColumn: (columnId: string) => void;
  mergeCells: (selection: any) => void;
  splitCells: (selection: any) => void;
  setCellValidation: (columnId: string, validation: any) => void;
  validateCells: (columnId: string) => void;
  updateColumnTitle: (columnId: string, title: string) => void;
  updateRowTitle: (rowId: string, title: string) => void;
  undo: () => void;
  redo: () => void;
  addEventListener: (type: string, handler: TableEventHandler) => void;
  removeEventListener: (type: string, handler: TableEventHandler) => void;
  dispatchEvent: (event: TableEvent) => void;

  // Theme actions
  loadTheme: (themeId: string) => Promise<void>;
  applyTheme: (themeId: string, config?: any) => Promise<void>;
  removeTheme: () => Promise<void>;
  updateThemeConfig: (config: any) => Promise<void>;
}

export const useTableStore = create<TableStore>()(
  immer((set, get) => ({
    tableId: null,
    data: {
      columns: [
        {
          id: crypto.randomUUID(),
          title: 'Column 1',
          width: 200,
          format: { type: 'text' },
        },
        {
          id: crypto.randomUUID(),
          title: 'Column 2',
          width: 200,
          format: { type: 'text' },
        },
      ],
      rows: [
        {
          id: crypto.randomUUID(),
          index: 0,
          title: 'Row 1',
          cells: {},
        },
        {
          id: crypto.randomUUID(),
          index: 1,
          title: 'Row 2',
          cells: {},
        },
      ],
      state: {
        sorting: [],
        filters: [],
        grouping: [],
        columnOrder: [],
        columnVisibility: {},
        columnPinning: {},
        rowSelection: {},
        expandedRows: {},
      },
    },
    theme: null,
    themeConfig: {},
    history: {
      past: [],
      present: {} as TableData,
      future: [],
    },
    clipboard: null,
    loading: false,
    error: null,
    undoStack: [],
    redoStack: [],
    eventHandlers: new Map(),

    // Initialize a new table
    initTable: async (name) => {
      set({ loading: true, error: null });
      try {
        const tableId = await tableApi.createTable(name);
        const { data } = get();
        await tableApi.saveTable(tableId, data);
        set({ tableId });
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ loading: false });
      }
    },

    // Load an existing table
    loadTable: async (tableId) => {
      set({ loading: true, error: null });
      try {
        const data = await tableApi.loadTable(tableId);
        set({ tableId, data });
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ loading: false });
      }
    },

    // Save the current table state
    saveTable: async () => {
      const { tableId, data } = get();
      if (!tableId) return;

      set({ loading: true, error: null });
      try {
        await tableApi.saveTable(tableId, data);
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ loading: false });
      }
    },

    setData: (data) => {
      set((state) => {
        state.data = data;
        state.data.rows.forEach((row) => {
          state.data.columns.forEach((col) => {
            if (!row.cells[col.id]) {
              row.cells[col.id] = {
                id: crypto.randomUUID(),
                value: '',
              };
            }
          });
        });
      });
      get().saveTable();
    },

    addColumn: (column) => {
      set((state) => {
        const newColumn = {
          id: crypto.randomUUID(),
          title: column.title || 'New Column',
          width: column.width || 200,
          format: column.format || { type: 'text' },
        };
        state.data.columns.push(newColumn);
        
        state.data.rows.forEach((row) => {
          row.cells[newColumn.id] = {
            id: crypto.randomUUID(),
            value: '',
          };
        });
      });
      get().saveTable();
    },

    addRow: (row) => {
      set((state) => {
        const newRow = {
          id: crypto.randomUUID(),
          index: state.data.rows.length,
          title: row?.title || `Row ${state.data.rows.length + 1}`,
          cells: {},
          ...row,
        };
        
        state.data.columns.forEach((col) => {
          newRow.cells[col.id] = {
            id: crypto.randomUUID(),
            value: '',
          };
        });
        
        state.data.rows.push(newRow);
      });
      get().saveTable();
    },

    updateCell: (rowId, columnId, value) => {
      set((state) => {
        const row = state.data.rows.find((r) => r.id === rowId);
        if (row) {
          if (!row.cells[columnId]) {
            row.cells[columnId] = {
              id: crypto.randomUUID(),
              value: '',
            };
          }
          row.cells[columnId].value = value;
        }
      });
      get().saveTable();
    },

    removeRow: (rowId) => {
      set((state) => {
        state.data.rows = state.data.rows.filter((row) => row.id !== rowId);
      });
      get().saveTable();
    },

    removeColumn: (columnId) => {
      set((state) => {
        state.data.columns = state.data.columns.filter((col) => col.id !== columnId);
        state.data.rows.forEach((row) => {
          delete row.cells[columnId];
        });
      });
      get().saveTable();
    },

    updateColumnTitle: (columnId, title) => {
      set((state) => {
        const column = state.data.columns.find((col) => col.id === columnId);
        if (column) {
          column.title = title;
        }
      });
      get().saveTable();
    },

    updateRowTitle: (rowId, title) => {
      set((state) => {
        const row = state.data.rows.find((r) => r.id === rowId);
        if (row) {
          row.title = title;
        }
      });
      get().saveTable();
    },

    mergeCells: (selection) => {
      // Implement merge cells logic
    },

    splitCells: (selection) => {
      // Implement split cells logic
    },

    setCellValidation: (columnId, validation) => {
      set((state) => {
        const column = state.data.columns.find((col) => col.id === columnId);
        if (column) {
          column.validation = validation;
        }
      });
    },

    validateCells: (columnId) => {
      const state = get();
      const column = state.data.columns.find((col) => col.id === columnId);
      if (!column || !column.validation) return;

      set((state) => {
        state.data.rows.forEach((row) => {
          const cell = row.cells[columnId];
          if (cell) {
            // Implement validation logic here
          }
        });
      });
    },

    undo: () => {
      set((state) => {
        if (state.undoStack.length > 0) {
          const prev = state.undoStack.pop()!;
          state.redoStack.push(JSON.parse(JSON.stringify(state.data)));
          state.data = JSON.parse(JSON.stringify(prev));
        }
      });
    },

    redo: () => {
      set((state) => {
        if (state.redoStack.length > 0) {
          const next = state.redoStack.pop()!;
          state.undoStack.push(JSON.parse(JSON.stringify(state.data)));
          state.data = JSON.parse(JSON.stringify(next));
        }
      });
    },

    addEventListener: (type, handler) => {
      const { eventHandlers } = get();
      if (!eventHandlers.has(type)) {
        eventHandlers.set(type, []);
      }
      eventHandlers.get(type)!.push(handler);
    },

    removeEventListener: (type, handler) => {
      const { eventHandlers } = get();
      if (eventHandlers.has(type)) {
        const handlers = eventHandlers.get(type)!;
        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      }
    },

    dispatchEvent: (event) => {
      const { eventHandlers } = get();
      if (eventHandlers.has(event.type)) {
        eventHandlers.get(event.type)!.forEach((handler) => {
          handler(event);
        });
      }
    },

    loadTheme: async (themeId) => {
      set({ loading: true, error: null });
      try {
        const theme = await tableThemeApi.getTheme(themeId);
        set({ theme, themeConfig: theme.default_config });
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ loading: false });
      }
    },

    applyTheme: async (themeId, config) => {
      const { tableId } = get();
      if (!tableId) return;

      set({ loading: true, error: null });
      try {
        await tableThemeApi.applyTheme(tableId, themeId, config);
        await get().loadTheme(themeId);
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ loading: false });
      }
    },

    removeTheme: async () => {
      const { tableId } = get();
      if (!tableId) return;

      set({ loading: true, error: null });
      try {
        await tableThemeApi.removeTheme(tableId);
        set({ theme: null, themeConfig: {} });
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ loading: false });
      }
    },

    updateThemeConfig: async (config) => {
      const { tableId, theme } = get();
      if (!tableId || !theme) return;

      set({ loading: true, error: null });
      try {
        await tableThemeApi.applyTheme(tableId, theme.id, config);
        set({ themeConfig: config });
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ loading: false });
      }
    },
  }))
);
