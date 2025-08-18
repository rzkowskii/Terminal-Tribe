import { expandBrace } from '../../shell/expansion/brace';
import { expandTilde } from '../../shell/expansion/tilde';
import { expandGlob } from '../../shell/expansion/glob';
import { FileSystemState } from '../../types/level';

describe('expansions', () => {
  test('brace comma list', () => {
    expect(expandBrace('file{A,B}.txt')).toEqual(['fileA.txt', 'fileB.txt']);
  });

  test('brace numeric range ascending', () => {
    expect(expandBrace('phase{1..3}.txt')).toEqual(['phase1.txt', 'phase2.txt', 'phase3.txt']);
  });

  test('tilde expansion', () => {
    expect(expandTilde({}, '~')).toBe('/home/recruit');
    expect(expandTilde({}, '~/docs')).toBe('/home/recruit/docs');
    expect(expandTilde({}, '~agent47/logs')).toBe('/home/agent47/logs');
  });

  test('glob expansion star', () => {
    const state: FileSystemState = {
      currentDirectory: '/home/recruit',
      previousDirectory: '/home/recruit',
      files: {
        home: {
          type: 'directory',
          files: {
            recruit: {
              type: 'directory',
              files: {
                'a.txt': { type: 'file', content: '' },
                'b.txt': { type: 'file', content: '' },
                '.hidden': { type: 'file', content: '' },
                dir: { type: 'directory', files: { 'c.txt': { type: 'file', content: '' } } },
              }
            }
          }
        }
      }
    };
    const results = expandGlob(state, '/home/recruit', '*.txt');
    expect(results.sort()).toEqual(['/home/recruit/a.txt', '/home/recruit/b.txt'].sort());
  });
});


