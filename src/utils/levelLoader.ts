import { Level, FileSystemState, defaultFileSystemState } from '../types/level';
import { assignInodes } from './fileSystem';
import levels1To20 from '../levels/levels1-20.json';
import levels21To40 from '../levels/levels21-40.json';
import levels41To60 from '../levels/levels41-60.json';
import { applyNarrative } from '../content/narrative';

const normalizeFileSystemState = (state?: Partial<FileSystemState> | any): FileSystemState => {
  if (!state) {
    return { ...defaultFileSystemState };
  }
  const currentDirectory = state.currentDirectory || defaultFileSystemState.currentDirectory;
  const previousDirectory = state.previousDirectory || currentDirectory;
  let files = state.files || {};
  // Treat provided files as root if it has a top-level 'home' directory; otherwise nest under /home/recruit
  const hasHomeRoot = files && typeof files === 'object' && Object.prototype.hasOwnProperty.call(files, 'home');
  if (!hasHomeRoot) {
    files = {
      home: {
        type: 'directory',
        files: {
          recruit: {
            type: 'directory',
            files
          }
        }
      }
    } as any;
  }
  const normalized: FileSystemState = { currentDirectory, previousDirectory, files } as FileSystemState;
  return assignInodes(normalized);
};

const conceptFromCommand = (cmd: string): string[] => {
  const c = cmd.trim().split(/\s+/)[0];
  switch (c) {
    case 'pwd':
    case 'cd':
      return ['paths'];
    case 'ls':
      return ['listing'];
    case 'touch':
    case 'mkdir':
      return ['creation'];
    case 'cp':
    case 'mv':
      return ['copy-move'];
    case 'rm':
    case 'rmdir':
      return ['removal'];
    case 'ln':
      return ['links'];
    case 'echo':
      return ['expansion'];
    default:
      return [];
  }
};

const actBiomeForId = (id: number): { act: number; biome: Level['biome'] } => {
  if (id <= 12) return { act: 1, biome: 'outpost' } as any;
  if (id <= 20) return { act: 2, biome: 'jungle' } as any;
  if (id <= 36) return { act: 3, biome: 'arctic' } as any;
  if (id <= 48) return { act: 4, biome: 'archipelago' } as any;
  return { act: 5, biome: 'lunar' } as any;
};

const normalizeLevel = (raw: any): Level => {
  const normalizedInitial = normalizeFileSystemState(raw.initialState);
  const normalizedExpected = raw.expectedState ? normalizeFileSystemState(raw.expectedState) : normalizedInitial;
  const n: Level = {
    id: raw.id,
    title: raw.title,
    story: raw.story,
    task: raw.task,
    expectedCommand: raw.expectedCommand,
    successMessage: raw.successMessage,
    initialState: normalizedInitial,
    expectedState: normalizedExpected,
    act: raw.act,
    biome: raw.biome,
    loreIntro: raw.loreIntro,
    radioChatter: raw.radioChatter,
    successLore: raw.successLore,
    hint: raw.hint,
    conceptKeys: raw.conceptKeys || conceptFromCommand(raw.expectedCommand || '')
  };
  if (!n.act || !n.biome) {
    const ab = actBiomeForId(n.id);
    n.act = ab.act;
    n.biome = ab.biome;
  }
  return n;
};

export const loadLevels = (): Level[] => {
  const levels1 = levels1To20.levels.map(normalizeLevel);
  const levels2 = levels21To40.levels.map(normalizeLevel);
  const levels3 = levels41To60.levels.map(normalizeLevel);

  const allLevels = applyNarrative([...levels1, ...levels2, ...levels3]);
  const validatedLevels = validateLevels(allLevels);
  return validatedLevels;
};

export default loadLevels;

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

