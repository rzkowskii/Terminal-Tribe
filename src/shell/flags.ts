import { FlagParseResult } from './types';

// Simple flag parser supporting -a -l and combined -rf style flags.
export function parseFlags(args: string[]): FlagParseResult {
  const flags = new Set<string>();
  const positionals: string[] = [];

  for (const arg of args) {
    if (arg === '--') {
      // Everything after -- is positional
      positionals.push(...args.slice(args.indexOf('--') + 1));
      break;
    }
    if (arg.startsWith('-') && arg !== '-') {
      const cluster = arg.slice(1);
      for (const ch of cluster) {
        flags.add(ch);
      }
    } else {
      positionals.push(arg);
    }
  }

  return { flags, positionals };
}

