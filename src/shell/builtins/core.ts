import { BuiltinCommand } from '../types';
import * as fs from '../../utils/fileSystem';
import { isDirectoryNode, isFileNode, isSymlinkNode } from '../../utils/fileSystem';
import { parseFlags } from '../flags';

export const pwd: BuiltinCommand = {
  meta: { name: 'pwd', description: 'Print working directory' },
  run: async (ctx, args) => {
    const { flags } = parseFlags(args);
    let output = ctx.currentState.currentDirectory;
    if (flags.has('P')) {
      try {
        // Canonicalize fully by dereferencing nested symlinks in the path
        // @ts-ignore use internal util
        output = (fs as any).resolvePhysicalPath(ctx.currentState, output);
      } catch (_e) {
        // Fallback to logical path if resolution fails
      }
    }
    return { output, status: 'success', newState: ctx.currentState };
  }
};

export const echo: BuiltinCommand = {
  meta: { name: 'echo', description: 'Display a line of text' },
  run: async (_ctx, args) => {
    // Preserve quotes content: joining is fine since parser keeps quoted segments intact
    const output = args.join(' ');
    return { output, status: 'success' };
  }
};

export const clear: BuiltinCommand = {
  meta: { name: 'clear', description: 'Clear the terminal screen' },
  run: async () => ({ output: '', status: 'success', effects: { clearHistory: true } })
};

export const ls: BuiltinCommand = {
  meta: { name: 'ls', description: 'List directory contents' },
  run: async (ctx, args) => {
    const { flags, positionals } = parseFlags(args);
    const showHidden = flags.has('a');
    const detailed = flags.has('l');
    const recursive = flags.has('R');
    const showInode = flags.has('i');
    const listDirsOnly = flags.has('d');
    const targets = positionals.length > 0 ? positionals : [ctx.currentState.currentDirectory];

    const outputs: string[] = [];

    for (let targetPath of targets) {
      const resolved = fs.resolvePath(ctx.currentState.currentDirectory, targetPath);
      const node = fs.getNodeAtPath(ctx.currentState, resolved);
      if (!node) {
        outputs.push(`ls: cannot access '${targetPath}': No such file or directory`);
        continue;
      }
      if (isDirectoryNode(node)) {
        // Directory listing
        if (listDirsOnly) {
          // Only print the directory name itself
          outputs.push(resolved);
        } else if (detailed) {
          const listing = fs.formatListing(ctx.currentState, resolved, true);
          outputs.push(listing);
        } else {
          const items = fs.listDirectory(ctx.currentState, resolved, showHidden, recursive);
          outputs.push(items.join('  '));
        }
      } else {
        // File or symlink: show basename
        const baseName = resolved.split('/').pop() || resolved;
        let display = baseName;
        if (isSymlinkNode(node)) {
          display = `${baseName} -> ${node.target}`;
        }
        if (detailed) {
          const permissions = node.permissions || (isSymlinkNode(node) ? 'lrwxrwxrwx' : '-rw-r--r--');
          const owner = (node as any).owner || 'recruit';
          const group = (node as any).group || 'tribe';
          const size = isFileNode(node) ? (node.size || 0) : 0;
          const inode = (node as any).inode ? String((node as any).inode).padStart(6) + ' ' : '';
          display = `${inode}${permissions} ${owner} ${group} ${String(size).padStart(8)} ${display}`;
        }
        if (showInode) {
          const inode = (node as any).inode ? String((node as any).inode) : '000000';
          display = `${inode} ${display}`;
        }
        outputs.push(display);
      }
    }

    const output = outputs.join('\n');
    return { output, status: 'success', newState: ctx.currentState };
  }
};

export const cd: BuiltinCommand = {
  meta: { name: 'cd', description: 'Change directory' },
  run: async (ctx, args) => {
    const { flags, positionals } = parseFlags(args);
    const target = positionals[0] || '/home/recruit';
    const physical = flags.has('P');
    const newState = fs.changeDirectory(ctx.currentState, target, { physical });
    return { output: '', status: 'success', newState };
  }
};

