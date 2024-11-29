import { create } from 'zustand';
import { FileSystemState, Level, defaultFileSystemState } from '../types/level';
import loadLevels from '../utils/levelLoader';

interface LevelStore {
  currentLevel: number;
  levels: Level[];
  completedLevels: Set<number>;
  currentFileSystem: FileSystemState;
  setCurrentLevel: (level: number) => void;
  setCurrentFileSystem: (state: FileSystemState) => void;
  resetCurrentLevel: () => void;
  resetLevel: () => void;
  validateCommand: (command: string) => boolean;
  validateState: (state: FileSystemState) => boolean;
  completeLevel: () => void;
  initializeLevels: () => void;
}

const useLevelStore = create<LevelStore>((set, get) => ({
  currentLevel: 1,
  levels: loadLevels(),
  completedLevels: new Set<number>(),
  currentFileSystem: {
    currentDirectory: '/home/recruit',
    previousDirectory: '/home/recruit',
    files: defaultFileSystemState.files
  },

  setCurrentLevel: (level: number) => {
    set((state) => {
      const levelData = state.levels.find(l => l.id === level);
      if (!levelData) return state;

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
      if (!levelData) return state;

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

    return command.trim() === levelData.expectedCommand.trim();
  },

  validateState: (state: FileSystemState) => {
    const { currentLevel, levels } = get();
    const levelData = levels.find(l => l.id === currentLevel);
    if (!levelData) return false;

    // Compare the current state with the expected state
    // This is a simple comparison - you might want to implement a more sophisticated one
    return JSON.stringify(state) === JSON.stringify(levelData.expectedState);
  },

  completeLevel: () => {
    set((state) => ({
      completedLevels: new Set([...state.completedLevels, state.currentLevel])
    }));
  },

  initializeLevels: () => {
    const levels = loadLevels();
    set({ levels });
  }
}));

export default useLevelStore;
