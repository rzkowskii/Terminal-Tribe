import { create } from 'zustand';

type Faction = 'scribes' | 'circuit' | 'null' | undefined;

interface NarrativeStore {
  selectedFaction?: Faction;
  unlockedArcs: string[];
  setFaction: (f?: Faction) => void;
  unlockArc: (key: string) => void;
  reset: () => void;
}

const useNarrativeStore = create<NarrativeStore>((set, get) => ({
  selectedFaction: undefined,
  unlockedArcs: [],
  setFaction: (f) => set({ selectedFaction: f }),
  unlockArc: (key) => set({ unlockedArcs: Array.from(new Set([...get().unlockedArcs, key])) }),
  reset: () => set({ selectedFaction: undefined, unlockedArcs: [] }),
}));

export default useNarrativeStore;


