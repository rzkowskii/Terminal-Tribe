import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  showMap: boolean;
  showCodex: boolean;
  showPrologue: boolean;
  showCompletionModal: boolean;
  showPalette: boolean;
  showHint: boolean;
  showScene: boolean;
  showSceneEffects: boolean;
  showFinale?: boolean;
  showSettings?: boolean;
  showHints?: boolean;
  showSkills?: boolean;
  showProfile?: boolean;
  showSummary?: boolean;
  showAbout?: boolean;
  showTerminalHints?: boolean;
  autoAdvance: boolean;
  autoAdvanceDelayMs: number;
  completionTitle?: string;
  completionMessage?: string;
  completionCodexKey?: string;
  completionOtherApproaches?: string[];
  completionMatched?: string[];
  selectedCodexKey?: string;
  featureFlags: {
    solutionPolicy: boolean;
    processSim: boolean;
    archives: boolean;
    skills: boolean;
    badges: boolean;
    narrativeBranches: boolean;
    telemetry: boolean;
    suggestions: boolean;
    sandbox: boolean;
    deepLinks: boolean;
  };
  shownActIntros: number[];
  pendingActIntro?: number;
  currentActSelection?: number;
  setShowMap: (v: boolean) => void;
  setShowCodex: (v: boolean) => void;
  setShowPrologue: (v: boolean) => void;
  setShowCompletionModal: (v: boolean) => void;
  setShowPalette: (v: boolean) => void;
  setShowHint: (v: boolean) => void;
  toggleHint: () => void;
  setShowScene: (v: boolean) => void;
  toggleScene: () => void;
  setShowSceneEffects: (v: boolean) => void;
  toggleSceneEffects: () => void;
  setShowSkills: (v: boolean) => void;
  setShowProfile: (v: boolean) => void;
  setShowSummary: (v: boolean) => void;
  setShowAbout: (v: boolean) => void;
  setShowTerminalHints: (v: boolean) => void;
  setAutoAdvance: (v: boolean) => void;
  setAutoAdvanceDelay: (ms: number) => void;
  setSelectedCodexKey: (k?: string) => void;
  setCurrentActSelection: (act?: number) => void;
  setShowFinale: (v: boolean) => void;
  setShowSettings: (v: boolean) => void;
  setShowHints: (v: boolean) => void;
  openCompletion: (payload?: { title?: string; message?: string; codexKey?: string; otherApproaches?: string[]; matched?: string[] }) => void;
  showActIntro: (actId: number) => void;
  dismissActIntro: () => void;
  openFinale: () => void;
}

const useUiStore = create<UiState>()(persist((set, get) => ({
  showMap: false,
  showCodex: false,
  showPrologue: true,
  showCompletionModal: false,
  showPalette: false,
  showHint: false,
  showScene: false,
  showSceneEffects: true,
  showFinale: false,
  showSettings: false,
  showHints: true,
  showSkills: false,
  showProfile: false,
  showSummary: false,
  showAbout: false,
  showTerminalHints: true,
  autoAdvance: false,
  autoAdvanceDelayMs: 800,
  completionTitle: undefined,
  completionMessage: undefined,
  completionCodexKey: undefined,
  completionOtherApproaches: undefined,
  completionMatched: undefined,
  selectedCodexKey: undefined,
  shownActIntros: [],
  pendingActIntro: undefined,
  currentActSelection: undefined,
  featureFlags: {
    solutionPolicy: true,
    processSim: false,
    archives: false,
    skills: false,
    badges: false,
    narrativeBranches: false,
    telemetry: true,
    suggestions: false,
    sandbox: false,
    deepLinks: false,
  },
  setShowMap: (v) => set({ showMap: v }),
  setShowCodex: (v) => set({ showCodex: v }),
  setShowPrologue: (v) => set({ showPrologue: v }),
  setShowCompletionModal: (v) => set({ showCompletionModal: v }),
  setShowPalette: (v) => set({ showPalette: v }),
  setShowHint: (v) => set({ showHint: v }),
  toggleHint: () => set((s) => ({ showHint: !s.showHint })),
  setShowScene: (v) => set({ showScene: v }),
  toggleScene: () => set((s) => ({ showScene: !s.showScene })),
  setShowSceneEffects: (v) => set({ showSceneEffects: v }),
  toggleSceneEffects: () => set((s) => ({ showSceneEffects: !s.showSceneEffects })),
  setAutoAdvance: (v) => set({ autoAdvance: v }),
  setAutoAdvanceDelay: (ms) => set({ autoAdvanceDelayMs: ms }),
  setSelectedCodexKey: (k) => set({ selectedCodexKey: k }),
  setCurrentActSelection: (act) => set({ currentActSelection: act }),
  setShowFinale: (v) => set({ showFinale: v }),
  setShowSettings: (v) => set({ showSettings: v }),
  setShowHints: (v) => set({ showHints: v }),
  setShowSkills: (v) => set({ showSkills: v }),
  setShowProfile: (v) => set({ showProfile: v }),
  setShowSummary: (v) => set({ showSummary: v }),
  setShowAbout: (v) => set({ showAbout: v }),
  setShowTerminalHints: (v) => set({ showTerminalHints: v }),
  openCompletion: (payload) => set({
    showCompletionModal: true,
    completionTitle: payload?.title,
    completionMessage: payload?.message,
    completionCodexKey: payload?.codexKey,
    selectedCodexKey: payload?.codexKey,
    completionOtherApproaches: payload?.otherApproaches,
    completionMatched: payload?.matched,
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
  openFinale: () => set({ showFinale: true }),
}), {
  name: 'ui-store',
}));

export default useUiStore;


