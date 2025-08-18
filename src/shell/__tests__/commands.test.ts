import { execute } from '../../shell';
import { FileSystemState } from '../../types/level';

function ctx(state: FileSystemState) {
  return { currentState: state };
}

describe('commands integration', () => {
  test('pwd', async () => {
    const state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any;
    const res = await execute('pwd', ctx(state));
    expect(res.status).toBe('success');
    expect(res.output).toBe('/home/recruit');
  });

  test('mkdir -p and ls -l', async () => {
    let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any;
    let res = await execute('mkdir -p out/alpha', ctx(state));
    expect(res.status).toBe('success');
    state = res.newState!;
    res = await execute('ls -l', ctx(state));
    expect(res.status).toBe('success');
    expect(res.output).toContain('out/');
  });

  test('touch brace expansion and glob', async () => {
    let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any;
    let res = await execute('touch phase{1..3}.txt', ctx(state));
    expect(res.status).toBe('success');
    state = res.newState!;
    res = await execute('ls /home/recruit/phase*.txt', ctx(state));
    expect(res.output).toContain('phase1.txt');
    expect(res.output).toContain('phase2.txt');
    expect(res.output).toContain('phase3.txt');
  });
});


