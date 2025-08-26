import { BuiltinCommand } from '../types';
import * as fs from '../../utils/fileSystem';
import { parseFlags } from '../flags';

function splitLines(input: string): string[] {
	// Preserve empty last line semantics by not trimming
	return input.split(/\n/);
}

function joinLines(lines: string[]): string {
	return lines.join('\n');
}

function readStdinOrFile(ctx: { currentState: fs.FileSystemState; stdin?: string }, filePath?: string): string | { error: string } {
	if (!filePath) {
		return (ctx.stdin as string | undefined) || '';
	}
	const abs = fs.resolvePath(ctx.currentState.currentDirectory, filePath);
	const node = fs.getNodeAtPath(ctx.currentState, abs);
	if (!node || !fs.isFileNode(node)) return { error: `head: ${filePath}: No such file` };
	return node.content || '';
}

export const headCmd: BuiltinCommand = {
	meta: { name: 'head', description: 'Output the first part of files' },
	run: async (ctx, args) => {
		const { flags, positionals } = parseFlags(args);
		let count = 10;
		let fileArg: string | undefined;
		if (flags.has('n')) {
			if (positionals.length === 0) return { output: 'head: option requires an argument -- n', status: 'error' };
			const nStr = positionals[0];
			const n = Number(nStr);
			if (!Number.isFinite(n) || n < 0) return { output: `head: invalid number of lines: '${nStr}'`, status: 'error' };
			count = Math.floor(n);
			fileArg = positionals[1];
		} else {
			fileArg = positionals[0];
		}
		const src = readStdinOrFile(ctx, fileArg);
		if (typeof src !== 'string') return { output: src.error, status: 'error' };
		const lines = splitLines(src);
		const out = joinLines(lines.slice(0, count));
		return { output: out, status: 'success', newState: ctx.currentState };
	}
};

export const tailCmd: BuiltinCommand = {
	meta: { name: 'tail', description: 'Output the last part of files' },
	run: async (ctx, args) => {
		const { flags, positionals } = parseFlags(args);
		let count = 10;
		let fileArg: string | undefined;
		if (flags.has('n')) {
			if (positionals.length === 0) return { output: 'tail: option requires an argument -- n', status: 'error' };
			const nStr = positionals[0];
			const n = Number(nStr);
			if (!Number.isFinite(n) || n < 0) return { output: `tail: invalid number of lines: '${nStr}'`, status: 'error' };
			count = Math.floor(n);
			fileArg = positionals[1];
		} else {
			fileArg = positionals[0];
		}
		const src = readStdinOrFile(ctx, fileArg);
		if (typeof src !== 'string') return { output: src.error, status: 'error' };
		let lines = splitLines(src);
		// Ignore trailing empty element caused by terminal newline
		if (src.endsWith('\n') && lines.length > 0 && lines[lines.length - 1] === '') {
			lines = lines.slice(0, -1);
		}
		const start = Math.max(0, lines.length - count);
		const out = joinLines(lines.slice(start));
		return { output: out, status: 'success', newState: ctx.currentState };
	}
};

export const wcCmd: BuiltinCommand = {
	meta: { name: 'wc', description: 'Print newline, word, and byte counts' },
	run: async (ctx, args) => {
		const { flags, positionals } = parseFlags(args);
		let fileArg: string | undefined;
		fileArg = positionals[0];
		const src = readStdinOrFile(ctx, fileArg);
		if (typeof src !== 'string') return { output: src.error, status: 'error' };
		const text = src;
		const lines = text.length === 0 ? 0 : text.split(/\n/).length - (text.endsWith('\n') ? 1 : 0);
		const words = text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
		const bytes = text.length;
		const wantLines = flags.size === 0 || flags.has('l');
		const wantWords = flags.size === 0 || flags.has('w');
		const wantBytes = flags.size === 0 || flags.has('c');
		const parts: string[] = [];
		if (wantLines) parts.push(String(lines));
		if (wantWords) parts.push(String(words));
		if (wantBytes) parts.push(String(bytes));
		return { output: parts.join(' '), status: 'success', newState: ctx.currentState };
	}
};

