import { CommandResult } from './types/commands';
import useLevelStore from './stores/levelStore';
import { execute as executeViaShell } from './shell';
import useUiStore from './stores/uiStore';
import { evaluateSolution } from './services/solutionPolicy';
import useTelemetryStore from './stores/telemetryStore';

// Type guard for FileSystemError

export async function executeCommand(input: string): Promise<CommandResult> {
  const store = useLevelStore.getState();
  const ui = useUiStore.getState();
  const currentState = store.currentFileSystem;
  try {
    const startedAt = Date.now();
    const res = await executeViaShell(input, { currentState });
    // If feature flag enabled, run SolutionPolicy to populate other approaches for completion modal
    if (ui.featureFlags.solutionPolicy) {
      const { levels, currentLevel } = store;
      const lvl = levels.find(l => l.id === currentLevel);
      if (lvl) {
        const evalRes = evaluateSolution({ rawCommand: input, stdout: res.output, stderr: res.status === 'error' ? res.output : '', fsBefore: currentState, fsAfter: res.newState, level: lvl });
        useUiStore.setState({
          completionOtherApproaches: evalRes.otherValidApproaches?.length ? Array.from(new Set(evalRes.otherValidApproaches)) : undefined,
          completionMatched: evalRes.matched || undefined,
        });
      }
    }
    // Telemetry
    const telemetry = useTelemetryStore.getState();
    if (telemetry.enabled) {
      const finishedAt = Date.now();
      telemetry.record({
        command: input,
        at: finishedAt,
        status: res.status,
        output: res.output,
        durationMs: finishedAt - startedAt,
        isError: res.status === 'error',
      });
    }
    return res;
  } catch (error) {
    console.error('Command execution error:', error);
    return { output: 'An error occurred while executing the command.', status: 'error' };
  }
}
