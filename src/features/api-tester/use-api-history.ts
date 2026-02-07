import { create } from "zustand";

export interface HistoryEntry {
  id: string;
  method: string;
  url: string;
  status: number;
  time: number;
  timestamp: number;
}

interface ApiHistoryStore {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  clearHistory: () => void;
}

const MAX_ENTRIES = 20;

export const useApiHistory = create<ApiHistoryStore>((set) => ({
  entries: [],
  addEntry: (entry) =>
    set((state) => ({
      entries: [
        {
          ...entry,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        },
        ...state.entries,
      ].slice(0, MAX_ENTRIES),
    })),
  clearHistory: () => set({ entries: [] }),
}));
