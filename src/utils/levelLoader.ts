import { Level, defaultFileSystemState } from '../types/level';
import levels1To20 from '../levels/levels1-20.json';
import levels21To40 from '../levels/levels21-40.json';
import levels41To60 from '../levels/levels41-60.json';

export const loadLevels = (): Level[] => {
  console.log('Loading levels from data:', levels1To20);
  const levels1 = levels1To20.levels.map(level => ({
    ...level,
    initialState: defaultFileSystemState,
    expectedState: defaultFileSystemState
  }));
  console.log('Successfully loaded levels:', levels1);

  console.log('Loading levels from data:', levels21To40);
  const levels2 = levels21To40.levels.map(level => ({
    ...level,
    initialState: defaultFileSystemState,
    expectedState: defaultFileSystemState
  }));
  console.log('Successfully loaded levels:', levels2);

  console.log('Loading levels from data:', levels41To60);
  const levels3 = levels41To60.levels.map(level => ({
    ...level,
    initialState: defaultFileSystemState,
    expectedState: defaultFileSystemState
  }));
  console.log('Successfully loaded levels:', levels3);

  // Combine all levels
  const allLevels = [...levels1, ...levels2, ...levels3];

  // Validate levels
  const validatedLevels = validateLevels(allLevels);
  console.log('Validated levels:', validatedLevels);

  return validatedLevels;
};

const validateLevels = (levels: Level[]): Level[] => {
  // Ensure levels are in order
  levels.sort((a, b) => a.id - b.id);

  // Check for missing or duplicate levels
  const levelIds = new Set(levels.map(level => level.id));
  const expectedIds = new Set(Array.from({ length: levels.length }, (_, i) => i + 1));

  const missingIds = [...expectedIds].filter(id => !levelIds.has(id));
  const duplicateIds = [...levelIds].filter(
    (id, index, arr) => arr.indexOf(id) !== index
  );

  if (missingIds.length > 0) {
    console.warn('Missing level IDs:', missingIds);
  }

  if (duplicateIds.length > 0) {
    console.warn('Duplicate level IDs:', duplicateIds);
  }

  return levels;
};

export default loadLevels;
