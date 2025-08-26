import { create } from 'zustand';

export interface MountEntry {
	device: string;
	mountpoint: string;
	fstype: string;
	size: number; // bytes (simulated capacity)
}

interface MountStore {
	mounts: MountEntry[];
	blockDevices: Record<string, { name: string; size: number }>;
	mount: (device: string, mountpoint: string, fstype?: string, sizeBytes?: number) => void;
	umount: (mountpoint: string) => void;
	list: () => MountEntry[];
	listBlocks: () => Array<{ name: string; size: number }>;
}

const useMountStore = create<MountStore>((set, get) => ({
	mounts: [],
	blockDevices: {},
	mount: (device, mountpoint, fstype = 'ext4', sizeBytes = 1024 * 1024 * 1024) => set((s) => ({
		mounts: [...s.mounts.filter(m => m.mountpoint !== mountpoint), { device, mountpoint, fstype, size: sizeBytes }],
		blockDevices: { ...s.blockDevices, [device]: { name: device, size: sizeBytes } }
	})),
	umount: (mountpoint) => set((s) => ({ mounts: s.mounts.filter(m => m.mountpoint !== mountpoint) })),
	list: () => get().mounts,
	listBlocks: () => Object.values(get().blockDevices),
}));

export default useMountStore;


