import { BuiltinCommand } from '../types';
import useMountStore from '../../stores/mountStore';

export const mountCmd: BuiltinCommand = {
	meta: { name: 'mount', description: 'Mount a filesystem (simulated)' },
	run: async (_ctx, args) => {
		if (args.length < 2) return { output: 'mount: missing operand', status: 'error' };
		const [device, mountpoint] = args;
		useMountStore.getState().mount(device, mountpoint);
		return { output: '', status: 'success' };
	}
};

export const umountCmd: BuiltinCommand = {
	meta: { name: 'umount', description: 'Unmount a filesystem (simulated)' },
	run: async (_ctx, args) => {
		if (args.length < 1) return { output: 'umount: missing operand', status: 'error' };
		const [mountpoint] = args;
		useMountStore.getState().umount(mountpoint);
		return { output: '', status: 'success' };
	}
};

export const dfCmd: BuiltinCommand = {
	meta: { name: 'df', description: 'Report file system disk space usage (simulated)' },
	run: async () => {
		const rows = useMountStore.getState().list().map(m => `${m.device} ${m.mountpoint} ${m.size}`);
		return { output: rows.join('\n'), status: 'success' };
	}
};

export const duCmd: BuiltinCommand = {
	meta: { name: 'du', description: 'Estimate file space usage (simulated)' },
	run: async (_ctx, args) => {
		const path = args[0] || '/';
		// Simplified: return constant for demo
		return { output: `4096\t${path}`, status: 'success' };
	}
};

export const lsblkCmd: BuiltinCommand = {
	meta: { name: 'lsblk', description: 'List block devices (simulated)' },
	run: async () => {
		const rows = useMountStore.getState().listBlocks().map(b => `${b.name} ${b.size}`);
		return { output: rows.join('\n'), status: 'success' };
	}
};


