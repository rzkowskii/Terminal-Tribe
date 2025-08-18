export interface CommandHistoryEntry {
  command: string;
  output: string;
  status: 'pending' | 'success' | 'error' | 'info';
}

export interface TerminalStore {
  commandHistory: CommandHistoryEntry[];
  addToHistory: (entry: CommandHistoryEntry) => void;
  clearHistory: () => void;
}
