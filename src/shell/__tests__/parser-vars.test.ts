import { execute } from '../../shell';
import { FileSystemState } from '../../types/level';

describe('quotes and variable expansion', () => {
  const base: FileSystemState = {
    currentDirectory: '/home/recruit',
    previousDirectory: '/home/recruit',
    files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } }
  } as any;

  test('double quotes allow $ expansion', async () => {
    (process as any).env = { MISSION_CODE: 'ALPHA' };
    const res = await execute('echo ${MISSION_CODE}', { currentState: base });
    expect(res.output).toBe('ALPHA');
  });

  test('single quotes suppress expansion', async () => {
    (process as any).env = { MISSION_CODE: 'ALPHA' };
    const res = await execute("echo '\\$MISSION_CODE'", { currentState: base });
    expect(res.output).toBe('$MISSION_CODE');
  });
});


