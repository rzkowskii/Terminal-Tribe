import { FileSystemState } from '../types/level';
import useProcessStore from '../stores/processStore';
import useCronStore from '../stores/cronStore';
import * as fsUtil from '../utils/fileSystem';
import { ChecksumService } from './checksumService';

export interface ValidationOutcome {
  success: boolean;
  message?: string;
}

type ProcessesSpec = { processes?: { mustHaveCommand?: string[]; mustNotHaveCommand?: string[] } };
type CronSpec = { cron?: { mustHave?: string[] } };
type FilesSpec = { files?: { mustExist?: string[] } };

export function validateProcesses(pc: ProcessesSpec): ValidationOutcome {
  try {
    const store = useProcessStore.getState();
    const procs = store.list();
    const processes = pc.processes;
    if (Array.isArray(processes?.mustHaveCommand)) {
      for (const cmd of (processes.mustHaveCommand as string[])) {
        if (!procs.some(p => (p.command || '').includes(cmd))) {
          return { success: false, message: `Required process not present: ${cmd}` };
        }
      }
    }
    if (Array.isArray(processes?.mustNotHaveCommand)) {
      for (const cmd of (processes.mustNotHaveCommand as string[])) {
        if (procs.some(p => (p.command || '').includes(cmd))) {
          return { success: false, message: `Forbidden process present: ${cmd}` };
        }
      }
    }
  } catch {
    // ignore if store not available
  }
  return { success: true };
}

export function validateCron(pc: CronSpec): ValidationOutcome {
  try {
    const store = useCronStore.getState();
    const entries = store.list();
    const cron = pc.cron;
    if (Array.isArray(cron?.mustHave)) {
      for (const line of (cron.mustHave as string[])) {
        if (!entries.some(e => `${e.schedule} ${e.command}`.includes(line))) {
          return { success: false, message: `Cron entry missing: ${line}` };
        }
      }
    }
  } catch {
    // ignore if store not available
  }
  return { success: true };
}

export function validateArchive(pc: Record<string, unknown>, expectedState: FileSystemState): ValidationOutcome {
  const a = (pc as { archive?: { manifestPaths?: string[]; extractedInto?: string[]; checksums?: Array<{ file: string; sha256: string }> } }).archive;
  if (!a) return { success: true };
  if (Array.isArray(a.manifestPaths) && Array.isArray(a.extractedInto)) {
    for (const target of a.extractedInto as string[]) {
      const node = fsUtil.getNodeAtPath(expectedState, target);
      if (!node) return { success: false, message: `Expected extracted path missing: ${target}` };
    }
  }
  if (Array.isArray(a.checksums)) {
    for (const item of a.checksums as Array<{ file: string; sha256: string }>) {
      const node = fsUtil.getNodeAtPath(expectedState, item.file);
      if (!node || node.type !== 'file') return { success: false, message: `Expected file for checksum missing: ${item.file}` };
      const sum = ChecksumService.sha256sum((node.content as string) || '');
      if (sum !== item.sha256) return { success: false, message: `Checksum mismatch for ${item.file}` };
    }
  }
  return { success: true };
}

export function validateFilesPresence(pc: FilesSpec, expectedState: FileSystemState): ValidationOutcome {
  const files = pc.files;
  if (Array.isArray(files?.mustExist)) {
    for (const path of files.mustExist as string[]) {
      const node = fsUtil.getNodeAtPath(expectedState, path);
      if (!node) return { success: false, message: `Expected file/directory missing: ${path}` };
    }
  }
  return { success: true };
}


