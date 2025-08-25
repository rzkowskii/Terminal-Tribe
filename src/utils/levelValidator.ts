import { FileSystemState, FileSystemNode, Level } from '../types/level';

export interface LevelValidationResult {
  success: boolean;
  message?: string;
}

export function validateCommand(
  command: string,
  expectedCommand: string,
  acceptedCommands?: string[]
): boolean {
  // Normalize whitespace and flag order for simple cases like ls -la vs ls -al
  const normalize = (s: string) => {
    const parts = s.trim().split(/\s+/);
    if (parts.length === 0) return '';
    const name = parts[0];
    const rest = parts.slice(1);
    // Gather single-dash flag clusters and sort letters within each, and overall
    const flags: string[] = [];
    const args: string[] = [];
    for (const p of rest) {
      if (p.startsWith('-') && p !== '-') {
        const cluster = p.slice(1).split('').sort().join('');
        flags.push('-' + cluster);
      } else {
        args.push(p);
      }
    }
    flags.sort();
    return [name, ...flags, ...args].join(' ');
  };
  const norm = normalize(command);
  if (normalize(command) === normalize(expectedCommand)) return true;
  if (acceptedCommands && acceptedCommands.some(ac => normalize(ac) === norm)) return true;
  return false;
}

function compareNodes(actual: FileSystemNode, expected: FileSystemNode): boolean {
  if (actual.type !== expected.type) {
    return false;
  }

  if (actual.type === 'file' && expected.type === 'file') {
    return actual.content === expected.content;
  }

  if (actual.type === 'directory' && expected.type === 'directory') {
    return compareFiles(actual.files, expected.files);
  }

  if (actual.type === 'symlink' && expected.type === 'symlink') {
    return actual.target === expected.target;
  }

  return false;
}

function compareFiles(
  actual: { [key: string]: FileSystemNode },
  expected: { [key: string]: FileSystemNode }
): boolean {
  const actualKeys = Object.keys(actual).sort();
  const expectedKeys = Object.keys(expected).sort();

  if (actualKeys.length !== expectedKeys.length) {
    return false;
  }

  return actualKeys.every((key, index) => {
    if (key !== expectedKeys[index]) {
      return false;
    }
    return compareNodes(actual[key], expected[key]);
  });
}

export function validateFileSystemState(
  actual: FileSystemState,
  expected: FileSystemState
): LevelValidationResult {
  // Check current directory
  if (actual.currentDirectory !== expected.currentDirectory) {
    return {
      success: false,
      message: `Expected to be in ${expected.currentDirectory}, but was in ${actual.currentDirectory}`
    };
  }

  // Compare file systems
  if (!compareFiles(actual.files, expected.files)) {
    return {
      success: false,
      message: 'File system state does not match expected state'
    };
  }

  return {
    success: true,
    message: 'File system state matches expected state'
  };
}

export function validatePostConditions(level: Level, output?: string): LevelValidationResult {
  if (level.expectedOutput && (output || '').trim() !== level.expectedOutput.trim()) {
    return { success: false, message: 'Output does not match expected output' };
  }
  const pc = level.postConditions || {};
  // Processes validation
  if (pc.processes) {
    try {
      const useProcessStore = require('../stores/processStore').default as any;
      const procs: any[] = useProcessStore.getState().list();
      if (Array.isArray((pc as any).processes.mustHaveCommand)) {
        for (const cmd of (pc as any).processes.mustHaveCommand) {
          if (!procs.some(p => (p.command || '').includes(cmd))) {
            return { success: false, message: `Required process not present: ${cmd}` };
          }
        }
      }
      if (Array.isArray((pc as any).processes.mustNotHaveCommand)) {
        for (const cmd of (pc as any).processes.mustNotHaveCommand) {
          if (procs.some(p => (p.command || '').includes(cmd))) {
            return { success: false, message: `Forbidden process present: ${cmd}` };
          }
        }
      }
    } catch (_e) {}
  }
  // Cron validation
  if (pc.cron) {
    try {
      const useCronStore = require('../stores/cronStore').default as any;
      const entries: any[] = useCronStore.getState().list();
      if (Array.isArray((pc as any).cron.mustHave)) {
        for (const line of (pc as any).cron.mustHave) {
          if (!entries.some(e => `${e.schedule} ${e.command}`.includes(line))) {
            return { success: false, message: `Cron entry missing: ${line}` };
          }
        }
      }
    } catch (_e) {}
  }
  // Archive validation
  if (pc.archive) {
    const a: any = (pc as any).archive;
    if (Array.isArray(a.manifestPaths) && Array.isArray(a.extractedInto)) {
      // Ensure extracted files exist
      const fsUtil = require('./fileSystem');
      const dests: string[] = a.extractedInto;
      for (const target of dests) {
        const node = fsUtil.getNodeAtPath(level.expectedState, target);
        if (!node) return { success: false, message: `Expected extracted path missing: ${target}` };
      }
    }
    if (Array.isArray(a.checksums)) {
      const fsUtil = require('./fileSystem');
      const { ChecksumService } = require('../services/checksumService');
      for (const item of a.checksums as any[]) {
        const node = fsUtil.getNodeAtPath(level.expectedState, item.file);
        if (!node || (node as any).type !== 'file') return { success: false, message: `Expected file for checksum missing: ${item.file}` };
        const sum = ChecksumService.sha256sum((node as any).content || '');
        if (sum !== item.sha256) return { success: false, message: `Checksum mismatch for ${item.file}` };
      }
    }
  }
  // Files presence validation
  if ((pc as any).files?.mustExist) {
    const fsUtil = require('./fileSystem');
    for (const path of ((pc as any).files.mustExist as string[])) {
      const node = fsUtil.getNodeAtPath(level.expectedState, path);
      if (!node) return { success: false, message: `Expected file/directory missing: ${path}` };
    }
  }
  return { success: true };
}

export interface GameProgress {
  currentLevel: number;
  completedLevels: number[];
}
