import { get, register, list } from './registry';
import { parse } from './parser';
import { ExecutionContext, ParsedCommand, PipelineNode, SimpleCommandNode } from './types';
import * as fs from '../utils/fileSystem';
import help from './builtins/help';
import { pwd, echo, clear, ls, cd, touch, mkdir, cp, mv, rm, rmdir, ln, cat } from './builtins/core';
import { psCmd, killCmd, niceCmd, jobsCmd, bgCmd, fgCmd, crontabCmd } from './builtins/process';
import { tarCmd, sha256sumCmd } from './builtins/tar';
import { expandArgs } from './expansion';
import { headCmd, tailCmd, wcCmd, cutCmd, grepCmd, sortCmd, uniqCmd, trCmd, teeCmd, diffCmd, fileTypeCmd } from './builtins/text';
import { chmodCmd, chownCmd, umaskCmd } from './builtins/perm';
import { systemctlCmd, journalctlCmd, loggerCmd } from './builtins/systemd';
import { mountCmd, umountCmd, dfCmd, duCmd, lsblkCmd } from './builtins/fsops';
import { aptCmd, dpkgCmd, dnfCmd, rpmCmd } from './builtins/packages';
import { ipCmd, pingCmd } from './builtins/network';

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
register(cat);
register(psCmd);
register(killCmd);
register(niceCmd);
register(jobsCmd);
register(bgCmd);
register(fgCmd);
register(crontabCmd);
register(tarCmd);
register(sha256sumCmd);
register(headCmd);
register(tailCmd);
register(wcCmd);
register(cutCmd);
register(grepCmd);
register(sortCmd);
register(uniqCmd);
register(trCmd);
register(teeCmd);
register(diffCmd);
register(fileTypeCmd);
register(chmodCmd);
register(chownCmd);
register(umaskCmd);
register(systemctlCmd);
register(journalctlCmd);
register(loggerCmd);
register(mountCmd);
register(umountCmd);
register(dfCmd);
register(duCmd);
register(lsblkCmd);
register(aptCmd);
register(dpkgCmd);
register(dnfCmd);
register(rpmCmd);
register(ipCmd);
register(pingCmd);

interface CommandRunResult {
  output: string;
  status: 'success' | 'error' | 'info';
  newState?: fs.FileSystemState;
}

async function runSimple(node: SimpleCommandNode, baseCtx: ExecutionContext): Promise<CommandRunResult> {
  const cmd = get(node.name.toLowerCase());
  if (!cmd) {
    // Suggest nearest builtin by Levenshtein distance
    const names = list().map(c => c.meta.name);
    const dist = (a: string, b: string) => {
      const dp: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
      for (let i = 0; i <= a.length; i++) dp[i][0] = i;
      for (let j = 0; j <= b.length; j++) dp[0][j] = j;
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + cost
          );
        }
      }
      return dp[a.length][b.length];
    };
    let suggestion = '';
    let best = Infinity;
    for (const n of names) {
      const d = dist(node.name.toLowerCase(), n.toLowerCase());
      if (d < best) { best = d; suggestion = n; }
    }
    const hint = suggestion && best <= 2 ? `\nDid you mean: ${suggestion}?` : '';
    return { output: `Command not found: ${node.name}. Type 'help' for a list of available commands.${hint}` , status: 'error' as const };
  }
  const args = expandArgs(baseCtx, baseCtx.currentState.currentDirectory, node.args);
  try {
    return await cmd.run(baseCtx, args);
  } catch (err) {
    const message = (err as { message?: string } | undefined)?.message || 'Command failed';
    return { output: message, status: 'error' as const, newState: baseCtx.currentState };
  }
}

function applyRedirections(text: string, node: SimpleCommandNode, state: fs.FileSystemState, status: 'success' | 'error' | 'info'): { output: string; newState: fs.FileSystemState } {
	let newState = state;
	let suppressStdout = false;
	let suppressStderr = false;
	const redirs = node.redirections || [];
	for (const r of redirs) {
		if (r.kind === 'stdout') {
			const targetAbs = fs.resolvePath(newState.currentDirectory, r.target);
			if (r.mode === 'append') {
				const existing = fs.getNodeAtPath(newState, targetAbs);
				const prior = existing && fs.isFileNode(existing) ? (existing.content || '') : '';
				newState = fs.writeFile(newState, targetAbs, prior + text, false);
			} else {
				newState = fs.writeFile(newState, targetAbs, text, false);
			}
			suppressStdout = true;
		}
		if (r.kind === 'stdin') {
			// stdin redirection handled when running the command by reading file into stdin
		}
		if (r.kind === 'stderr') {
			const targetAbs = fs.resolvePath(newState.currentDirectory, r.target);
			newState = fs.writeFile(newState, targetAbs, text, r.mode === 'append');
			suppressStderr = true;
		}
		if (r.kind === 'merge') {
			// merge stderr into stdout (2>&1): no file write; downstream we treat stderr as stdout only
			suppressStderr = true;
		}
	}
	const output = (suppressStdout || (suppressStderr && status === 'error')) ? '' : text;
	return { output, newState };
}

