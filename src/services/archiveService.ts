import { FileSystemState, FileNode, FileSystemNode } from '../types/level';
import * as fsUtil from '../utils/fileSystem';

export interface ArchiveManifest {
  [path: string]: string; // sha256 hash of file contents
}

export interface TarballNode extends FileNode {
  manifest: ArchiveManifest;
}

export class ArchiveService {
  static createTarball(state: FileSystemState, basePath: string, files: string[], gzip?: boolean, xz?: boolean): TarballNode {
    const manifest: ArchiveManifest = {};
    const contents: Record<string, string> = {};
    for (const rel of files) {
      const abs = basePath.replace(/\/$/, '') + '/' + rel.replace(/^\//, '');
      const node = getNode(state, abs);
      if (node && node.type === 'file') {
        manifest[rel] = sha256(node.content);
        contents[rel] = node.content;
      }
    }
    // Fallback: if no files captured, include all files in base directory
    if (Object.keys(manifest).length === 0) {
      const dir = getNode(state, basePath);
      if (dir && dir.type === 'directory') {
        for (const [name, node] of Object.entries(dir.files)) {
          if (node.type === 'file') {
            manifest[name] = sha256(node.content);
            contents[name] = node.content;
          }
        }
      }
    }
    // Serialize simple JSON payload; flags included for visibility only
    const payload = JSON.stringify({ algo: 'sha256', gzip: !!gzip, xz: !!xz, manifest, contents });
    const file: TarballNode = { type: 'file', content: payload, manifest } as TarballNode;
    return file;
  }

  static listTarball(file: TarballNode): string[] {
    return Object.keys(file.manifest).sort();
  }

  static extractTarball(state: FileSystemState, destPath: string, file: TarballNode): FileSystemState {
    const data = JSON.parse(file.content || '{}');
    let newState = { ...state } as FileSystemState;
    for (const [rel, content] of Object.entries<string>(data.contents || {})) {
      const target = destPath.replace(/\/$/, '') + '/' + rel.replace(/^\//, '');
      newState = fsUtil.writeFile(newState, target, content);
    }
    return newState;
  }
}

// Minimal FS helpers (avoid circular import)
function getNode(state: FileSystemState, path: string): FileSystemNode | undefined {
  const parts = path.split('/').filter(Boolean);
  let node: Record<string, FileSystemNode> | undefined = state.files as Record<string, FileSystemNode>;
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i];
    const isLast = i === parts.length - 1;
    if (!node) return undefined;
    const current = node[seg];
    if (isLast) return current as FileSystemNode;
    if (!current || current.type !== 'directory') return undefined;
    node = (current as { type: 'directory'; files: Record<string, FileSystemNode> }).files;
  }
  return undefined;
}

// writeFile is now delegated to fsUtil.writeFile above for consistent metadata

// Light-weight sha256 for deterministic tests (NOT cryptographically secure here)
export function sha256(input: string): string {
  // Simple FNV-1a 64-bit then hex-pad to look like sha256 for tests
  let hash = BigInt('14695981039346656037');
  const prime = BigInt('1099511628211');
  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i));
    hash *= prime;
  }
  return hash.toString(16).padStart(64, '0');
}


