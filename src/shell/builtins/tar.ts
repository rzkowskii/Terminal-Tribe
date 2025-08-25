import { BuiltinCommand } from '../types';
import * as fs from '../../utils/fileSystem';
import { ArchiveService } from '../../services/archiveService';
import { ChecksumService } from '../../services/checksumService';
import useUiStore from '../../stores/uiStore';

function parseFlags(args: string[]): { flags: Set<string>; positionals: string[] } {
  const flags = new Set<string>();
  const positionals: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-f') {
      flags.add('f');
      positionals.push('-f');
      if (i + 1 < args.length) {
        positionals.push(args[++i]);
      }
      continue;
    }
    if (a.startsWith('-') && a.length > 1) {
      for (const ch of a.slice(1)) flags.add(ch);
    } else {
      positionals.push(a);
    }
  }
  return { flags, positionals };
}

export const tarCmd: BuiltinCommand = {
  meta: { name: 'tar', description: 'Create and extract archives (simulated)' },
  run: async (ctx, args) => {
    const { featureFlags } = useUiStore.getState();
    if (!featureFlags.archives) {
      return { output: 'Archives feature is disabled in Settings.', status: 'info' };
    }
    const { flags, positionals } = parseFlags(args);
    const create = flags.has('c');
    const extract = flags.has('x');
    const list = flags.has('t');
    const gzip = flags.has('z');
    const xz = flags.has('J');
    let fileName = '';
    let files: string[] = [];
    if (!create && !extract && !list) return { output: 'tar: must specify one of -c, -x, -t', status: 'error' };
    if (!flags.has('f')) return { output: 'tar: missing -f option', status: 'error' };
    fileName = positionals[0];
    files = positionals.slice(1);
    if (!fileName) return { output: 'tar: missing archive file after -f', status: 'error' };
    if (create) {
      // Fallback: if no files explicitly provided, include all files in CWD
      let targetFiles = files;
      if (targetFiles.length === 0) {
        const cwd = ctx.currentState.currentDirectory;
        const node = fs.getNodeAtPath(ctx.currentState, cwd);
        if (node && node.type === 'directory') {
          targetFiles = Object.entries(node.files)
            .filter(([_, n]) => n.type === 'file')
            .map(([name]) => name);
        }
      }
      const tarNode = ArchiveService.createTarball(ctx.currentState, ctx.currentState.currentDirectory, targetFiles, gzip, xz);
      const abs = fs.resolvePath(ctx.currentState.currentDirectory, fileName);
      const newState = fs.writeFile(ctx.currentState, abs, tarNode.content, false);
      return { output: '', status: 'success', newState };
    }
    const abs = fs.resolvePath(ctx.currentState.currentDirectory, fileName);
    const node = fs.getNodeAtPath(ctx.currentState, abs);
    if (!node || node.type !== 'file') return { output: `tar: ${fileName}: not found`, status: 'error' };
    const data = JSON.parse(node.content || '{}');
    const tarNode = { type: 'file', content: node.content, manifest: data.manifest || {} } as any;
    if (list) {
      const entries = (tarNode.manifest && Object.keys(tarNode.manifest).length > 0)
        ? ArchiveService.listTarball(tarNode)
        : Object.keys(data.contents || {});
      return { output: entries.join('\n'), status: 'success', newState: ctx.currentState };
    }
    if (extract) {
      const newState = ArchiveService.extractTarball(ctx.currentState, ctx.currentState.currentDirectory, tarNode);
      return { output: '', status: 'success', newState };
    }
    return { output: 'tar: unsupported combination', status: 'error' };
  }
};

export const sha256sumCmd: BuiltinCommand = {
  meta: { name: 'sha256sum', description: 'Compute SHA256 checksum (simulated)' },
  run: async (ctx, args) => {
    const { featureFlags } = useUiStore.getState();
    if (!featureFlags.archives) {
      return { output: 'Archives feature is disabled in Settings.', status: 'info' };
    }
    const fileName = args[0];
    if (!fileName) return { output: 'sha256sum: missing file', status: 'error' };
    const abs = fs.resolvePath(ctx.currentState.currentDirectory, fileName);
    const node = fs.getNodeAtPath(ctx.currentState, abs);
    if (!node || node.type !== 'file') return { output: `sha256sum: ${fileName}: No such file`, status: 'error' };
    const sum = ChecksumService.sha256sum(node.content || '');
    return { output: `${sum}  ${fileName}`, status: 'success' };
  }
};


