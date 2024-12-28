import { createClient } from '@supabase/supabase-js';
import { TableData, TableColumn, TableRow, TableCell } from '@/components/editor/table/table-types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface TableMetadata {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const tableApi = {
  async createTable(name: string): Promise<string> {
    const { data, error } = await supabase
      .from('tables')
      .insert({ name })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async saveTable(tableId: string, tableData: TableData): Promise<void> {
    const { error: columnsError } = await supabase
      .from('table_columns')
      .upsert(
        tableData.columns.map((col, index) => ({
          id: col.id,
          table_id: tableId,
          title: col.title,
          width: col.width,
          format: col.format,
          validation: col.validation,
          index,
        }))
      );

    if (columnsError) throw columnsError;

    const { error: rowsError } = await supabase
      .from('table_rows')
      .upsert(
        tableData.rows.map((row, index) => ({
          id: row.id,
          table_id: tableId,
          title: row.title,
          index,
        }))
      );

    if (rowsError) throw rowsError;

    // Prepare cell data
    const cellData = tableData.rows.flatMap(row =>
      Object.entries(row.cells).map(([columnId, cell]) => ({
        id: cell.id,
        row_id: row.id,
        column_id: columnId,
        value: cell.value,
        merge_ref: cell.mergeRef,
      }))
    );

    const { error: cellsError } = await supabase
      .from('table_cells')
      .upsert(cellData);

    if (cellsError) throw cellsError;
  },

  async loadTable(tableId: string): Promise<TableData> {
    // Load columns
    const { data: columns, error: columnsError } = await supabase
      .from('table_columns')
      .select('*')
      .eq('table_id', tableId)
      .order('index');

    if (columnsError) throw columnsError;

    // Load rows
    const { data: rows, error: rowsError } = await supabase
      .from('table_rows')
      .select('*')
      .eq('table_id', tableId)
      .order('index');

    if (rowsError) throw rowsError;

    // Load cells
    const { data: cells, error: cellsError } = await supabase
      .from('table_cells')
      .select('*')
      .in(
        'row_id',
        rows.map(r => r.id)
      );

    if (cellsError) throw cellsError;

    // Convert to TableData format
    const tableData: TableData = {
      columns: columns.map(col => ({
        id: col.id,
        title: col.title,
        width: col.width,
        format: col.format,
        validation: col.validation,
      })),
      rows: rows.map(row => ({
        id: row.id,
        index: row.index,
        title: row.title,
        cells: {},
      })),
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
    };

    // Organize cells by row
    cells.forEach(cell => {
      const row = tableData.rows.find(r => r.id === cell.row_id);
      if (row) {
        row.cells[cell.column_id] = {
          id: cell.id,
          value: cell.value,
          mergeRef: cell.merge_ref,
        };
      }
    });

    return tableData;
  },

  async listTables(): Promise<TableMetadata[]> {
    const { data, error } = await supabase
      .from('tables')
      .select('id, name, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async deleteTable(tableId: string): Promise<void> {
    const { error } = await supabase.from('tables').delete().eq('id', tableId);
    if (error) throw error;
  },
};
