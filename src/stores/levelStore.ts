import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FileSystemState, Level, defaultFileSystemState } from '../types/level';
import loadLevels from '../utils/levelLoader';
import { validateCommand as validateExactCommand, validateFileSystemState } from '../utils/levelValidator';
import useUIStore from './uiStore';
import useProgressStore from './progressStore';
import useSkillStore from './skillStore';

interface LevelStore {
  currentLevel: number;
  levels: Level[];
  completedLevels: Set<number>;
  currentFileSystem: FileSystemState;
  actFilter?: number;
  setActFilter: (act?: number) => void;
  setCurrentLevel: (level: number) => void;
  goToNextLevel: () => void;
  goToPrevLevel: () => void;
  goToLevel: (level: number) => void;
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
  levels: [],
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

  goToPrevLevel: () => {
    set((state) => {
      const prev = Math.max(1, state.currentLevel - 1);
      const levelData = state.levels.find(l => l.id === prev);
      if (!levelData) return state as any;
      return {
        currentLevel: prev,
        currentFileSystem: levelData.initialState || defaultFileSystemState
      };
    });
  },

  goToLevel: (level: number) => {
    set((state) => {
      const levelData = state.levels.find(l => l.id === level);
      if (!levelData) return state as any;
      return {
        currentLevel: level,
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
    return validateExactCommand(command, levelData.expectedCommand, levelData.acceptedCommands);
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
    const skills = useSkillStore.getState();
    set((state) => ({
      completedLevels: new Set([...state.completedLevels, state.currentLevel])
    }));
    const { levels, currentLevel } = get();
    const level = levels.find(l => l.id === currentLevel);
    const keys = level?.conceptKeys || [];
    keys.forEach(k => progress.unlockCodex(k, currentLevel));
    // Award XP for concept keys
    keys.forEach(k => skills.addXp(k, 5));
    const title = level?.successMessage || 'Success';
    const message = level?.successLore || 'Progress recorded.';
    const codexKey = keys[0];
    // Show completion modal for non-final levels
    if (currentLevel < (levels[levels.length - 1]?.id || 60)) {
      const { completionOtherApproaches } = useUIStore.getState();
      ui.openCompletion({ title, message, codexKey, otherApproaches: completionOtherApproaches });
    } else {
      // Final level completed
      ui.setShowFinale(true);
    }
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
