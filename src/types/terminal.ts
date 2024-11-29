export interface TerminalCommand {
  id: string;
  command: string;
  output?: string;
  status?: 'success' | 'error' | 'info' | 'pending';
}

export interface TerminalState {
  history: {
    commands: TerminalCommand[];
  };
}

export interface TerminalStore {
  history: {
    commands: TerminalCommand[];
  };
  addCommand: (command: string) => string;
  setCommandOutput: (id: string, output: string, status: TerminalCommand['status']) => void;
  clearHistory: () => void;
}
