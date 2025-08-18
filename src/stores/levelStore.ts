import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FileSystemState, Level, defaultFileSystemState } from '../types/level';
import loadLevels from '../utils/levelLoader';
import { validateCommand as validateExactCommand, validateFileSystemState } from '../utils/levelValidator';
import useUIStore from './uiStore';
import useProgressStore from './progressStore';

interface LevelStore {
  currentLevel: number;
  levels: Level[];
  completedLevels: Set<number>;
  currentFileSystem: FileSystemState;
  actFilter?: number;
  setActFilter: (act?: number) => void;
  setCurrentLevel: (level: number) => void;
  goToNextLevel: () => void;
  setCurrentFileSystem: (state: FileSystemState) => void;
  resetCurrentLevel: () => void;
  resetLevel: () => void;
  validateCommand: (command: string) => boolean;
  validateState: (state: FileSystemState) => boolean;
  completeLevel: () => void;
  initializeLevels: () => void;
}

const useLevelStore = create<LevelStore>()(persist((set, get) => ({
  currentLevel: 1,
  levels: loadLevels(),
  completedLevels: new Set<number>(),
  currentFileSystem: {
    currentDirectory: '/home/recruit',
    previousDirectory: '/home/recruit',
    files: defaultFileSystemState.files
  },
  actFilter: undefined,

  setActFilter: (act?: number) => set({ actFilter: act }),

  setCurrentLevel: (level: number) => {
    set((state) => {
      const levelData = state.levels.find(l => l.id === level);
      if (!levelData) return state as any;

      return {
        currentLevel: level,
        currentFileSystem: levelData.initialState || defaultFileSystemState
      };
    });
  },

  goToNextLevel: () => {
    set((state) => {
      const next = state.currentLevel + 1;
      const levelData = state.levels.find(l => l.id === next);
      if (!levelData) return state as any;
      return {
        currentLevel: next,
        currentFileSystem: levelData.initialState || defaultFileSystemState
      };
    });
  },

  setCurrentFileSystem: (state: FileSystemState) => {
    set(() => ({
      currentFileSystem: state
    }));
  },

  resetCurrentLevel: () => {
    set((state) => {
      const levelData = state.levels.find(l => l.id === state.currentLevel);
      if (!levelData) return state as any;

      return {
        currentFileSystem: levelData.initialState || defaultFileSystemState
      };
    });
  },

  resetLevel: () => {
    const { currentLevel, levels } = get();
    const levelData = levels.find(l => l.id === currentLevel);
    if (!levelData) return;

    set({
      currentFileSystem: levelData.initialState || defaultFileSystemState
    });
  },

  validateCommand: (command: string) => {
    const { currentLevel, levels } = get();
    const levelData = levels.find(l => l.id === currentLevel);
    if (!levelData) return false;
    return validateExactCommand(command, levelData.expectedCommand);
  },

  validateState: (state: FileSystemState) => {
    const { currentLevel, levels } = get();
    const levelData = levels.find(l => l.id === currentLevel);
    if (!levelData) return false;

    return validateFileSystemState(state, levelData.expectedState).success;
  },

  completeLevel: () => {
    const ui = useUIStore.getState();
    const progress = useProgressStore.getState();
    set((state) => ({
      completedLevels: new Set([...state.completedLevels, state.currentLevel])
    }));
    // Unlock codex entries by concept keys
    const { levels, currentLevel } = get();
    const level = levels.find(l => l.id === currentLevel);
    const keys = level?.conceptKeys || [];
    keys.forEach(k => progress.unlockCodex(k, currentLevel));
    const title = level?.successMessage || 'Success';
    const message = level?.successLore || 'Progress recorded.';
    const codexKey = keys[0];
    ui.openCompletion({ title, message, codexKey });
  },

  initializeLevels: () => {
    const levels = loadLevels();
    set({ levels });
  }
}), {
  name: 'level-store',
  partialize: (state) => ({ currentLevel: state.currentLevel, completedLevels: Array.from(state.completedLevels), actFilter: state.actFilter }) as any,
  onRehydrateStorage: () => (state) => {
    if (!state) return;
    (state as any).completedLevels = new Set((state as any).completedLevels || []);
  }
}));

export default useLevelStore;
