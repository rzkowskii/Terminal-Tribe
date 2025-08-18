import { create } from 'zustand';
import { CommandHistoryEntry, TerminalStore } from '../types/terminal';

interface TerminalUiState extends TerminalStore {
  historyIndex: number;
  setHistoryIndex: (i: number) => void;
  getPrevHistory: () => string | null;
  getNextHistory: () => string | null;
  complete: (prefix: string) => string | null;
}

const BUILTIN_COMMANDS = ['help','pwd','ls','cd','touch','mkdir','cp','mv','rm','rmdir','ln','echo','clear'];

const useTerminalStore = create<TerminalUiState>((set, get) => ({
  commandHistory: [],
  historyIndex: -1,

  addToHistory: (entry: CommandHistoryEntry) => {
    set((state) => ({
      commandHistory: [...state.commandHistory, entry],
      historyIndex: state.commandHistory.length + 1,
    }));
  },

  clearHistory: () => {
    set(() => ({
      commandHistory: [],
      historyIndex: -1,
    }));
  },

  setHistoryIndex: (i: number) => set({ historyIndex: i }),

  getPrevHistory: () => {
    const { commandHistory, historyIndex } = get();
    if (commandHistory.length === 0) return null;
    const nextIndex = Math.max(0, (historyIndex === -1 ? commandHistory.length : historyIndex) - 1);
    set({ historyIndex: nextIndex });
    return commandHistory[nextIndex]?.command ?? null;
  },

  getNextHistory: () => {
    const { commandHistory, historyIndex } = get();
    if (commandHistory.length === 0) return null;
    const nextIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
    set({ historyIndex: nextIndex });
    return commandHistory[nextIndex]?.command ?? null;
  },

  complete: (prefix: string) => {
    if (!prefix) return null;
    const candidates = BUILTIN_COMMANDS.filter(c => c.startsWith(prefix));
    if (candidates.length === 1) return candidates[0];
    return null;
  }
}));

export default useTerminalStore;
