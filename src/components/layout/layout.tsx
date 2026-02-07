import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { check } from "@tauri-apps/plugin-updater";
import { Sidebar, SETTINGS_ID } from "./sidebar";
import { TitleBar } from "./title-bar";
import { Home } from "@/features/home/home";
import { Settings } from "@/features/settings/settings";
import { useAppStore } from "@/stores/use-app-store";
import { getToolById, tools } from "@/lib/tool-registry";
import { getKeybinding, matchesKeybinding } from "@/lib/keybindings";

// ── Auto-update helper ────────────────────────────────────────────────────────

const AUTO_UPDATE_KEY = "toorker-auto-update";

function isAutoUpdateEnabled(): boolean {
  try {
    return localStorage.getItem(AUTO_UPDATE_KEY) !== "false";
  } catch {
    return true;
  }
}

export const Layout = () => {
  const { activeToolId, setActiveToolId, setPrefillUrl, setUpdateAvailable } =
    useAppStore();

  useEffect(() => {
    const unlisten = listen<{
      toolId: string | null;
      prefillUrl?: string;
    }>("palette-tool-selected", async (event) => {
      setActiveToolId(event.payload.toolId);
      if (event.payload.prefillUrl) {
        setPrefillUrl(event.payload.prefillUrl);
      }
      const mainWindow = getCurrentWindow();
      await mainWindow.show();
      await mainWindow.setFocus();
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [setActiveToolId, setPrefillUrl]);

  // ── Keyboard shortcuts (dynamic) ─────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Settings
      if (matchesKeybinding(e, getKeybinding("settings"))) {
        e.preventDefault();
        setActiveToolId(SETTINGS_ID);
        return;
      }

      // Tools 1-9
      for (let i = 1; i <= 9; i++) {
        if (matchesKeybinding(e, getKeybinding(`tool-${i}`))) {
          const toolIndex = i - 1;
          if (toolIndex < tools.length) {
            e.preventDefault();
            setActiveToolId(tools[toolIndex]!.id);
            return;
          }
        }
      }
    };

    const handleKeybindingsChanged = () => {
      // Force re-evaluation when keybindings change
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keybindings-changed", handleKeybindingsChanged);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keybindings-changed", handleKeybindingsChanged);
    };
  }, [setActiveToolId]);

  // ── Auto-update on launch ────────────────────────────────────

  useEffect(() => {
    if (!isAutoUpdateEnabled()) return;

    const timer = setTimeout(async () => {
      try {
        const update = await check();
        if (update) {
          setUpdateAvailable(true, update.version);
        }
      } catch {
        // Silently ignore — updater may not be configured yet
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [setUpdateAvailable]);

  // ── Resolve active view ──────────────────────────────────────

  const isSettings = activeToolId === SETTINGS_ID;
  const activeTool =
    activeToolId && !isSettings ? getToolById(activeToolId) : null;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          {isSettings ? (
            <div className="flex h-full flex-col animate-fade-in">
              <header className="flex h-12 shrink-0 items-center border-b px-5">
                <h1 className="text-[13px] font-semibold text-foreground">
                  Settings
                </h1>
              </header>
              <div className="flex-1 overflow-y-auto p-5">
                <div className="mx-auto max-w-2xl">
                  <Settings />
                </div>
              </div>
            </div>
          ) : activeTool ? (
            <div className="flex h-full flex-col animate-fade-in">
              <header className="flex h-12 shrink-0 items-center border-b px-5">
                <h1 className="text-[13px] font-semibold text-foreground">
                  {activeTool.name}
                </h1>
              </header>
              <div className="flex-1 overflow-y-auto p-5">
                <div className="mx-auto max-w-5xl">
                  <activeTool.component />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-5">
              <div className="mx-auto max-w-5xl">
                <Home />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
