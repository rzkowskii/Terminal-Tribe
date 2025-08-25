import { create } from 'zustand';

export interface SkillProgress {
  xp: number;
  level: number;
  lastUpdated?: number;
}

interface SkillStore {
  skills: Record<string, SkillProgress>;
  addXp: (key: string, xp: number) => void;
  get: (key: string) => SkillProgress | undefined;
  reset: () => void;
}

function computeLevel(xp: number): number {
  if (xp < 10) return 1;
  if (xp < 30) return 2;
  if (xp < 60) return 3;
  return 4;
}

const useSkillStore = create<SkillStore>((set, get) => ({
  skills: {},
  addXp: (key, gain) => {
    const prev = get().skills[key] || { xp: 0, level: 1 };
    const xp = prev.xp + gain;
    const level = computeLevel(xp);
    set((s) => ({ skills: { ...s.skills, [key]: { xp, level, lastUpdated: Date.now() } } }));
  },
  get: (key) => get().skills[key],
  reset: () => set({ skills: {} }),
}));

export default useSkillStore;