export async function execute(input: string, ctx: ExecutionContext): Promise<CommandRunResult> {
	const ast: ParsedCommand | null = parse(input);
	if (!ast) {
		return { output: '', status: 'info' as const };
	}
	if (ast.type === 'pipeline') {
		let stdin = ctx.stdin || '';
		let currentState = ctx.currentState;
		for (let i = 0; i < (ast as PipelineNode).stages.length; i++) {
			const stage = (ast as PipelineNode).stages[i];
			// apply '<' redirection for stdin
			const stdinRedir = (stage.redirections || []).find(r => r.kind === 'stdin');
			if (stdinRedir) {
				const abs = fs.resolvePath(currentState.currentDirectory, (stdinRedir as { target: string }).target);
				const node = fs.getNodeAtPath(currentState, abs);
				if (node && fs.isFileNode(node)) {
					stdin = node.content || '';
				} else {
					return { output: `bash: ${stdinRedir.target}: No such file or not a file`, status: 'error' as const };
				}
			}
			const result = await runSimple(stage, { currentState, stdin });
			stdin = result.output || '';
			currentState = result.newState || currentState;
			// handle redirections at each stage
			const applied = applyRedirections(stdin, stage, currentState, result.status);
			currentState = applied.newState;
			stdin = applied.output; // if stdout was redirected, suppress pipeline output forward
		}
		return { output: stdin, status: 'success' as const, newState: currentState };
	}
	// Simple command with possible redirections
	let simple = ast as SimpleCommandNode;
	let stdin = ctx.stdin || '';
	const stdinRedir = (simple.redirections || []).find(r => r.kind === 'stdin');
	if (stdinRedir) {
		const abs = fs.resolvePath(ctx.currentState.currentDirectory, (stdinRedir as { target: string }).target);
		const node = fs.getNodeAtPath(ctx.currentState, abs);
		if (node && fs.isFileNode(node)) {
			stdin = node.content || '';
		} else {
			return { output: `bash: ${stdinRedir.target}: No such file or not a file`, status: 'error' as const };
		}
	}
	const result = await runSimple(simple, { currentState: ctx.currentState, stdin });
	// Prefer manual scan for redirections to handle tokenization edge cases like '> > file'
	const manualRedirs: Array<{ kind: 'stdout' | 'stderr' | 'stdin'; mode?: 'write' | 'append'; target: string }> = [];
	const rxAppend = /(^|\s)>{2}\s*(\S+)/;
	const rxWrite = /(^|\s)>(?!>)\s*(\S+)/;
	const rxStderr = /(^|\s)2>\s*(\S+)/;
	const rxStdin = /(^|\s)<\s*(\S+)/;
	const mAppend = input.match(rxAppend);
	const mWrite = input.match(rxWrite);
	const mStderr = input.match(rxStderr);
	const mStdin = input.match(rxStdin);
	if (mAppend && mAppend[2]) manualRedirs.push({ kind: 'stdout', mode: 'append', target: mAppend[2] });
	else if (mWrite && mWrite[2]) manualRedirs.push({ kind: 'stdout', mode: 'write', target: mWrite[2] });
	if (mStderr && mStderr[2]) manualRedirs.push({ kind: 'stderr', mode: 'write', target: mStderr[2] });
	if (mStdin && mStdin[2]) manualRedirs.push({ kind: 'stdin', target: mStdin[2] });

	const nodeForRedirs: SimpleCommandNode = manualRedirs.length > 0
		? ({ ...simple, redirections: manualRedirs as any } as SimpleCommandNode)
		: simple;

	const applied = applyRedirections(result.output || '', nodeForRedirs, result.newState || ctx.currentState, result.status);
	return { output: applied.output, status: result.status, newState: applied.newState };
}