export const cutCmd: BuiltinCommand = {
	meta: { name: 'cut', description: 'Remove sections from each line of files' },
	run: async (ctx, args) => {
		const { flags, positionals } = parseFlags(args);
		let pi = 0;
		let delim = ',';
		let fieldsSpec = '';
		if (flags.has('d')) {
			if (pi >= positionals.length) return { output: 'cut: option requires an argument -- d', status: 'error' };
			delim = positionals[pi++];
		}
		if (flags.has('f')) {
			if (pi >= positionals.length) return { output: 'cut: option requires an argument -- f', status: 'error' };
			fieldsSpec = positionals[pi++];
		}
		const fileArg = positionals[pi];
		if (!fieldsSpec) return { output: 'cut: fields not specified', status: 'error' };
		const fields = fieldsSpec.split(',').map(s => Number(s)).filter(n => Number.isFinite(n) && n > 0).map(n => Math.floor(n) - 1);
		if (fields.length === 0) return { output: 'cut: invalid field list', status: 'error' };
		const src = readStdinOrFile(ctx, fileArg);
		if (typeof src !== 'string') return { output: src.error, status: 'error' };
		const outLines: string[] = [];
		for (const line of splitLines(src)) {
			if (line === '') { outLines.push(''); continue; }
			const cols = line.split(delim);
			const selected = fields.map(idx => (idx < cols.length ? cols[idx] : '')).filter((_, i) => i < fields.length);
			outLines.push(selected.join(delim));
		}
		return { output: joinLines(outLines), status: 'success', newState: ctx.currentState };
	}
};

export const grepCmd: BuiltinCommand = {
	meta: { name: 'grep', description: 'Print lines matching a pattern' },
	run: async (ctx, args) => {
		const { flags, positionals } = parseFlags(args);
		const ignoreCase = flags.has('i');
		const invert = flags.has('v');
		const extended = flags.has('E'); // for future use; JS regex is already extended
		if (positionals.length === 0) return { output: 'grep: missing pattern', status: 'error' };
		const pattern = positionals[0];
		const fileArg = positionals[1];
		const src = readStdinOrFile(ctx, fileArg);
		if (typeof src !== 'string') return { output: src.error, status: 'error' };
		const flagsRe = ignoreCase ? 'i' : '';
		let re: RegExp;
		try {
			re = new RegExp(pattern, flagsRe);
		} catch {
			return { output: `grep: invalid regex: ${pattern}`, status: 'error' };
		}
		const lines = splitLines(src);
		const out = lines.filter(line => invert ? !re.test(line) : re.test(line)).join('\n');
		return { output: out, status: 'success' };
	}
};

export const sortCmd: BuiltinCommand = {
	meta: { name: 'sort', description: 'Sort lines of text' },
	run: async (ctx, args) => {
		const { flags, positionals } = parseFlags(args);
		const numeric = flags.has('n');
		const reverse = flags.has('r');
		const fileArg = positionals[0];
		const src = readStdinOrFile(ctx, fileArg);
		if (typeof src !== 'string') return { output: src.error, status: 'error' };
		let lines = splitLines(src);
		if (src.endsWith('\n') && lines.length > 0 && lines[lines.length - 1] === '') lines = lines.slice(0, -1);
		const cmp = (a: string, b: string) => {
			if (numeric) {
				const na = parseFloat(a);
				const nb = parseFloat(b);
				if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
			}
			return a.localeCompare(b);
		};
		lines.sort(cmp);
		if (reverse) lines.reverse();
		return { output: lines.join('\n'), status: 'success' };
	}
};

export const uniqCmd: BuiltinCommand = {
	meta: { name: 'uniq', description: 'Report or omit repeated lines' },
	run: async (ctx, args) => {
		const { flags, positionals } = parseFlags(args);
		const count = flags.has('c');
		const fileArg = positionals[0];
		const src = readStdinOrFile(ctx, fileArg);
		if (typeof src !== 'string') return { output: src.error, status: 'error' };
		let lines = splitLines(src);
		if (src.endsWith('\n') && lines.length > 0 && lines[lines.length - 1] === '') lines = lines.slice(0, -1);
		const out: string[] = [];
		let last: string | undefined;
		let cnt = 0;
		const flush = () => {
			if (last === undefined) return;
			out.push(count ? `${cnt} ${last}` : last);
		};
		for (const line of lines) {
			if (last === undefined) { last = line; cnt = 1; continue; }
			if (line === last) { cnt++; continue; }
			flush();
			last = line; cnt = 1;
		}
		flush();
		return { output: out.join('\n'), status: 'success' };
	}
};

