import { FileSystemState } from './level';

export interface CommandResult {
  output: string;
  status: 'success' | 'error' | 'info';
  newState?: FileSystemState;
}

export interface Command {
  name: string;
  description: string;
  execute: (args: string[]) => Promise<CommandResult>;
}
