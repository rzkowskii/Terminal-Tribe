import { create } from 'zustand';
import { FileSystemState, defaultFileSystemState } from '../types/level';

interface SandboxStore {
  fs: FileSystemState;
  reset: () => void;
  setFs: (s: FileSystemState) => void;
}

const initial: FileSystemState = {
  currentDirectory: '/home/recruit',
  previousDirectory: '/home/recruit',
  files: JSON.parse(JSON.stringify(defaultFileSystemState.files)),
};

const useSandboxStore = create<SandboxStore>((set) => ({
  fs: initial,
  reset: () => set({ fs: initial }),
  setFs: (s) => set({ fs: s }),
}));

export default useSandboxStore;


