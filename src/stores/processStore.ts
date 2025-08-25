import { create } from 'zustand';

export type ProcessState = 'running' | 'stopped' | 'zombie';

export interface ProcessInfo {
  pid: number;
  command: string;
  state: ProcessState;
  nice: number;
  startAt: number; // epoch ms
  cpuModel?: string;
}

interface ProcessStore {
  nextPid: number;
  processes: Map<number, ProcessInfo>;
  spawn: (command: string, opts?: Partial<Pick<ProcessInfo, 'nice' | 'cpuModel'>>) => ProcessInfo;
  kill: (pid: number) => boolean;
  renice: (pid: number, delta: number) => boolean;
  setState: (pid: number, state: ProcessState) => boolean;
  list: () => ProcessInfo[];
  reset: () => void;
}

const useProcessStore = create<ProcessStore>((set, get) => ({
  nextPid: 1000,
  processes: new Map<number, ProcessInfo>(),
  spawn: (command, opts) => {
    const { nextPid, processes } = get();
    const info: ProcessInfo = {
      pid: nextPid,
      command,
      state: 'running',
      nice: opts?.nice ?? 0,
      startAt: Date.now(),
      cpuModel: opts?.cpuModel,
    };
    const newMap = new Map(processes);
    newMap.set(info.pid, info);
    set({ nextPid: nextPid + 1, processes: newMap });
    return info;
  },
  kill: (pid) => {
    const { processes } = get();
    if (!processes.has(pid)) return false;
    const newMap = new Map(processes);
    newMap.delete(pid);
    set({ processes: newMap });
    return true;
  },
  renice: (pid, delta) => {
    const { processes } = get();
    const p = processes.get(pid);
    if (!p) return false;
    const updated = { ...p, nice: p.nice + delta };
    const newMap = new Map(processes);
    newMap.set(pid, updated);
    set({ processes: newMap });
    return true;
  },
  setState: (pid, state) => {
    const { processes } = get();
    const p = processes.get(pid);
    if (!p) return false;
    const updated = { ...p, state };
    const newMap = new Map(processes);
    newMap.set(pid, updated);
    set({ processes: newMap });
    return true;
  },
  list: () => Array.from(get().processes.values()).sort((a, b) => a.pid - b.pid),
  reset: () => set({ nextPid: 1000, processes: new Map() }),
}));

export default useProcessStore;