function expandCharSet(spec: string): string[] {
	// Support simple ranges like a-z and literal characters; no complements
	const out: string[] = [];
	for (let i = 0; i < spec.length; i++) {
		const ch = spec[i];
		if (i + 2 < spec.length && spec[i + 1] === '-') {
			const end = spec[i + 2];
			const startCode = ch.charCodeAt(0);
			const endCode = end.charCodeAt(0);
			if (endCode >= startCode) {
				for (let c = startCode; c <= endCode; c++) out.push(String.fromCharCode(c));
				i += 2;
				continue;
			}
		}
		out.push(ch);
	}
	return out;
}

export const trCmd: BuiltinCommand = {
	meta: { name: 'tr', description: 'Translate or delete characters' },
	run: async (ctx, args) => {
		const { flags, positionals } = parseFlags(args);
		const del = flags.has('d');
		if (positionals.length === 0) return { output: 'tr: missing operand', status: 'error' };
		const set1 = positionals[0].replace(/^'|"|`|$/, '').replace(/'|"|`$/,'');
		const set2 = positionals[1] ? positionals[1].replace(/^'|"|`|$/, '').replace(/'|"|`$/,'') : '';
		const src = (ctx.stdin as string | undefined) || '';
		if (del) {
			const delSet = new Set(expandCharSet(set1));
			const out = Array.from(src).filter(ch => !delSet.has(ch)).join('');
			return { output: out, status: 'success' };
		}
		const from = expandCharSet(set1);
		const to = expandCharSet(set2);
		const map = new Map<string,string>();
		for (let i = 0; i < from.length; i++) map.set(from[i], to[i] ?? (to.length > 0 ? to[to.length - 1] : from[i]));
		const out = Array.from(src).map(ch => map.has(ch) ? (map.get(ch) as string) : ch).join('');
		return { output: out, status: 'success' };
	}
};

export const teeCmd: BuiltinCommand = {
	meta: { name: 'tee', description: 'Read from standard input and write to files' },
	run: async (ctx, args) => {
		const { flags, positionals } = parseFlags(args);
		const append = flags.has('a');
		if (positionals.length === 0) return { output: 'tee: missing file operand', status: 'error' };
		const input = (ctx.stdin as string | undefined) || '';
		let state = ctx.currentState;
		for (const target of positionals) {
			const abs = fs.resolvePath(state.currentDirectory, target);
			state = fs.writeFile(state, abs, input, append);
		}
		return { output: input, status: 'success', newState: state };
	}
};

export const diffCmd: BuiltinCommand = {
	meta: { name: 'diff', description: 'Compare files line by line (simplified)' },
	run: async (ctx, args) => {
		const { positionals } = parseFlags(args);
		if (positionals.length < 2) return { output: 'diff: missing file operands', status: 'error' };
		const [aPath, bPath] = positionals;
		const absA = fs.resolvePath(ctx.currentState.currentDirectory, aPath);
		const absB = fs.resolvePath(ctx.currentState.currentDirectory, bPath);
		const a = fs.getNodeAtPath(ctx.currentState, absA);
		const b = fs.getNodeAtPath(ctx.currentState, absB);
		if (!a || !fs.isFileNode(a)) return { output: `diff: ${aPath}: No such file`, status: 'error' };
		if (!b || !fs.isFileNode(b)) return { output: `diff: ${bPath}: No such file`, status: 'error' };
		if ((a.content || '') === (b.content || '')) return { output: '', status: 'success' };
		return { output: 'files differ', status: 'success' };
	}
};

export const fileTypeCmd: BuiltinCommand = {
	meta: { name: 'file', description: 'Determine file type (simplified)' },
	run: async (ctx, args) => {
		const { positionals } = parseFlags(args);
		if (positionals.length === 0) return { output: 'file: missing operand', status: 'error' };
		const p = positionals[0];
		const abs = fs.resolvePath(ctx.currentState.currentDirectory, p);
		const node = fs.getNodeAtPath(ctx.currentState, abs);
		if (!node) return { output: `${p}: cannot open (No such file or directory)`, status: 'error' };
		if (fs.isDirectoryNode(node)) return { output: `${p}: directory`, status: 'success' };
		if (fs.isSymlinkNode(node)) return { output: `${p}: symbolic link to ${node.target}`, status: 'success' };
		return { output: `${p}: ASCII text`, status: 'success' };
	}
};


