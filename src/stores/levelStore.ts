import { create } from 'zustand';
import { Level, FileSystemState } from '../types/level';
import { validateCommand, validateFileSystemState, GameProgress } from '../utils/levelValidator';

interface LevelStore {
  levels: Level[];
  currentLevel: number;
  currentFileSystem: FileSystemState;
  completedLevels: number[];
  initializeLevels: (levels: Level[]) => void;
  validateCommand: (command: string) => boolean;
  validateState: () => boolean;
  completeLevel: () => void;
  resetLevel: () => void;
}

const useLevelStore = create<LevelStore>((set, get) => ({
  levels: [],
  currentLevel: 0,
  currentFileSystem: {
    currentDirectory: '/home/recruit',
    files: {}
  },
  completedLevels: [],

  initializeLevels: (levels: Level[]) => {
    set({
      levels,
      currentFileSystem: levels[0]?.initialState || {
        currentDirectory: '/home/recruit',
        files: {}
      }
    });
  },

  validateCommand: (command: string) => {
    const { levels, currentLevel } = get();
    const level = levels[currentLevel];
    return validateCommand(command, level.expectedCommand);
  },

  validateState: () => {
    const { levels, currentLevel, currentFileSystem } = get();
    const level = levels[currentLevel];
    const result = validateFileSystemState(currentFileSystem, level.expectedState);
    return result.success;
  },

  completeLevel: () => {
    const { currentLevel, completedLevels, levels } = get();
    if (!completedLevels.includes(currentLevel)) {
      set({
        completedLevels: [...completedLevels, currentLevel],
        currentLevel: currentLevel + 1 < levels.length ? currentLevel + 1 : currentLevel,
        currentFileSystem: levels[currentLevel + 1]?.initialState || {
          currentDirectory: '/home/recruit',
          files: {}
        }
      });
    }
  },

  resetLevel: () => {
    const { levels, currentLevel } = get();
    set({
      currentFileSystem: levels[currentLevel].initialState
    });
  }
}));

export default useLevelStore;
