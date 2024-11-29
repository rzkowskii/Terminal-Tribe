import { create } from 'zustand';
import { CommandHistoryEntry, TerminalStore } from '../types/terminal';

const useTerminalStore = create<TerminalStore>((set) => ({
  commandHistory: [],

  addToHistory: (entry: CommandHistoryEntry) => {
    set((state) => ({
      commandHistory: [...state.commandHistory, entry]
    }));
  },

  clearHistory: () => {
    set(() => ({
      commandHistory: []
    }));
  }
}));

export default useTerminalStore;
