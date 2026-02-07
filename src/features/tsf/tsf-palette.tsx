import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Search } from "lucide-react";
import { gatherActions } from "./tsf-provider";
import { getSmartActions } from "./smart-actions";
import { filterActions, useTsfStore } from "./use-tsf-actions";
import { TsfResultList } from "./tsf-result-list";
import type { TsfAction, TsfSection } from "./types";

const appWindow = getCurrentWebviewWindow();

export const TsfPalette = () => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [allActions, setAllActions] = useState<TsfAction[]>([]);
  const [feedback, setFeedback] = useState<{
    actionId: string;
    type: "copied" | "done";
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackActive = useRef(false);
  const { recentActions, addRecent } = useTsfStore();

  const loadActions = useCallback(async () => {
    const actions = await gatherActions(recentActions);
    setAllActions(actions);
  }, [recentActions]);

  useEffect(() => {
    const unlisten = appWindow.listen("tauri://focus", () => {
      setQuery("");
      setSelected(0);
      setFeedback(null);
      feedbackActive.current = false;
      loadActions();
      setTimeout(() => inputRef.current?.focus(), 30);
    });

    loadActions();
    setTimeout(() => inputRef.current?.focus(), 30);

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [loadActions]);

  useEffect(() => {
    const unlisten = appWindow.listen("tauri://blur", async () => {
      if (!feedbackActive.current) {
        await appWindow.hide();
      }
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        feedbackActive.current = false;
        setFeedback(null);
        await appWindow.hide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const smartActions = useMemo(
    () => getSmartActions(query),
    [query],
  );

  const sections: TsfSection[] = useMemo(() => {
    const filtered = filterActions(allActions, query);
    if (smartActions.length > 0) {
      return [
        { title: "Instant", actions: smartActions },
        ...filtered,
      ];
    }
    return filtered;
  }, [allActions, query, smartActions]);

  const flatCount = useMemo(
    () => sections.reduce((sum, s) => sum + s.actions.length, 0),
    [sections],
  );

  useEffect(() => {
    if (selected >= flatCount) {
      setSelected(Math.max(0, flatCount - 1));
    }
  }, [flatCount, selected]);

  const executeAtIndex = useCallback(
    async (index: number) => {
      if (feedbackActive.current) return;

      let i = 0;
      for (const section of sections) {
        for (const action of section.actions) {
          if (i === index) {
            if (action.type !== "smart") {
              addRecent(action);
            }

            await action.execute();

            if (action.type === "smart") {
              feedbackActive.current = true;
              setFeedback({
                actionId: action.id,
                type: action.result ? "copied" : "done",
              });
              setTimeout(async () => {
                feedbackActive.current = false;
                setFeedback(null);
                await appWindow.hide();
              }, 900);
            } else {
              await appWindow.hide();
            }
            return;
          }
          i++;
        }
      }
    },
    [sections, addRecent],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (feedbackActive.current) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((prev) => Math.min(prev + 1, flatCount - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      executeAtIndex(selected);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden rounded-lg border bg-background animate-slide-in">
      <div className="flex h-11 items-center gap-2 border-b px-4">
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            if (feedbackActive.current) return;
            setQuery(e.target.value);
            setSelected(0);
            setFeedback(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search, = 2+3, uuid, qr url, ip, open desktop, lorem..."
          className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/40"
        />
        <kbd className="shrink-0 rounded border border-border/50 bg-transparent px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/60">
          esc
        </kbd>
      </div>

      <TsfResultList
        sections={sections}
        selectedIndex={selected}
        onSelect={executeAtIndex}
        onHover={setSelected}
        feedback={feedback}
      />
    </div>
  );
};
