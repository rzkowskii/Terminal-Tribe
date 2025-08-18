import { ParsedCommand } from './types';

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

export function parse(input: string): ParsedCommand | null {
  const tokens = tokenize(input.trim());
  if (tokens.length === 0) return null;
  const [name, ...args] = tokens;
  return { name, args };
}

