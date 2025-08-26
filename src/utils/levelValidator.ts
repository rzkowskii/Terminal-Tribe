import { FileSystemState, FileSystemNode, Level } from '../types/level';
import { validateArchive, validateCron, validateFilesPresence, validateProcesses } from '../services/postConditionValidators';

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
    const res = validateProcesses(pc);
    if (!res.success) return res;
  }
  // Cron validation
  if (pc.cron) {
    const res = validateCron(pc);
    if (!res.success) return res;
  }
  // Archive validation
  if (pc.archive) {
    const res = validateArchive(pc, level.expectedState);
    if (!res.success) return res;
  }
  // Files presence validation
  if ((pc as unknown as { files?: { mustExist?: string[] } }).files?.mustExist) {
    const res = validateFilesPresence(pc, level.expectedState);
    if (!res.success) return res;
  }
  return { success: true };
}

export interface GameProgress {
  currentLevel: number;
  completedLevels: number[];
}
