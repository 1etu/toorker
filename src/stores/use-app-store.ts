import { create } from "zustand";

interface AppState {
  activeToolId: string | null;
  setActiveToolId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  prefillUrl: string | null;
  setPrefillUrl: (url: string | null) => void;
  recentToolIds: string[];

  updateAvailable: boolean;
  updateVersion: string | null;
  setUpdateAvailable: (available: boolean, version?: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeToolId: null,
  setActiveToolId: (id) =>
    set((state) => ({
      activeToolId: id,
      ...(id
        ? {
            recentToolIds: [
              id,
              ...state.recentToolIds.filter((t) => t !== id),
            ].slice(0, 8),
          }
        : {}),
    })),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  prefillUrl: null,
  setPrefillUrl: (url) => set({ prefillUrl: url }),
  recentToolIds: [],

  updateAvailable: false,
  updateVersion: null,
  setUpdateAvailable: (available, version = null) =>
    set({ updateAvailable: available, updateVersion: version }),
}));
