import { ParsedCommand, PipelineNode, Redirection, SimpleCommandNode } from './types';

// Minimal tokenizer that respects double quotes and backslash escapes.
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inDouble = false;
  let inSingle = false;
  let escape = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (escape) {
      current += ch;
      escape = false;
      continue;
    }

    if (ch === '\\') {
      escape = true;
      continue;
    }

    if (ch === '"' && !inSingle) { inDouble = !inDouble; current += ch; continue; }
    if (ch === "'" && !inDouble) { inSingle = !inSingle; current += ch; continue; }

    if (!inDouble && !inSingle && /\s/.test(ch)) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += ch;
  }

  if (current.length > 0) tokens.push(current);
  return tokens;
}

function splitByPipes(input: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inDouble = false;
  let inSingle = false;
  let escape = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (escape) { current += ch; escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; current += ch; continue; }
    if (ch === "'" && !inDouble) { inSingle = !inSingle; current += ch; continue; }
    if (!inDouble && !inSingle && ch === '|') {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim().length > 0) parts.push(current.trim());
  return parts;
}

function parseRedirections(tokens: string[]): { args: string[]; redirections: Redirection[] } {
  const args: string[] = [];
  const redirections: Redirection[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    // Merge split append tokens: '>' '>' 'file' => '>> file'
    if (t === '>' && tokens[i + 1] === '>' && i + 2 < tokens.length) {
      redirections.push({ kind: 'stdout', mode: 'append', target: tokens[i + 2] });
      i += 2;
      continue;
    }
    // Handle descriptor merge syntax 2>&1
    if (t === '2>' && tokens[i + 1] === '&1') {
      redirections.push({ kind: 'merge' });
      i++;
      continue;
    }
    // Handle attached redirections like >out.txt, >>log, 2>err
    const attached = t.match(/^(1?>{1,2}|2>|<)(.+)$/);
    if (attached) {
      const op = attached[1];
      const target = attached[2];
      if (op === '>' || op === '1>') redirections.push({ kind: 'stdout', mode: 'write', target });
      else if (op === '>>' || op === '1>>') redirections.push({ kind: 'stdout', mode: 'append', target });
      else if (op === '2>') redirections.push({ kind: 'stderr', mode: 'write', target });
      else if (op === '<') redirections.push({ kind: 'stdin', target });
      continue;
    }
    if ((t === '>' || t === '>>' || t === '2>' || t === '<') && i + 1 < tokens.length) {
      const target = tokens[i + 1];
      if (t === '>') redirections.push({ kind: 'stdout', mode: 'write', target });
      else if (t === '>>') redirections.push({ kind: 'stdout', mode: 'append', target });
      else if (t === '2>') redirections.push({ kind: 'stderr', mode: 'write', target });
      else if (t === '<') redirections.push({ kind: 'stdin', target });
      i++; // skip target token
      continue;
    }
    args.push(t);
  }
  return { args, redirections };
}

export function parse(input: string): ParsedCommand | null {
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;
  const segments = splitByPipes(trimmed);
  if (segments.length === 1) {
    const tokens = tokenize(segments[0]);
    if (tokens.length === 0) return null;
    const { args, redirections } = parseRedirections(tokens);
    const [name, ...rest] = args;
    const node: SimpleCommandNode = { type: 'command', name, args: rest, redirections: redirections.length ? redirections : undefined };
    return node;
  }
  const stages: SimpleCommandNode[] = segments.map(seg => {
    const tokens = tokenize(seg);
    const { args, redirections } = parseRedirections(tokens);
    const [name, ...rest] = args;
    return { type: 'command', name, args: rest, redirections: redirections.length ? redirections : undefined } as SimpleCommandNode;
  });
  const pipeline: PipelineNode = { type: 'pipeline', stages };
  return pipeline;
}

