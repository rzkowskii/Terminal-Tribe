import { Level, FileSystemState } from '../types/level';
import { parse } from '../shell/parser';
import { PipelineNode, SimpleCommandNode } from '../shell/types';
import { validateFileSystemState, validatePostConditions } from '../utils/levelValidator';

export interface SolutionEvaluationInput {
  rawCommand: string;
  stdout?: string;
  stderr?: string;
  fsBefore: FileSystemState;
  fsAfter?: FileSystemState;
  level: Level;
}

export interface SolutionEvaluation {
  success: boolean;
  matched: Array<'pattern' | 'pipeline-equivalence' | 'outcome'>;
  otherValidApproaches: string[];
}

function normalizeFlags(command: string): string {
  const parts = command.trim().split(/\s+/);
  if (parts.length === 0) return '';
  const name = parts[0];
  const rest = parts.slice(1);
  const flagLetters: string[] = [];
  const args: string[] = [];
  for (const p of rest) {
    if (p.startsWith('-') && p !== '-') {
      for (const ch of p.slice(1)) flagLetters.push(ch);
    } else {
      args.push(p);
    }
  }
  const mergedFlags = flagLetters.length ? ('-' + Array.from(flagLetters).sort().join('')) : '';
  return [name, mergedFlags, ...args].filter(Boolean).join(' ');
}

function normalizeAliases(command: string): string {
  // Basic alias normalization (extensible): egrep -> grep -E; fgrep -> grep -F
  const tokens = command.trim().split(/\s+/);
  if (tokens.length === 0) return command;
  if (tokens[0] === 'egrep') {
    tokens[0] = 'grep';
    tokens.splice(1, 0, '-E');
  }
  if (tokens[0] === 'fgrep') {
    tokens[0] = 'grep';
    tokens.splice(1, 0, '-F');
  }
  return tokens.join(' ');
}

function stripNoOpsFromPipeline(node: PipelineNode): PipelineNode {
  // Remove pipeline no-ops like solitary 'cat' stages with no files
  const stages = node.stages.filter((s) => !(s.name === 'cat' && (s.args?.length || 0) === 0));
  return { type: 'pipeline', stages: stages.length > 0 ? stages : node.stages };
}

function simpleStageSignature(s: SimpleCommandNode): string {
  const parts = [s.name, ...(s.args || [])];
  return normalizeFlags(normalizeAliases(parts.join(' ')));
}

function pipelineSignature(node: PipelineNode | SimpleCommandNode): string {
  if (node.type === 'pipeline') {
    const stripped = stripNoOpsFromPipeline(node as PipelineNode);
    return (stripped.stages as SimpleCommandNode[]).map(simpleStageSignature).join(' | ');
  }
  return simpleStageSignature(node as SimpleCommandNode);
}

export function evaluateSolution(input: SolutionEvaluationInput): SolutionEvaluation {
  const { rawCommand, stdout, fsBefore, fsAfter, level } = input;
  const matched: SolutionEvaluation['matched'] = [];
  const otherValidApproaches: string[] = [];

  // 1) Pattern matcher (flags order, aliases)
  const normRaw = normalizeFlags(normalizeAliases(rawCommand));
  let patternPass = false;
  if (level.expectedCommand) {
    const base = normalizeFlags(normalizeAliases(level.expectedCommand));
    if (base === normRaw) patternPass = true;
  }
  const accepted = level.acceptedCommands || [];
  if (!patternPass && accepted.length > 0) {
    for (const acc of accepted) {
      const n = normalizeFlags(normalizeAliases(acc));
      if (n === normRaw) { patternPass = true; break; }
    }
    // Other approaches are any accepted commands that are not the user's raw command
    for (const acc of accepted) {
      const n = normalizeFlags(normalizeAliases(acc));
      if (n !== normRaw) otherValidApproaches.push(acc);
    }
  }
  if (patternPass) matched.push('pattern');

  // 2) Pipeline equivalence (order-insensitive filters not implemented; only no-op strip + aliasing)
  try {
    const ast = parse(rawCommand);
    if (ast) {
      const sig = pipelineSignature(ast as any);
      // Compare signature to expected and accepted
      if (level.expectedCommand) {
        const esig = pipelineSignature(parse(normalizeAliases(level.expectedCommand)) as any);
        if (esig === sig) matched.push('pipeline-equivalence');
      }
      for (const acc of accepted) {
        const asig = pipelineSignature(parse(normalizeAliases(acc)) as any);
        if (asig === sig && !otherValidApproaches.includes(acc)) otherValidApproaches.push(acc);
      }
    }
  } catch (_e) {
    // ignore parse errors here
  }

  // 3) Outcome validation (FS + expectedOutput + postConditions)
  let outcomePass = false;
  if (fsAfter) {
    const fsCheck = validateFileSystemState(fsAfter, level.expectedState || fsBefore);
    if (fsCheck.success) {
      const post = validatePostConditions(level, stdout);
      outcomePass = post.success;
    }
  }
  if (outcomePass) matched.push('outcome');

  const success = matched.length > 0 || outcomePass;
  return { success, matched, otherValidApproaches };
}


