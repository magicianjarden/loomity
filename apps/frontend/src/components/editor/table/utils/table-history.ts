import { TableData, TableHistory, TableEvent } from '../table-types';

const MAX_HISTORY_SIZE = 50;

export class TableHistoryManager {
  private history: TableHistory;
  private isRecording: boolean = true;

  constructor(initialData: TableData) {
    this.history = {
      past: [],
      present: initialData,
      future: []
    };
  }

  private createSnapshot(data: TableData): TableData {
    return JSON.parse(JSON.stringify(data));
  }

  public shouldRecord(event: TableEvent): boolean {
    // List of events that should trigger a history snapshot
    const recordableEvents = [
      'cell:change',
      'row:add',
      'row:remove',
      'row:move',
      'column:add',
      'column:remove',
      'column:move',
      'paste'
    ];

    return this.isRecording && recordableEvents.includes(event.type);
  }

  public record(data: TableData): void {
    if (!this.isRecording) return;

    this.history.past.push(this.createSnapshot(this.history.present));
    this.history.present = this.createSnapshot(data);
    this.history.future = [];

    // Limit history size
    if (this.history.past.length > MAX_HISTORY_SIZE) {
      this.history.past.shift();
    }
  }

  public undo(): TableData | null {
    if (this.history.past.length === 0) return null;

    const previous = this.history.past.pop()!;
    this.history.future.push(this.createSnapshot(this.history.present));
    this.history.present = this.createSnapshot(previous);

    return this.history.present;
  }

  public redo(): TableData | null {
    if (this.history.future.length === 0) return null;

    const next = this.history.future.pop()!;
    this.history.past.push(this.createSnapshot(this.history.present));
    this.history.present = this.createSnapshot(next);

    return this.history.present;
  }

  public canUndo(): boolean {
    return this.history.past.length > 0;
  }

  public canRedo(): boolean {
    return this.history.future.length > 0;
  }

  public pauseRecording(): void {
    this.isRecording = false;
  }

  public resumeRecording(): void {
    this.isRecording = true;
  }

  public clear(): void {
    this.history.past = [];
    this.history.future = [];
  }

  public getCurrentState(): TableData {
    return this.createSnapshot(this.history.present);
  }

  public getHistory(): TableHistory {
    return this.createSnapshot(this.history);
  }
}

// Create a singleton instance for global use
let historyManager: TableHistoryManager | null = null;

export const getTableHistory = (initialData?: TableData): TableHistoryManager => {
  if (!historyManager && initialData) {
    historyManager = new TableHistoryManager(initialData);
  }
  if (!historyManager) {
    throw new Error('TableHistoryManager not initialized');
  }
  return historyManager;
};
