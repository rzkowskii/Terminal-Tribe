import { execute } from '../../shell';
import loadLevels from '../../utils/levelLoader';
import { validateFileSystemState, validateCommand as validateExactCommand } from '../../utils/levelValidator';
import { evaluateSolution } from '../../services/solutionPolicy';
import { FileSystemState } from '../../types/level';

jest.setTimeout(20000);

function cloneState<T>(s: T): T { return JSON.parse(JSON.stringify(s)); }

describe('Playtest all levels', () => {
  it('runs each level expected path without errors', async () => {
    const levels = loadLevels();
    expect(levels.length).toBeGreaterThanOrEqual(150);

    for (const level of levels) {
      let state: FileSystemState = cloneState(level.initialState);

      async function run(cmd: string) {
        const res = await execute(cmd, { currentState: state });
        state = res.newState || state;
        return res;
      }

      if (!level.expectedCommand) continue;

      if (level.expectedCommand === 'lab') {
        // Perform the standard lab scenario sequence to reach expected state
        await run('mkdir -p ops/reports/2024');
        await run('mv staging/report.txt ops/reports/2024/report.txt');
        await run('cp -r incoming/assets ops/assets');
        await run('ln -s ops/assets ops/link-assets');
        await run('rm -r incoming');
        await run('cd ops');
        const fsOk = validateFileSystemState(state, level.expectedState).success;
        if (!fsOk) {
          throw new Error(`Lab level ${level.id} failed to reach expected state`);
        }
        continue;
      }

      // Default path: try the expected command directly
      const res = await run(level.expectedCommand);

      // Simulate Terminal acceptance logic
      let accepted = false;
      if (validateExactCommand(level.expectedCommand, level.expectedCommand, level.acceptedCommands) && res.status === 'success') {
        accepted = !res.newState || validateFileSystemState(res.newState, level.expectedState).success;
      }
      if (!accepted && res.status !== 'error') {
        const evalRes = evaluateSolution({
          rawCommand: level.expectedCommand,
          stdout: res.output,
          stderr: res.status === 'error' ? res.output : '',
          fsBefore: cloneState(level.initialState),
          fsAfter: cloneState(state),
          level,
        });
        accepted = evalRes.success;
      }
      if (!accepted) {
        throw new Error(`Level ${level.id} did not accept expected path`);
      }
    }
  });
});


