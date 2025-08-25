import { create } from 'zustand';

export interface ThemeCosmetic {
  id: string;
  name: string;
  preview?: string;
}

interface CosmeticsStore {
  themes: ThemeCosmetic[];
  selectedThemeId?: string;
  setTheme: (id: string) => void;
  addTheme: (t: ThemeCosmetic) => void;
  listThemes: () => ThemeCosmetic[];
}

const useCosmeticsStore = create<CosmeticsStore>((set, get) => ({
  themes: [
    { id: 'classic', name: 'Classic Green' },
    { id: 'neon', name: 'Neon Night' },
  ],
  selectedThemeId: 'classic',
  setTheme: (id) => set({ selectedThemeId: id }),
  addTheme: (t) => set((s) => ({ themes: [...s.themes, t] })),
  listThemes: () => get().themes,
}));

export default useCosmeticsStore;


