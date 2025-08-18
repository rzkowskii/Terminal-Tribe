import { FileSystemState } from '../../types/level';
import { getNodeAtPath, isDirectoryNode } from '../../utils/fileSystem';

// Very small globbing: supports *, ?, character classes like [abc] and POSIX classes [:alpha:] etc inside []
export function expandGlob(state: FileSystemState, cwd: string, pattern: string): string[] {
  // Absolute or relative target
  const isAbsolute = pattern.startsWith('/');
  let normalized = pattern;
  // Normalize special-case alias /home/recruit → /
  if (normalized.startsWith('/home/recruit/')) {
    normalized = '/' + normalized.slice('/home/recruit/'.length);
  } else if (normalized === '/home/recruit') {
    normalized = '/';
  }
  const baseDir = isAbsolute ? '/' : cwd;

  // Split by '/' and match segment-by-segment
  const segments = normalized.split('/').filter((s, i) => !(i === 0 && s === ''));
  return matchSegments(state, baseDir, segments);
}

function matchSegments(state: FileSystemState, base: string, segments: string[]): string[] {
  if (segments.length === 0) return [base];
  const [head, ...tail] = segments;

  // Resolve current directory node
  const node = getNodeAtPath(state, base);
  if (!node || !isDirectoryNode(node)) return [];

  // List entries of current dir
  const entries = Object.keys(node.files);
  const regex = globToRegex(head);
  const matches = entries.filter(name => regex.test(name));

  let results: string[] = [];
  for (const name of matches) {
    const nextBase = (base === '/' ? '' : base) + '/' + name;
    if (tail.length === 0) {
      results.push(nextBase);
    } else {
      results = results.concat(matchSegments(state, nextBase, tail));
    }
  }
  return results;
}

function globToRegex(glob: string): RegExp {
  // Translate POSIX classes inside [] like [:alpha:], [:digit:], [:lower:], [:upper:], [:alnum:], [:space:], [:punct:]
  let pattern = '';
  let inClass = false;
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i];
    if (ch === '*') {
      pattern += '.*';
    } else if (ch === '?') {
      pattern += '.';
    } else if (ch === '[') {
      inClass = true;
      pattern += '[';
      // peek ahead for POSIX class
    } else if (ch === ']' && inClass) {
      inClass = false;
      pattern += ']';
    } else if (inClass && ch === ':' && glob[i - 1] === '[') {
      // start of posix class is already handled by content
      pattern += ch;
    } else if (inClass && glob.slice(i - 1, i + 7) === '[:alpha:') {
      // fallback: handle by replacement pass later
      pattern += '[:alpha:';
      i += 6;
    } else {
      pattern += escapeRegex(ch);
    }
  }

  // Replace POSIX classes
  pattern = pattern
    .replace(/\[:alpha:\]/g, 'A-Za-z')
    .replace(/\[:lower:\]/g, 'a-z')
    .replace(/\[:upper:\]/g, 'A-Z')
    .replace(/\[:digit:\]/g, '0-9')
    .replace(/\[:alnum:\]/g, 'A-Za-z0-9')
    .replace(/\[:space:\]/g, '\\s')
    .replace(/\[:punct:\]/g, '!"#$%&' + "'" + '\\()*+,-./:;<=>?@\\[\\]^_`{|}~');

  const regex = new RegExp('^' + pattern + '$');
  return regex;
}

function escapeRegex(ch: string): string {
  return ch.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

