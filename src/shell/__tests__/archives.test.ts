import { execute } from '../../shell';
import { FileSystemState } from '../../types/level';
import useUiStore from '../../stores/uiStore';

function ctx(state: FileSystemState) { return { currentState: state }; }

describe('archives and checksums', () => {
  it('creates, lists, extracts tar and computes sha256', async () => {
    useUiStore.setState({ featureFlags: { ...useUiStore.getState().featureFlags, archives: true } });
    let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: { 'a.txt': { type: 'file', content: 'A' }, 'b.txt': { type: 'file', content: 'B' } } } } } } } as any;
    let res = await execute('tar -czf out.tar a.txt b.txt', ctx(state));
    expect(res.status).toBe('success');
    state = res.newState!;
    res = await execute('tar -tf out.tar', ctx(state));
    expect(res.output).toContain('a.txt');
    res = await execute('rm a.txt b.txt', ctx(state));
    state = res.newState!;
    res = await execute('tar -xf out.tar', ctx(state));
    expect(res.status).toBe('success');
    res = await execute('sha256sum out.tar', ctx(state));
    expect(res.status).toBe('success');
    expect(res.output).toMatch(/[0-9a-f]{64}/);
  });
});


