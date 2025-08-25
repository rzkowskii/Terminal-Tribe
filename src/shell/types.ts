import { FileSystemState } from '../types/level';
import { CommandResult } from '../types/commands';

export interface ExecutionContext {
  readonly currentState: FileSystemState;
  readonly stdin?: string;
}

export type Redirection =
  | { kind: 'stdout'; mode: 'write' | 'append'; target: string }
  | { kind: 'stderr'; mode: 'write' | 'append'; target: string }
  | { kind: 'stdin'; target: string };

export interface SimpleCommandNode {
  type: 'command';
  name: string;
  args: string[];
  redirections?: Redirection[];
}

export interface PipelineNode {
  type: 'pipeline';
  stages: SimpleCommandNode[];
}

export type ParsedCommand = SimpleCommandNode | PipelineNode;
export type Redirection =
  | { kind: 'stdout'; mode: 'write' | 'append'; target: string }
  | { kind: 'stderr'; mode: 'write' | 'append'; target: string }
  | { kind: 'stdin'; target: string };

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

