import { create } from 'zustand';

export interface PackageInfo {
	name: string;
	version: string;
	description?: string;
}

interface PackageStore {
	available: Record<string, PackageInfo>;
	installed: Record<string, PackageInfo>;
	index: (pkgs: PackageInfo[]) => void;
	search: (term: string) => PackageInfo[];
	install: (name: string) => boolean;
	remove: (name: string) => boolean;
	listInstalled: () => PackageInfo[];
	status: (name: string) => PackageInfo | undefined;
}

const usePackageStore = create<PackageStore>((set, get) => ({
	available: {
		"nano": { name: 'nano', version: '6.0', description: 'small, friendly text editor' },
		"curl": { name: 'curl', version: '7.88.1', description: 'command line tool for transferring data' },
		"nginx": { name: 'nginx', version: '1.24.0', description: 'high performance web server' },
	},
	installed: {},
	index: (pkgs) => set((s) => ({ available: { ...s.available, ...Object.fromEntries(pkgs.map(p => [p.name, p])) } })),
	search: (term) => {
		const t = term.toLowerCase();
		return Object.values(get().available).filter(p => p.name.toLowerCase().includes(t) || (p.description || '').toLowerCase().includes(t));
	},
	install: (name) => {
		const info = get().available[name];
		if (!info) return false;
		set((s) => ({ installed: { ...s.installed, [name]: info } }));
		return true;
	},
	remove: (name) => {
		if (!get().installed[name]) return false;
		set((s) => { const next = { ...s.installed }; delete next[name]; return { installed: next }; });
		return true;
	},
	listInstalled: () => Object.values(get().installed),
	status: (name) => get().installed[name] || get().available[name],
}));

export default usePackageStore;


