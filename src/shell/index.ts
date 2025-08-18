import { get, register } from './registry';
import { parse } from './parser';
import { ExecutionContext } from './types';
import help from './builtins/help';
import { pwd, echo, clear, ls, cd, touch, mkdir, cp, mv, rm, rmdir, ln } from './builtins/core';
import { expandArgs } from './expansion';

// Register builtins once
register(help);
register(pwd);
register(echo);
register(clear);
register(ls);
register(cd);
register(touch);
register(mkdir);
register(cp);
register(mv);
register(rm);
register(rmdir);
register(ln);

export async function execute(input: string, ctx: ExecutionContext) {
  const ast = parse(input);
  if (!ast) {
    return { output: '', status: 'info' as const };
  }
  const cmd = get(ast.name.toLowerCase());
  if (!cmd) {
    return { output: `Command not found: ${ast.name}. Type 'help' for a list of available commands.`, status: 'error' as const };
  }
  const args = expandArgs(ctx, ctx.currentState.currentDirectory, ast.args);
  return await cmd.run(ctx, args);
}


