import { create } from 'zustand';

export interface CommandEvent {
  command: string;
  at: number;
  status: 'success' | 'error' | 'info';
  output?: string;
  durationMs?: number;
  isError?: boolean;
}

interface TelemetryStore {
  enabled: boolean;
  events: CommandEvent[];
  record: (e: CommandEvent) => void;
  clear: () => void;
  aggregate: () => { counts: Record<string, number> };
}

const useTelemetryStore = create<TelemetryStore>((set, get) => ({
  enabled: false,
  events: [],
  record: (e) => set((s) => ({ events: s.enabled ? [...s.events, e] : s.events })),
  clear: () => set({ events: [] }),
  aggregate: () => {
    const counts: Record<string, number> = {};
    for (const e of get().events) counts[e.command.split(/\s+/)[0]] = (counts[e.command.split(/\s+/)[0]] || 0) + 1;
    return { counts };
  },
}));

export default useTelemetryStore;


