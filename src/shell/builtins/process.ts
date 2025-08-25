import { BuiltinCommand } from '../types';
import useProcessStore from '../../stores/processStore';
import useCronStore from '../../stores/cronStore';
import useUiStore from '../../stores/uiStore';

export const psCmd: BuiltinCommand = {
  meta: { name: 'ps', description: 'List processes' },
  run: async () => {
    const { featureFlags } = useUiStore.getState();
    if (!featureFlags.processSim) return { output: 'Process simulation is disabled in Settings.', status: 'info' } as const;
    const rows = useProcessStore.getState().list().map(p => `${String(p.pid).padStart(5)} ${p.state.padEnd(7)} nice=${p.nice} ${p.command}`);
    const header = '  PID  STATE   NICE COMMAND';
    return { output: [header, ...rows].join('\n'), status: 'success' };
  }
};

export const killCmd: BuiltinCommand = {
  meta: { name: 'kill', description: 'Terminate a process by PID' },
  run: async (_ctx, args) => {
    const { featureFlags } = useUiStore.getState();
    if (!featureFlags.processSim) return { output: 'Process simulation is disabled in Settings.', status: 'info' } as const;
    const pid = Number(args[0]);
    if (!pid) return { output: 'kill: missing pid', status: 'error' };
    const ok = useProcessStore.getState().kill(pid);
    return { output: ok ? '' : `kill: (${pid}) - No such process`, status: ok ? 'success' : 'error' };
  }
};

export const niceCmd: BuiltinCommand = {
  meta: { name: 'nice', description: 'Adjust process priority' },
  run: async (_ctx, args) => {
    const { featureFlags } = useUiStore.getState();
    if (!featureFlags.processSim) return { output: 'Process simulation is disabled in Settings.', status: 'info' } as const;
    const pid = Number(args[0]);
    const delta = Number(args[1] || 0);
    if (!pid) return { output: 'nice: missing pid', status: 'error' };
    const ok = useProcessStore.getState().renice(pid, delta);
    return { output: ok ? '' : `nice: (${pid}) - No such process`, status: ok ? 'success' : 'error' };
  }
};

export const jobsCmd: BuiltinCommand = {
  meta: { name: 'jobs', description: 'List background jobs (stub)' },
  run: async () => ({ output: 'No background jobs', status: 'info' })
};

export const bgCmd: BuiltinCommand = {
  meta: { name: 'bg', description: 'Resume a job in background (stub)' },
  run: async () => ({ output: '', status: 'success' })
};

export const fgCmd: BuiltinCommand = {
  meta: { name: 'fg', description: 'Bring a job to foreground (stub)' },
  run: async () => ({ output: '', status: 'success' })
};

export const crontabCmd: BuiltinCommand = {
  meta: { name: 'crontab', description: 'Edit or list cron entries' },
  run: async (_ctx, args) => {
    const { featureFlags } = useUiStore.getState();
    if (!featureFlags.processSim) return { output: 'Process simulation is disabled in Settings.', status: 'info' } as const;
    const store = useCronStore.getState();
    if (args.length === 0) {
      const rows = store.list().map(e => `${e.id.padStart(3)} ${e.schedule}  ${e.command}`);
      return { output: rows.join('\n'), status: 'success' };
    }
    if (args[0] === '-l') {
      const rows = store.list().map(e => `${e.schedule} ${e.command}`);
      return { output: rows.join('\n'), status: 'success' };
    }
    if (args[0] === '-r' && args[1]) {
      store.remove(args[1]);
      return { output: '', status: 'success' };
    }
    const line = args.join(' ');
    const added = store.parseAndAdd(line);
    if (!added) return { output: 'crontab: invalid entry', status: 'error' };
    return { output: '', status: 'success' };
  }
};


