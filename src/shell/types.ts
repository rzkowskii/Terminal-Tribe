import { FileSystemState } from '../types/level';
import { CommandResult } from '../types/commands';

export interface ExecutionContext {
  readonly currentState: FileSystemState;
}

export interface ParsedCommand {
  name: string;
  args: string[];
}

export interface CommandMeta {
  name: string;
  description: string;
  usage?: string;
  options?: Record<string, string>; // flag => description
}

export interface BuiltinCommand {
  meta: CommandMeta;
  run: (ctx: ExecutionContext, args: string[]) => Promise<CommandResult> | CommandResult;
}

export interface FlagParseResult {
  flags: Set<string>;
  positionals: string[];
}

