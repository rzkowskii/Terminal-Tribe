import { BuiltinCommand } from '../types';
import usePackageStore from '../../stores/packageStore';

export const aptCmd: BuiltinCommand = {
	meta: { name: 'apt', description: 'APT package manager (simulated)' },
	run: async (_ctx, args) => {
		const store = usePackageStore.getState();
		const [action, pkg] = args;
		if (action === 'search') {
			const term = args.slice(1).join(' ');
			return { output: store.search(term).map(p => `${p.name} - ${p.description || ''}`).join('\n'), status: 'success' };
		}
		if (action === 'install') {
			if (!pkg) return { output: 'apt: missing package name', status: 'error' };
			const ok = store.install(pkg);
			return { output: ok ? `Installed: ${pkg}` : `E: Unable to locate package ${pkg}`, status: ok ? 'success' : 'error' };
		}
		if (action === 'remove') {
			if (!pkg) return { output: 'apt: missing package name', status: 'error' };
			const ok = store.remove(pkg);
			return { output: ok ? `Removed: ${pkg}` : `E: Package '${pkg}' is not installed`, status: ok ? 'success' : 'error' };
		}
		return { output: `apt: unsupported action ${action || ''}`.trim(), status: 'error' };
	}
};

export const dpkgCmd: BuiltinCommand = {
	meta: { name: 'dpkg', description: 'Debian package tool (simulated)' },
	run: async (_ctx, args) => {
		const store = usePackageStore.getState();
		const [flag, name] = args;
		if (flag === '-l') {
			return { output: store.listInstalled().map(p => `${p.name}\t${p.version}`).join('\n'), status: 'success' };
		}
		if (flag === '-s' && name) {
			const info = store.status(name);
			if (!info) return { output: `package '${name}' not found`, status: 'error' };
			return { output: `${info.name}: ${info.version}`, status: 'success' };
		}
		return { output: 'dpkg: unsupported', status: 'error' };
	}
};

export const dnfCmd: BuiltinCommand = {
	meta: { name: 'dnf', description: 'DNF package manager (simulated)' },
	run: async (_ctx, args) => {
		const store = usePackageStore.getState();
		const [action, pkg] = args;
		if (action === 'search') {
			const term = args.slice(1).join(' ');
			return { output: store.search(term).map(p => `${p.name}\t${p.description || ''}`).join('\n'), status: 'success' };
		}
		if (action === 'install') {
			if (!pkg) return { output: 'dnf: missing package name', status: 'error' };
			const ok = store.install(pkg);
			return { output: ok ? `Installed: ${pkg}` : `No match for argument: ${pkg}`, status: ok ? 'success' : 'error' };
		}
		if (action === 'remove') {
			if (!pkg) return { output: 'dnf: missing package name', status: 'error' };
			const ok = store.remove(pkg);
			return { output: ok ? `Removed: ${pkg}` : `No Packages marked for removal`, status: ok ? 'success' : 'error' };
		}
		return { output: `dnf: unsupported action ${action || ''}`.trim(), status: 'error' };
	}
};

export const rpmCmd: BuiltinCommand = {
	meta: { name: 'rpm', description: 'RPM package manager (simulated)' },
	run: async (_ctx, args) => {
		const store = usePackageStore.getState();
		const [flag, name] = args;
		if (flag === '-q' && name) {
			const info = store.status(name);
			return { output: info ? `${name}-${info.version}` : `package ${name} is not installed`, status: info ? 'success' : 'error' };
		}
		return { output: 'rpm: unsupported', status: 'error' };
	}
};


