import { BuiltinCommand } from '../types';
import * as fs from '../../utils/fileSystem';
import { parseFlags } from '../flags';
import useSystemStore from '../../stores/systemStore';

function isOctalPerm(s: string): boolean {
	return /^[0-7]{3,4}$/.test(s);
}

function octalTripletToRwx(d: number): string {
	const r = (d & 4) ? 'r' : '-';
	const w = (d & 2) ? 'w' : '-';
	const x = (d & 1) ? 'x' : '-';
	return r + w + x;
}

function octalToSymbolic(mode: string, typeChar: 'd' | '-' | 'l' = '-'): string {
	const m = mode.length === 4 ? mode.slice(1) : mode;
	const u = parseInt(m[0], 8);
	const g = parseInt(m[1], 8);
	const o = parseInt(m[2], 8);
	return typeChar + octalTripletToRwx(u) + octalTripletToRwx(g) + octalTripletToRwx(o);
}

function applyPermsRecursive(state: fs.FileSystemState, path: string, perms: string, recursive: boolean): fs.FileSystemState {
	const node = fs.getNodeAtPath(state, path);
	if (!node) throw new Error('No such file or directory');
	const stack: Array<{ parent: { [k: string]: fs.FileSystemNode }, name: string }> = [];
	// Build path to node for immutable update
	const parts = fs.getPathParts(path);
	let cursor = state.files;
	for (let i = 0; i < parts.length; i++) {
		const name = parts[i];
		const child = cursor[name];
		if (!child) throw new Error('No such file or directory');
		stack.push({ parent: cursor, name });
		if (i < parts.length - 1) {
			if (!fs.isDirectoryNode(child)) throw new Error('Not a directory');
			cursor = child.files;
		}
	}
	// Clone root files
	const newFiles = { ...state.files };
	let currentMap = newFiles;
	for (let i = 0; i < stack.length; i++) {
		const { name } = stack[i];
		const original = (i === 0 ? state.files[name] : (currentMap as any)[name]) as fs.FileSystemNode;
		let cloned: fs.FileSystemNode = { ...original } as any;
		if (i < stack.length - 1 && fs.isDirectoryNode(original)) {
			cloned = { ...original, files: { ...original.files } } as any;
		}
		(currentMap as any)[name] = cloned;
		if (i < stack.length - 1 && fs.isDirectoryNode(cloned)) {
			currentMap = (cloned as fs.DirectoryNode).files;
		}
	}
	// Apply permissions on target node (last in stack)
	const last = stack[stack.length - 1];
	const target = (currentMap as any)[last.name] as fs.FileSystemNode & { permissions?: string };
	const targetType: 'd' | '-' | 'l' = fs.isDirectoryNode(target) ? 'd' : (fs.isSymlinkNode(target) ? 'l' : '-');
	(target as any).permissions = octalToSymbolic(perms, targetType);
	if (recursive && fs.isDirectoryNode(target)) {
		const walk = (dir: fs.DirectoryNode) => {
			for (const [k, child] of Object.entries(dir.files)) {
				if (fs.isDirectoryNode(child)) walk(child as fs.DirectoryNode);
				const chType: 'd' | '-' | 'l' = fs.isDirectoryNode(child) ? 'd' : (fs.isSymlinkNode(child) ? 'l' : '-');
				(child as any).permissions = octalToSymbolic(perms, chType);
			}
		};
		walk(target as fs.DirectoryNode);
	}
	return { ...state, files: newFiles } as fs.FileSystemState;
}

export const chmodCmd: BuiltinCommand = {
	meta: { name: 'chmod', description: 'Change file mode bits' },
	run: async (ctx, args) => {
		const { flags, positionals } = parseFlags(args);
		const recursive = flags.has('R');
		if (positionals.length < 2) return { output: 'chmod: missing operand', status: 'error' };
		const mode = positionals[0];
		const target = positionals[1];
		if (!isOctalPerm(mode)) return { output: `chmod: invalid mode: '${mode}'`, status: 'error' };
		const abs = fs.resolvePath(ctx.currentState.currentDirectory, target);
		try {
			const newState = applyPermsRecursive(ctx.currentState, abs, mode, recursive);
			return { output: '', status: 'success', newState };
		} catch (e) {
			return { output: `chmod: ${(e as Error).message}`, status: 'error' };
		}
	}
};

export const chownCmd: BuiltinCommand = {
	meta: { name: 'chown', description: 'Change file owner and group' },
	run: async (ctx, args) => {
		const { flags, positionals } = parseFlags(args);
		const recursive = flags.has('R');
		if (positionals.length < 2) return { output: 'chown: missing operand', status: 'error' };
		const spec = positionals[0];
		const target = positionals[1];
		const [owner, group] = spec.split(':');
		const abs = fs.resolvePath(ctx.currentState.currentDirectory, target);
		try {
			let newState = ctx.currentState;
			const apply = (p: string) => {
				const node = fs.getNodeAtPath(newState, p);
				if (!node) throw new Error('No such file or directory');
				const parts = fs.getPathParts(p);
				const name = parts.pop()!;
				let cursor = newState.files;
				for (const part of parts) {
					const n = cursor[part];
					if (!n || !fs.isDirectoryNode(n)) throw new Error('Invalid path');
					cursor = n.files;
				}
				const existing = cursor[name];
				cursor[name] = { ...existing, owner: owner || (existing as any).owner, group: group || (existing as any).group } as any;
			};
			apply(abs);
			if (recursive) {
				const node = fs.getNodeAtPath(newState, abs);
				const walk = (p: string, n: fs.FileSystemNode) => {
					if (fs.isDirectoryNode(n)) {
						for (const [k, child] of Object.entries(n.files)) {
							const cp = p + '/' + k;
							apply(cp);
							walk(cp, child);
						}
					}
				};
				if (node) walk(abs, node);
			}
			return { output: '', status: 'success', newState };
		} catch (e) {
			return { output: `chown: ${(e as Error).message}`, status: 'error' };
		}
	}
};

export const umaskCmd: BuiltinCommand = {
	meta: { name: 'umask', description: 'Set file mode creation mask' },
	run: async (_ctx, args) => {
		const store = useSystemStore.getState();
		if (args.length === 0) return { output: store.umask, status: 'success' };
		const mask = args[0];
		if (!/^[0-7]{3}$/.test(mask)) return { output: 'umask: invalid mask', status: 'error' };
		store.setUmask(mask);
		return { output: '', status: 'success' };
	}
};


