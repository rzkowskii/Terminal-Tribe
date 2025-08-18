import { FileSystemState } from './level';

export interface CommandEffects {
  clearHistory?: boolean;
}

export interface CommandResult {
  output: string;
  status: 'success' | 'error' | 'info';
  newState?: FileSystemState;
  effects?: CommandEffects;
}

export interface Command {
  name: string;
  description: string;
  execute: (args: string[]) => Promise<CommandResult>;
}
