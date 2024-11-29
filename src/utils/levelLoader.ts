import { Level, FileSystemNode, FileSystemState, LevelFile } from '../types/level';

export function validateLevel(level: Level): boolean {
  try {
    if (!level) {
      console.error('Level is undefined or null');
      return false;
    }

    const hasRequiredFields = 
      typeof level.id === 'number' &&
      typeof level.title === 'string' &&
      typeof level.story === 'string' &&
      typeof level.task === 'string' &&
      typeof level.expectedCommand === 'string' &&
      typeof level.successMessage === 'string' &&
      validateFileSystemState(level.initialState) &&
      validateFileSystemState(level.expectedState);

    if (!hasRequiredFields) {
      console.error('Level is missing required fields:', level);
    }

    return hasRequiredFields;
  } catch (error) {
    console.error('Error validating level:', error);
    return false;
  }
}

function validateFileSystemState(state: FileSystemState): boolean {
  try {
    if (!state) {
      console.error('File system state is undefined or null');
      return false;
    }

    const hasRequiredFields =
      typeof state.currentDirectory === 'string' &&
      (!state.previousDirectory || typeof state.previousDirectory === 'string') &&
      validateFileSystem(state.files);

    if (!hasRequiredFields) {
      console.error('File system state is missing required fields:', state);
    }

    return hasRequiredFields;
  } catch (error) {
    console.error('Error validating file system state:', error);
    return false;
  }
}

function validateFileSystem(files: { [key: string]: FileSystemNode }): boolean {
  try {
    if (!files) {
      console.error('Files object is undefined or null');
      return false;
    }

    return Object.entries(files).every(([key, node]) => {
      if (!node) {
        console.error(`Node is undefined or null for key: ${key}`);
        return false;
      }

      if (!node.type) {
        console.error(`Node type is undefined for key: ${key}`);
        return false;
      }

      if (node.type === 'file') {
        return typeof node.content === 'string';
      } else if (node.type === 'directory') {
        return validateFileSystem(node.files);
      } else if (node.type === 'symlink') {
        return typeof node.target === 'string';
      }

      console.error(`Invalid node type for key: ${key}`, node);
      return false;
    });
  } catch (error) {
    console.error('Error validating file system:', error);
    return false;
  }
}

export function loadLevels(levelsData: LevelFile): Level[] {
  try {
    console.log('Loading levels from data:', levelsData);

    if (!levelsData || !Array.isArray(levelsData.levels)) {
      console.error('Invalid levels data format:', levelsData);
      return [];
    }

    const levels = levelsData.levels.map((level: any, index: number) => {
      try {
        const mappedLevel: Level = {
          id: level.id,
          title: level.title,
          story: level.story,
          task: level.task,
          expectedCommand: level.expectedCommand,
          successMessage: level.successMessage,
          initialState: {
            currentDirectory: level.initialState.currentDirectory,
            previousDirectory: level.initialState.previousDirectory,
            files: level.initialState.files || {}
          },
          expectedState: {
            currentDirectory: level.expectedState.currentDirectory,
            previousDirectory: level.expectedState.previousDirectory,
            files: level.expectedState.files || {}
          }
        };

        if (!validateLevel(mappedLevel)) {
          console.error(`Invalid level at index ${index}:`, level);
          return null;
        }

        return mappedLevel;
      } catch (error) {
        console.error(`Error mapping level at index ${index}:`, error);
        return null;
      }
    }).filter((level): level is Level => level !== null);

    console.log('Successfully loaded levels:', levels);
    return levels;
  } catch (error) {
    console.error('Error loading levels:', error);
    return [];
  }
}
