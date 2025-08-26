import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgressState {
  codexUnlocked: Set<string>;
  codexUnlockMap: Record<string, number[]>; // key -> levelIds
  achievements: Set<string>;
  unlockCodex: (key: string, levelId?: number) => void;
  unlockAchievement: (key: string) => void;
}

const useProgressStore = create<ProgressState>()(persist((set) => ({
  codexUnlocked: new Set<string>(),
  codexUnlockMap: {},
  achievements: new Set<string>(),
  unlockCodex: (key: string, levelId?: number) => set((state) => {
    const nextSet = new Set([...state.codexUnlocked, key]);
    const existing = state.codexUnlockMap[key] || [];
    const nextMap = { ...state.codexUnlockMap };
    if (typeof levelId === 'number' && !existing.includes(levelId)) {
      nextMap[key] = [...existing, levelId];
    } else if (!nextMap[key]) {
      nextMap[key] = existing;
    }
    return { codexUnlocked: nextSet, codexUnlockMap: nextMap };
  }),
  unlockAchievement: (key: string) => set((state) => ({ achievements: new Set([...state.achievements, key]) })),
}), {
  name: 'progress-store',
  partialize: (state) => ({
    codexUnlocked: Array.from(state.codexUnlocked),
    codexUnlockMap: state.codexUnlockMap,
    achievements: Array.from(state.achievements),
  }) as { codexUnlocked: string[]; codexUnlockMap: Record<string, number[]>; achievements: string[] },
  onRehydrateStorage: () => (state) => {
    if (!state) return;
    (state as unknown as ProgressState).codexUnlocked = new Set((state as unknown as { codexUnlocked?: string[] }).codexUnlocked || []);
    (state as unknown as ProgressState).achievements = new Set((state as unknown as { achievements?: string[] }).achievements || []);
    (state as unknown as ProgressState).codexUnlockMap = (state as unknown as { codexUnlockMap?: Record<string, number[]> }).codexUnlockMap || {};
  }
}));

export default useProgressStore;


