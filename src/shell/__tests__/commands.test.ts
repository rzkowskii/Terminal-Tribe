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

  test('pipeline echo | cat | cat', async () => {
    const state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any;
    const res = await execute('echo hello | cat | cat', ctx(state));
    expect(res.status).toBe('success');
    expect(res.output.trim()).toBe('hello');
  });

  test('redirection > and >> and <', async () => {
    let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any;
    // write via redirection
    let res = await execute('echo alpha > out.txt', ctx(state));
    expect(res.status).toBe('success');
    state = res.newState!;
    // append
    res = await execute('echo beta >> out.txt', ctx(state));
    expect(res.status).toBe('success');
    state = res.newState!;
    // read via stdin redirection
    res = await execute('cat < out.txt', ctx(state));
    expect(res.output.split(/\s+/).shift()).toBe('alphabeta');
  });

  test('stderr redirection 2>', async () => {
    let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any;
    // trigger an error (rm non-existing) with stderr redirected
    let res = await execute('rm nofile 2> errors.log', ctx(state));
    expect(res.status).toBe('error');
    // output should be suppressed (redirected)
    expect((res.output || '').trim()).toBe('');
    state = res.newState || state;
    // read back error log
    res = await execute('cat errors.log', ctx(state));
    expect(res.status).toBe('success');
    expect(res.output).toMatch(/No such file or directory|rm: missing operand|rm:/);
  });
});


