import { evaluateSolution } from '../../services/solutionPolicy';
import { FileSystemState, Level } from '../../types/level';

const baseFs: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any;

const level: Level = {
  id: 1,
  title: 'Test',
  story: '',
  task: '',
  expectedCommand: 'echo hello | cat',
  successMessage: 'ok',
  initialState: baseFs,
  expectedState: baseFs,
};

describe('SolutionPolicy', () => {
  it('matches aliases and flag order', () => {
    const res = evaluateSolution({ rawCommand: 'egrep -ni foo', stdout: '', stderr: '', fsBefore: baseFs, fsAfter: baseFs, level: { ...level, expectedCommand: 'grep -inE foo' } });
    expect(res.matched).toContain('pattern');
  });

  it('matches pipeline equivalence signature', () => {
    const res = evaluateSolution({ rawCommand: 'echo hello | cat', stdout: 'hello', stderr: '', fsBefore: baseFs, fsAfter: baseFs, level });
    expect(res.matched).toContain('pipeline-equivalence');
  });
});


