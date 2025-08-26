import { create } from 'zustand';

interface SystemState {
	umask: string; // octal string like '022'
	setUmask: (mask: string) => void;
}

const useSystemStore = create<SystemState>((set) => ({
	umask: '022',
	setUmask: (mask) => set({ umask: mask })
}));

export default useSystemStore;


