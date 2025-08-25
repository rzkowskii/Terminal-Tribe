import { create } from 'zustand';

export interface CronEntry {
  id: string;
  schedule: string; // simple crontab string "* * * * *"
  command: string;
  lastRun?: number;
  nextDue?: number;
}

interface CronStore {
  entries: CronEntry[];
  add: (entry: Omit<CronEntry, 'id'>) => CronEntry;
  remove: (id: string) => void;
  list: () => CronEntry[];
  parseAndAdd: (line: string) => CronEntry | null;
  reset: () => void;
}

function computeNextDue(_schedule: string, from: number): number {
  // Minimal: every minute
  const oneMinute = 60 * 1000;
  return from + oneMinute;
}

let seq = 1;
const useCronStore = create<CronStore>((set, get) => ({
  entries: [],
  add: (entry) => {
    const now = Date.now();
    const withId: CronEntry = { id: String(seq++), ...entry, nextDue: computeNextDue(entry.schedule, now) };
    set((s) => ({ entries: [...s.entries, withId] }));
    return withId;
  },
  remove: (id) => set((s) => ({ entries: s.entries.filter(e => e.id !== id) })),
  list: () => get().entries,
  parseAndAdd: (line) => {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 6) return null;
    const schedule = parts.slice(0, 5).join(' ');
    const command = parts.slice(5).join(' ');
    return get().add({ schedule, command });
  },
  reset: () => set({ entries: [] }),
}));

export default useCronStore;


