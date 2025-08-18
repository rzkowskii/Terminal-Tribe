import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  showMap: boolean;
  showCodex: boolean;
  showPrologue: boolean;
  showCompletionModal: boolean;
  showPalette: boolean;
  completionTitle?: string;
  completionMessage?: string;
  completionCodexKey?: string;
  selectedCodexKey?: string;
  shownActIntros: number[];
  pendingActIntro?: number;
  currentActSelection?: number;
  setShowMap: (v: boolean) => void;
  setShowCodex: (v: boolean) => void;
  setShowPrologue: (v: boolean) => void;
  setShowCompletionModal: (v: boolean) => void;
  setShowPalette: (v: boolean) => void;
  setSelectedCodexKey: (k?: string) => void;
  setCurrentActSelection: (act?: number) => void;
  openCompletion: (payload?: { title?: string; message?: string; codexKey?: string }) => void;
  showActIntro: (actId: number) => void;
  dismissActIntro: () => void;
}

const useUiStore = create<UiState>()(persist((set, get) => ({
  showMap: false,
  showCodex: false,
  showPrologue: true,
  showCompletionModal: false,
  showPalette: false,
  completionTitle: undefined,
  completionMessage: undefined,
  completionCodexKey: undefined,
  selectedCodexKey: undefined,
  shownActIntros: [],
  pendingActIntro: undefined,
  currentActSelection: undefined,
  setShowMap: (v) => set({ showMap: v }),
  setShowCodex: (v) => set({ showCodex: v }),
  setShowPrologue: (v) => set({ showPrologue: v }),
  setShowCompletionModal: (v) => set({ showCompletionModal: v }),
  setShowPalette: (v) => set({ showPalette: v }),
  setSelectedCodexKey: (k) => set({ selectedCodexKey: k }),
  setCurrentActSelection: (act) => set({ currentActSelection: act }),
  openCompletion: (payload) => set({
    showCompletionModal: true,
    completionTitle: payload?.title,
    completionMessage: payload?.message,
    completionCodexKey: payload?.codexKey,
    selectedCodexKey: payload?.codexKey,
  }),
  showActIntro: (actId) => {
    const { shownActIntros } = get();
    if (!shownActIntros.includes(actId)) {
      set({ pendingActIntro: actId });
    }
  },
  dismissActIntro: () => {
    const { pendingActIntro, shownActIntros } = get();
    if (pendingActIntro) {
      set({ shownActIntros: [...shownActIntros, pendingActIntro], pendingActIntro: undefined });
    }
  },
}), {
  name: 'ui-store',
}));

export default useUiStore;


