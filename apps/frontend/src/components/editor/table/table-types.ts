import { CSSProperties } from 'react';

export type CellValue = string | number | boolean | Date | null;

export interface CellStyle extends CSSProperties {
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  backgroundColor?: string;
  color?: string;
  fontWeight?: string;
  fontStyle?: string;
}

export interface CellValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  customValidation?: (value: CellValue) => boolean;
  errorMessage?: string;
}

export interface CellFormat {
  type: 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'boolean' | 'select';
  precision?: number;
  currency?: string;
  dateFormat?: string;
  options?: string[];
}

export interface TableCell {
  id: string;
  value: CellValue;
  displayValue?: string;
  format?: CellFormat;
  style?: CellStyle;
  validation?: CellValidation;
  comment?: string;
  formula?: string;
  colspan?: number;
  rowspan?: number;
  isEditing?: boolean;
  isSelected?: boolean;
  error?: string;
}

export interface TableColumn {
  id: string;
  title: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  frozen?: 'left' | 'right' | null;
  hidden?: boolean;
  format?: CellFormat;
  validation?: CellValidation;
  style?: CellStyle;
  group?: string;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  draggable?: boolean;
}

export interface TableRow {
  id: string;
  index: number;
  title: string;
  height?: number;
  isExpanded?: boolean;
  isSelected?: boolean;
  detailContent?: any;
  style?: CellStyle;
  cells: Record<string, TableCell>;
  group?: string;
  parent?: string;
  children?: string[];
  level?: number;
}

export interface TableGroup {
  id: string;
  title: string;
  columns: string[];
  collapsed?: boolean;
}

export interface TableSelection {
  type: 'cell' | 'row' | 'column' | 'range';
  anchor: { rowId: string; columnId: string };
  focus?: { rowId: string; columnId: string };
}

export interface TableSort {
  id: string;
  desc: boolean;
}

export interface TableFilter {
  id: string;
  value: any;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte';
}

export interface TableState {
  sorting: TableSort[];
  filters: TableFilter[];
  grouping: string[];
  columnOrder: string[];
  columnVisibility: Record<string, boolean>;
  columnPinning: Record<string, 'left' | 'right'>;
  rowSelection: Record<string, boolean>;
  selection?: TableSelection;
  expandedRows: Record<string, boolean>;
}

export interface TableData {
  columns: TableColumn[];
  rows: TableRow[];
  groups?: TableGroup[];
  state: TableState;
}

export interface TableTemplate {
  id: string;
  name: string;
  description?: string;
  columns: Omit<TableColumn, 'id'>[];
  sampleRows?: Omit<TableRow, 'id' | 'cells'>[];
}

export interface TableHistory {
  past: TableData[];
  present: TableData;
  future: TableData[];
}

export interface TableClipboard {
  type: 'cell' | 'row' | 'column' | 'range';
  data: any;
  format?: string;
}

export interface TableExportOptions {
  format: 'csv' | 'xlsx' | 'json';
  includeHeaders?: boolean;
  delimiter?: string;
  encoding?: string;
  sheetName?: string;
}

export interface TableImportOptions {
  format: 'csv' | 'xlsx' | 'json';
  hasHeaders?: boolean;
  delimiter?: string;
  encoding?: string;
  sheetName?: string;
}

export type TableEventHandler = (event: TableEvent) => void;

export interface TableEvent {
  type: 
    | 'cell:change' 
    | 'cell:select'
    | 'row:add'
    | 'row:remove'
    | 'row:move'
    | 'column:add'
    | 'column:remove'
    | 'column:move'
    | 'selection:change'
    | 'sort:change'
    | 'filter:change'
    | 'group:change'
    | 'expand:change'
    | 'visibility:change'
    | 'pin:change'
    | 'resize:change'
    | 'paste'
    | 'copy'
    | 'undo'
    | 'redo';
  payload: any;
}
