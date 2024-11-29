import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { TerminalStore, TerminalCommand } from '../types/terminal';

const useTerminalStore = create<TerminalStore>((set) => ({
  history: {
    commands: [],
  },

  addCommand: (command: string) => {
    const id = uuidv4();
    set((state) => ({
      history: {
        commands: [
          ...state.history.commands,
          {
            id,
            command,
          },
        ],
      },
    }));
    return id;
  },

  setCommandOutput: (id: string, output: string, status: TerminalCommand['status']) => {
    set((state) => ({
      history: {
        commands: state.history.commands.map((cmd) =>
          cmd.id === id
            ? {
                ...cmd,
                output,
                status,
              }
            : cmd
        ),
      },
    }));
  },

  clearHistory: () => {
    set({
      history: {
        commands: [],
      },
    });
  },
}));

export default useTerminalStore;
