import { create } from "zustand";
import type { TsfAction, TsfSection } from "./types";

interface TsfStore {
  recentActions: TsfAction[];
  addRecent: (action: TsfAction) => void;
}

const MAX_RECENT = 10;

export const useTsfStore = create<TsfStore>((set) => ({
  recentActions: [],
  addRecent: (action) =>
    set((state) => {
      const filtered = state.recentActions.filter((a) => a.id !== action.id);
      const recent: TsfAction = {
        ...action,
        type: "recent",
        section: "Recent",
      };
      return {
        recentActions: [recent, ...filtered].slice(0, MAX_RECENT),
      };
    }),
}));

function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  if (t.includes(q)) {
    return 100 + (q.length / t.length) * 50;
  }

  let qi = 0;
  let score = 0;
  let lastMatchIdx = -1;

  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      score += 10;
      if (lastMatchIdx === i - 1) {
        score += 5;
      }
      if (i === 0 || t[i - 1] === " " || t[i - 1] === "-") {
        score += 8;
      }
      lastMatchIdx = i;
      qi++;
    }
  }

  return qi === q.length ? score : 0;
}

function scoreAction(action: TsfAction, query: string): number {
  if (!query) return 1;

  const labelScore = fuzzyScore(query, action.label) * 2;
  const descScore = fuzzyScore(query, action.description);
  const keywordScore = action.keywords.reduce(
    (best, kw) => Math.max(best, fuzzyScore(query, kw)),
    0,
  );

  return Math.max(labelScore, descScore, keywordScore);
}

export function filterActions(
  actions: TsfAction[],
  query: string,
): TsfSection[] {
  const scored = actions
    .map((action) => ({ action, score: scoreAction(action, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  const sectionMap = new Map<string, TsfAction[]>();
  const sectionOrder: string[] = [];

  for (const { action } of scored) {
    if (!sectionMap.has(action.section)) {
      sectionMap.set(action.section, []);
      sectionOrder.push(action.section);
    }
    sectionMap.get(action.section)!.push(action);
  }

  return sectionOrder.map((title) => ({
    title,
    actions: sectionMap.get(title) || [],
  }));
}
