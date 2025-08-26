import { BuiltinCommand } from '../types';
import useServiceStore from '../../stores/serviceStore';

export const systemctlCmd: BuiltinCommand = {
	meta: { name: 'systemctl', description: 'Control the systemd system and service manager (simulated)' },
	run: async (_ctx, args) => {
		const store = useServiceStore.getState();
		const [action, unit] = args;
		if (!action) return { output: 'systemctl: missing action', status: 'error' };
		if (action === 'status') {
			if (!unit) return { output: store.list().map(u => `${u.name} ${u.active ? 'active' : 'inactive'} ${u.enabled ? 'enabled' : 'disabled'}`).join('\n'), status: 'success' };
			const u = store.status(unit);
			if (!u) return { output: `${unit} not-found`, status: 'error' };
			return { output: `${unit} ${u.active ? 'active' : 'inactive'} ${u.enabled ? 'enabled' : 'disabled'}`, status: 'success' };
		}
		if (!unit) return { output: 'systemctl: missing unit', status: 'error' };
		store.ensure(unit);
		switch (action) {
			case 'start': store.start(unit); return { output: '', status: 'success' };
			case 'stop': store.stop(unit); return { output: '', status: 'success' };
			case 'enable': store.enable(unit); return { output: '', status: 'success' };
			case 'disable': store.disable(unit); return { output: '', status: 'success' };
			default: return { output: `systemctl: unsupported action ${action}`, status: 'error' };
		}
	}
};

export const loggerCmd: BuiltinCommand = {
	meta: { name: 'logger', description: 'Log messages to the system log (simulated)' },
	run: async (_ctx, args) => {
		const store = useServiceStore.getState();
		const message = args.join(' ');
		const unit = 'user.slice';
		store.ensure(unit);
		store.log(unit, message);
		return { output: '', status: 'success' };
	}
};

export const journalctlCmd: BuiltinCommand = {
	meta: { name: 'journalctl', description: 'Query the systemd journal (simulated)' },
	run: async (_ctx, args) => {
		const store = useServiceStore.getState();
		const unitIdx = args.indexOf('-u');
		let unit: string | undefined;
		if (unitIdx >= 0 && unitIdx + 1 < args.length) unit = args[unitIdx + 1];
		const units = unit ? [unit] : store.list().map(u => u.name);
		const lines: string[] = [];
		for (const u of units) {
			const s = store.status(u);
			if (!s) continue;
			for (const l of s.logs) lines.push(`${u}: ${l}`);
		}
		return { output: lines.join('\n'), status: 'success' };
	}
};