export const touch: BuiltinCommand = {
  meta: { name: 'touch', description: 'Create an empty file' },
  run: async (ctx, args) => {
    const { positionals } = parseFlags(args);
    if (positionals.length === 0) return { output: 'touch: missing file operand', status: 'error' };
    let state = ctx.currentState;
    for (const p of positionals) {
      // Allow shorthand under /home/recruit flat area
      const absCandidate = fs.resolvePath(state.currentDirectory, p);
      const abs = absCandidate.startsWith('/home/recruit/') ? ('/' + absCandidate.slice('/home/recruit/'.length)) : absCandidate;
      state = fs.createFile(state, abs);
    }
    return { output: '', status: 'success', newState: state };
  }
};

export const mkdir: BuiltinCommand = {
  meta: { name: 'mkdir', description: 'Create directories' },
  run: async (ctx, args) => {
    const { flags, positionals } = parseFlags(args);
    const recursive = flags.has('p');
    if (positionals.length === 0) return { output: 'mkdir: missing operand', status: 'error' };
    let state = ctx.currentState;
    for (const p of positionals) {
      const abs = fs.resolvePath(state.currentDirectory, p);
      state = fs.createDirectory(state, abs, recursive);
    }
    return { output: '', status: 'success', newState: state };
  }
};

export const cp: BuiltinCommand = {
  meta: { name: 'cp', description: 'Copy files and directories' },
  run: async (ctx, args) => {
    const { flags, positionals } = parseFlags(args);
    const recursive = flags.has('r');
    if (positionals.length !== 2) return { output: 'cp: missing source or destination operand', status: 'error' };
    const [src, dst] = positionals;
    const absSrc = fs.resolvePath(ctx.currentState.currentDirectory, src);
    const absDst = fs.resolvePath(ctx.currentState.currentDirectory, dst);
    const newState = fs.copyFile(ctx.currentState, absSrc, absDst, recursive);
    return { output: '', status: 'success', newState };
  }
};

export const mv: BuiltinCommand = {
  meta: { name: 'mv', description: 'Move/rename files' },
  run: async (ctx, args) => {
    const { positionals } = parseFlags(args);
    if (positionals.length !== 2) return { output: 'mv: missing source or destination operand', status: 'error' };
    const [src, dst] = positionals;
    const absSrc = fs.resolvePath(ctx.currentState.currentDirectory, src);
    const absDst = fs.resolvePath(ctx.currentState.currentDirectory, dst);
    const { newState } = fs.moveFile(ctx.currentState, absSrc, absDst);
    return { output: '', status: 'success', newState };
  }
};

export const rm: BuiltinCommand = {
  meta: { name: 'rm', description: 'Remove files' },
  run: async (ctx, args) => {
    const { flags, positionals } = parseFlags(args);
    const recursive = flags.has('r');
    const force = flags.has('f');
    if (positionals.length === 0) return { output: 'rm: missing operand', status: 'error' };
    let state = ctx.currentState;
    for (const p of positionals) {
      const abs = fs.resolvePath(state.currentDirectory, p);
      state = fs.removeFile(state, abs, recursive, force);
    }
    return { output: '', status: 'success', newState: state };
  }
};

export const rmdir: BuiltinCommand = {
  meta: { name: 'rmdir', description: 'Remove empty directories' },
  run: async (ctx, args) => {
    const { positionals } = parseFlags(args);
    if (positionals.length === 0) return { output: 'rmdir: missing operand', status: 'error' };
    let state = ctx.currentState;
    for (const p of positionals) {
      const abs = fs.resolvePath(state.currentDirectory, p);
      state = fs.removeEmptyDirectory(state, abs);
    }
    return { output: '', status: 'success', newState: state };
  }
};

export const ln: BuiltinCommand = {
  meta: { name: 'ln', description: 'Create links' },
  run: async (ctx, args) => {
    const { flags, positionals } = parseFlags(args);
    const symbolic = flags.has('s');
    if (positionals.length !== 2) return { output: 'ln: missing source or destination operand', status: 'error' };
    const [src, dst] = positionals;
    const absSrc = fs.resolvePath(ctx.currentState.currentDirectory, src);
    const absDst = fs.resolvePath(ctx.currentState.currentDirectory, dst);
    const newState = fs.createLink(ctx.currentState, absSrc, absDst, symbolic);
    return { output: '', status: 'success', newState };
  }
};


