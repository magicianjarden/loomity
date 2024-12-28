import { TableData } from '../extensions/table-extension';

export const tableTemplates: Record<string, TableData> = {
  basic: {
    columns: [
      { id: '1', title: 'Column 1', type: 'text', width: 200 },
      { id: '2', title: 'Column 2', type: 'text', width: 200 },
      { id: '3', title: 'Column 3', type: 'text', width: 200 },
    ],
    rows: [
      {
        id: '1',
        cells: {
          '1': { value: '' },
          '2': { value: '' },
          '3': { value: '' },
        },
      },
      {
        id: '2',
        cells: {
          '1': { value: '' },
          '2': { value: '' },
          '3': { value: '' },
        },
      },
    ],
  },
  
  taskList: {
    columns: [
      { id: 'task', title: 'Task', type: 'text', width: 300 },
      { id: 'status', title: 'Status', type: 'select', width: 150, options: ['Todo', 'In Progress', 'Done'] },
      { id: 'priority', title: 'Priority', type: 'select', width: 150, options: ['Low', 'Medium', 'High'] },
      { id: 'dueDate', title: 'Due Date', type: 'date', width: 150 },
      { id: 'assignee', title: 'Assignee', type: 'text', width: 200 },
    ],
    rows: [
      {
        id: '1',
        cells: {
          'task': { value: '' },
          'status': { value: 'Todo' },
          'priority': { value: 'Medium' },
          'dueDate': { value: '' },
          'assignee': { value: '' },
        },
      },
    ],
  },

  schedule: {
    columns: [
      { id: 'time', title: 'Time', type: 'text', width: 150 },
      { id: 'monday', title: 'Monday', type: 'text', width: 200 },
      { id: 'tuesday', title: 'Tuesday', type: 'text', width: 200 },
      { id: 'wednesday', title: 'Wednesday', type: 'text', width: 200 },
      { id: 'thursday', title: 'Thursday', type: 'text', width: 200 },
      { id: 'friday', title: 'Friday', type: 'text', width: 200 },
    ],
    rows: Array.from({ length: 8 }, (_, i) => ({
      id: String(i + 1),
      cells: {
        'time': { value: `${9 + i}:00` },
        'monday': { value: '' },
        'tuesday': { value: '' },
        'wednesday': { value: '' },
        'thursday': { value: '' },
        'friday': { value: '' },
      },
    })),
  },

  budgetTracker: {
    columns: [
      { id: 'date', title: 'Date', type: 'date', width: 150 },
      { id: 'category', title: 'Category', type: 'select', width: 200, options: ['Income', 'Housing', 'Transportation', 'Food', 'Utilities', 'Entertainment', 'Other'] },
      { id: 'description', title: 'Description', type: 'text', width: 300 },
      { id: 'amount', title: 'Amount', type: 'number', width: 150, format: '$#,##0.00' },
    ],
    rows: [
      {
        id: '1',
        cells: {
          'date': { value: '' },
          'category': { value: '' },
          'description': { value: '' },
          'amount': { value: 0 },
        },
      },
    ],
  },

  projectTimeline: {
    columns: [
      { id: 'phase', title: 'Phase', type: 'text', width: 200 },
      { id: 'startDate', title: 'Start Date', type: 'date', width: 150 },
      { id: 'endDate', title: 'End Date', type: 'date', width: 150 },
      { id: 'owner', title: 'Owner', type: 'text', width: 200 },
      { id: 'status', title: 'Status', type: 'select', width: 150, options: ['Not Started', 'In Progress', 'Completed', 'Delayed'] },
      { id: 'notes', title: 'Notes', type: 'text', width: 300 },
    ],
    rows: [
      {
        id: '1',
        cells: {
          'phase': { value: 'Planning' },
          'startDate': { value: '' },
          'endDate': { value: '' },
          'owner': { value: '' },
          'status': { value: 'Not Started' },
          'notes': { value: '' },
        },
      },
    ],
  },
};
