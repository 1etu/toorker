import { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { useAppStore } from "@/stores/use-app-store";
import { tools, CATEGORIES, getToolsByCategory } from "@/lib/tool-registry";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { getKeybinding } from "@/lib/keybindings";

export const SETTINGS_ID = "__settings__";

function formatShortcut(combo: string): string {
  return combo
    .replace("Ctrl", "⌘")
    .replace("Shift", "⇧")
    .replace("Alt", "⌥");
}

export const Sidebar = () => {
  const { activeToolId, setActiveToolId, updateAvailable, updateVersion } =
    useAppStore();
  const toolsByCategory = getToolsByCategory();

  const [paletteKey, setPaletteKey] = useState(() =>
    formatShortcut(getKeybinding("palette")),
  );
  const [settingsKey, setSettingsKey] = useState(() =>
    formatShortcut(getKeybinding("settings")),
  );

  useEffect(() => {
    const handleKeybindingsChanged = () => {
      setPaletteKey(formatShortcut(getKeybinding("palette")));
      setSettingsKey(formatShortcut(getKeybinding("settings")));
    };

    window.addEventListener("keybindings-changed", handleKeybindingsChanged);
    return () =>
      window.removeEventListener("keybindings-changed", handleKeybindingsChanged);
  }, []);

  return (
    <div className="flex h-full w-[220px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="space-y-1 p-3">
        <button
          onClick={() => setActiveToolId(null)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-[13px] transition-colors",
            activeToolId === null
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
          )}
        >
          <Icons.Home className="h-4 w-4 shrink-0" />
          <span className="font-medium">Home</span>
        </button>

        <button className="flex w-full items-center gap-2.5 rounded-md bg-secondary/60 px-2.5 py-[7px] text-left text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Icons.Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">Search...</span>
          <Kbd>{paletteKey}</Kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        {CATEGORIES.map((cat, catIdx) => {
          const catTools = toolsByCategory.get(cat.id) ?? [];
          if (catTools.length === 0) return null;

          const CatIcon = (Icons as any)[cat.icon] ?? Icons.Folder;

          return (
            <div key={cat.id} className={cn("mb-1", catIdx > 0 && "mt-3")}>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5">
                <CatIcon className="h-3 w-3 text-muted-foreground/25" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/35">
                  {cat.label}
                </span>
              </div>

              <div className="space-y-0.5">
                {catTools.map((tool) => {
                  const Icon =
                    (Icons as any)[tool.icon] ?? Icons.Box;
                  const isActive = activeToolId === tool.id;
                  const globalIdx = tools.indexOf(tool);
                  const hasShortcut =
                    globalIdx >= 0 && globalIdx < 9;

                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveToolId(tool.id)}
                      className={cn(
                        "group relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-[13px] transition-colors",
                        isActive
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 h-3.5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                      )}
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate font-medium">
                        {tool.name}
                      </span>
                      {hasShortcut && (
                        <Kbd
                          className={cn(
                            "opacity-0 transition-opacity group-hover:opacity-100",
                            isActive && "opacity-100",
                          )}
                        >
                          ⌘{globalIdx + 1}
                        </Kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}

      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={() => setActiveToolId(SETTINGS_ID)}
          className={cn(
            "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-[13px] transition-colors",
            activeToolId === SETTINGS_ID
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
          )}
        >
          <Icons.Settings
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-500",
              activeToolId === SETTINGS_ID && "rotate-90",
            )}
          />
          <span className="flex-1 font-medium">Settings</span>

          {updateAvailable && (
            <span className="flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5">
              <Icons.ArrowUpCircle className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-semibold text-primary">
                {updateVersion ?? "new"}
              </span>
            </span>
          )}

          {!updateAvailable && (
            <Kbd
              className={cn(
                "opacity-0 transition-opacity group-hover:opacity-100",
                activeToolId === SETTINGS_ID && "opacity-100",
              )}
            >
              {settingsKey}
            </Kbd>
          )}
        </button>

        <div className="mt-1 flex items-center gap-2 px-2.5 text-muted-foreground">
          <span className="text-[11px] font-medium">Toorker</span>
          <span className="text-[10px] text-muted-foreground/40">
            v0.1.0
          </span>
        </div>
      </div>
    </div>
  );
};
