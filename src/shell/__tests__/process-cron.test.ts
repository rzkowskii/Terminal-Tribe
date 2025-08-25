import { execute } from '../../shell';
import useProcessStore from '../../stores/processStore';
import useCronStore from '../../stores/cronStore';
import useUiStore from '../../stores/uiStore';
import { FileSystemState } from '../../types/level';

function ctx(state: FileSystemState) { return { currentState: state }; }

describe('process and cron simulation', () => {
  beforeEach(() => {
    useProcessStore.getState().reset();
    useCronStore.getState().reset();
    useUiStore.setState({ featureFlags: { ...useUiStore.getState().featureFlags, processSim: true } });
  });

  it('ps, kill, nice basic flows', async () => {
    useProcessStore.getState().spawn('runaway');
    useProcessStore.getState().spawn('sleeper');
    const state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any;
    let res = await execute('ps', ctx(state));
    expect(res.output).toMatch(/runaway/);
    const pid = useProcessStore.getState().list()[0].pid;
    res = await execute(`nice ${pid} 5`, ctx(state));
    expect(res.status).toBe('success');
    res = await execute(`kill ${pid}`, ctx(state));
    expect(res.status).toBe('success');
    res = await execute('ps', ctx(state));
    expect(res.output).not.toMatch(new RegExp(String(pid)));
  });

  it('crontab add and list', async () => {
    const state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any;
    let res = await execute('crontab * * * * * echo hello', ctx(state));
    expect(res.status).toBe('success');
    res = await execute('crontab -l', ctx(state));
    expect(res.output).toMatch(/echo hello/);
  });
});


