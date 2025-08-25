import { create } from 'zustand';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: number;
}

interface AchievementStore {
  unlocked: Record<string, Achievement>;
  unlock: (id: string, title: string, description: string) => void;
  isUnlocked: (id: string) => boolean;
  list: () => Achievement[];
  reset: () => void;
}

const useAchievementStore = create<AchievementStore>((set, get) => ({
  unlocked: {},
  unlock: (id, title, description) => {
    if (get().unlocked[id]) return;
    set((s) => ({ unlocked: { ...s.unlocked, [id]: { id, title, description, unlockedAt: Date.now() } } }));
  },
  isUnlocked: (id) => !!get().unlocked[id],
  list: () => Object.values(get().unlocked),
  reset: () => set({ unlocked: {} }),
}));

export default useAchievementStore;


