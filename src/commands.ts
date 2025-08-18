import { CommandResult } from './types/commands';
import useLevelStore from './stores/levelStore';
import { execute as executeViaShell } from './shell';

// Type guard for FileSystemError

export async function executeCommand(input: string): Promise<CommandResult> {
  const store = useLevelStore.getState();
  const currentState = store.currentFileSystem;
  try {
    return await executeViaShell(input, { currentState });
  } catch (error) {
    console.error('Command execution error:', error);
    return { output: 'An error occurred while executing the command.', status: 'error' };
  }
}
