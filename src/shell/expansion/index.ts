import { ExecutionContext } from '../types';
import { expandTilde } from './tilde';
import { expandBrace } from './brace';
import { expandGlob } from './glob';
import { expandVariables } from './vars';

export function expandArgs(ctx: ExecutionContext, cwd: string, args: string[]): string[] {
  // Apply tilde, then brace, then glob. Run brace → may return many items.
  const expanded: string[] = [];
  for (const arg of args) {
    // Single-quoted strings should not expand variables; detect and strip quotes
    let raw = arg;
    const isSingleQuoted = raw.startsWith("'") && raw.endsWith("'");
    const isDoubleQuoted = raw.startsWith('"') && raw.endsWith('"');
    if (isSingleQuoted || isDoubleQuoted) {
      raw = raw.slice(1, -1);
    }
    const tilde = expandTilde(ctx, raw);
    const vars = isSingleQuoted ? tilde : expandVariables(tilde, processEnvShim());
    const brace = expandBrace(vars);
    for (const b of brace) {
      const globbed = expandGlob(ctx.currentState, cwd, b);
      if (globbed.length > 0) {
        expanded.push(...globbed);
      } else {
        expanded.push(b);
      }
    }
  }
  return expanded;
}

function processEnvShim(): Record<string, string | undefined> {
  // In browser/test, process.env may not exist; provide a minimal shim
  const env = (typeof process !== 'undefined' && typeof (process as unknown as { env?: Record<string, string | undefined> }).env !== 'undefined')
    ? ((process as unknown as { env?: Record<string, string | undefined> }).env as Record<string, string | undefined>)
    : {};
  return env || {};
}

