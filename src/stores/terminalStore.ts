import { create } from 'zustand';
import { CommandHistoryEntry, TerminalStore } from '../types/terminal';
import useLevelStore from './levelStore';

interface TerminalUiState extends TerminalStore {
  historyIndex: number;
  setHistoryIndex: (i: number) => void;
  getPrevHistory: () => string | null;
  getNextHistory: () => string | null;
  complete: (input: string, direction?: 1 | -1) => string | null;
  completionMatches?: string[];
  completionIndex?: number;
  resetCompletion: () => void;
  isearchOpen?: boolean;
  isearchQuery?: string;
  isearchResult?: string | null;
  openISearch: () => void;
  closeISearch: () => void;
  updateISearch: (q: string) => void;
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

  resetCompletion: () => set({ completionMatches: undefined, completionIndex: undefined }),
  isearchOpen: false,
  isearchQuery: '',
  isearchResult: null,
  openISearch: () => set({ isearchOpen: true, isearchQuery: '', isearchResult: null }),
  closeISearch: () => set({ isearchOpen: false, isearchQuery: '', isearchResult: null }),
  updateISearch: (q: string) => {
    const { commandHistory } = get();
    const matches = [...commandHistory].reverse().map(h => h.command).filter(c => c.includes(q));
    set({ isearchQuery: q, isearchResult: matches[0] || null });
  },

  complete: (input: string, direction: 1 | -1 = 1) => {
    if (!input) return null;
    const parts = input.split(/\s+/);
    // complete first token as command
    if (parts.length === 1) {
      const candidates = BUILTIN_COMMANDS.filter(c => c.startsWith(parts[0]));
      if (candidates.length === 1) return candidates[0];
      if (candidates.length > 1) {
        const { completionMatches, completionIndex } = get();
        const list = completionMatches && JSON.stringify(completionMatches) === JSON.stringify(candidates) ? completionMatches : candidates;
        const idx = completionIndex !== undefined ? (completionIndex + direction + list.length) % list.length : (direction === 1 ? 0 : list.length - 1);
        set({ completionMatches: list, completionIndex: idx });
        parts[0] = list[idx];
        return parts.join(' ');
      }
      return null;
    }
    // complete subsequent tokens from filesystem based on CWD
    const last = parts[parts.length - 1];
    const { currentFileSystem } = useLevelStore.getState();
    const cwd = currentFileSystem.currentDirectory;
    const joinPath = (base: string, seg: string) => base.replace(/\/$/, '') + '/' + seg.replace(/^\//, '');
    // resolve simple relative segment without full FS resolution; list entries in CWD
    const pathPrefix = last.includes('/') ? last.slice(0, last.lastIndexOf('/') + 1) : '';
    const namePrefix = last.slice(pathPrefix.length);
    // naive listing of CWD entries
    const pathParts = (pathPrefix.startsWith('/') ? pathPrefix : joinPath(cwd, pathPrefix)).split('/').filter(Boolean);
    let node: any = currentFileSystem.files;
    for (const seg of pathParts) {
      if (!node || node[seg]?.type !== 'directory') { node = null; break; }
      node = node[seg].files;
    }
    const entries = node ? Object.keys(node) : [];
    const matches = entries.filter(e => e.startsWith(namePrefix));
    if (matches.length >= 1) {
      const decorated = matches.map(m => m + (node && node[m]?.type === 'directory' ? '/' : ''));
      if (matches.length === 1) {
        parts[parts.length - 1] = pathPrefix + decorated[0];
        return parts.join(' ');
      }
      const { completionMatches, completionIndex } = get();
      const list = completionMatches && JSON.stringify(completionMatches) === JSON.stringify(decorated) ? completionMatches : decorated;
      const idx = completionIndex !== undefined ? (completionIndex + direction + list.length) % list.length : (direction === 1 ? 0 : list.length - 1);
      set({ completionMatches: list, completionIndex: idx });
      parts[parts.length - 1] = pathPrefix + list[idx];
      return parts.join(' ');
    }
    return null;
  }
}));

export default useTerminalStore;
