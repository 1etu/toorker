import { useState, useEffect, useCallback, useRef } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import {
  RefreshCw,
  Check,
  Download,
  RotateCcw,
  AlertCircle,
  ArrowUpCircle,
  Shield,
  Info,
  Keyboard,
  X,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/use-app-store";
import {
  DEFAULT_KEYBINDINGS,
  getStoredKeybindings,
  saveKeybinding,
  type KeyBinding,
} from "@/lib/keybindings";

type UpdateStatus =
  | "idle"
  | "checking"
  | "up-to-date"
  | "available"
  | "downloading"
  | "ready"
  | "error";

// ── Helpers ────────────────────────────────────────────────────────────────────

const AUTO_UPDATE_KEY = "toorker-auto-update";

function getAutoUpdatePref(): boolean {
  try {
    return localStorage.getItem(AUTO_UPDATE_KEY) !== "false";
  } catch {
    return true;
  }
}

function setAutoUpdatePref(enabled: boolean) {
  try {
    localStorage.setItem(AUTO_UPDATE_KEY, String(enabled));
  } catch {
    /* noop */
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// ── Component ──────────────────────────────────────────────────────────────────

export const Settings = () => {
  const { setUpdateAvailable } = useAppStore();

  const [version, setVersion] = useState("...");
  const [autoUpdate, setAutoUpdate] = useState(getAutoUpdatePref);

  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [updateInfo, setUpdateInfo] = useState<{
    version: string;
    body: string;
    date: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [downloaded, setDownloaded] = useState(0);
  const [totalSize, setTotalSize] = useState(0);

  const updateRef = useRef<Update | null>(null);

  // ── Keyboard shortcuts ───────────────────────────────────────

  const [keybindings, setKeybindings] = useState<
    (KeyBinding & { currentKey: string })[]
  >(() => {
    const stored = getStoredKeybindings();
    return DEFAULT_KEYBINDINGS.map((kb) => ({
      ...kb,
      currentKey: stored[kb.id] || kb.defaultKey,
    }));
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);

  // ── Load version ─────────────────────────────────────────────

  useEffect(() => {
    getVersion()
      .then(setVersion)
      .catch(() => setVersion("0.1.0"));
  }, []);

  // ── Check for updates ────────────────────────────────────────

  const checkForUpdates = useCallback(async () => {
    setStatus("checking");
    setErrorMsg("");
    setUpdateInfo(null);

    try {
      const update = await check();

      if (update) {
        updateRef.current = update;
        setUpdateInfo({
          version: update.version,
          body: update.body ?? "",
          date: update.date ?? "",
        });
        setStatus("available");
        setUpdateAvailable(true, update.version);
      } else {
        setStatus("up-to-date");
        setUpdateAvailable(false);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to check for updates";

      if (
        msg.includes("pubkey") ||
        msg.includes("endpoint") ||
        msg.includes("network") ||
        msg.includes("fetch")
      ) {
        setErrorMsg(
          "Updater not configured. Set the public key and endpoints in tauri.conf.json to enable updates.",
        );
      } else {
        setErrorMsg(msg);
      }
      setStatus("error");
    }
  }, [setUpdateAvailable]);

  // ── Download & install ───────────────────────────────────────

  const downloadAndInstall = useCallback(async () => {
    const update = updateRef.current;
    if (!update) return;

    setStatus("downloading");
    setDownloaded(0);
    setTotalSize(0);

    try {
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            setTotalSize(event.data.contentLength ?? 0);
            break;
          case "Progress":
            setDownloaded((prev) => prev + event.data.chunkLength);
            break;
          case "Finished":
            break;
        }
      });

      setStatus("ready");
      setUpdateAvailable(false);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to install update",
      );
      setStatus("error");
    }
  }, [setUpdateAvailable]);

  // ── Relaunch ─────────────────────────────────────────────────

  const handleRelaunch = useCallback(async () => {
    try {
      await relaunch();
    } catch {
      setErrorMsg("Failed to restart. Please close and reopen the app.");
      setStatus("error");
    }
  }, []);

  // ── Auto-update toggle ──────────────────────────────────────

  const toggleAutoUpdate = useCallback(() => {
    setAutoUpdate((prev) => {
      const next = !prev;
      setAutoUpdatePref(next);
      return next;
    });
  }, []);

  // ── Keyboard shortcut editing ───────────────────────────────

  const startEditing = (id: string) => {
    setEditingId(id);
    setRecordedKeys([]);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setRecordedKeys([]);
  };

  const saveBinding = (id: string, keys: string) => {
    const updated = keybindings.map((kb) =>
      kb.id === id ? { ...kb, currentKey: keys } : kb,
    );
    setKeybindings(updated);
    saveKeybinding(id, keys);

    setEditingId(null);
    setRecordedKeys([]);
  };

  const resetBinding = (id: string) => {
    const binding = keybindings.find((kb) => kb.id === id);
    if (!binding) return;
    saveBinding(id, binding.defaultKey);
  };

  useEffect(() => {
    if (editingId === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const keys: string[] = [];
      if (e.ctrlKey || e.metaKey) keys.push("Ctrl");
      if (e.shiftKey) keys.push("Shift");
      if (e.altKey) keys.push("Alt");

      const key = e.key;
      if (
        key !== "Control" &&
        key !== "Shift" &&
        key !== "Alt" &&
        key !== "Meta"
      ) {
        if (key === "Escape") {
          cancelEditing();
          return;
        }
        keys.push(key.length === 1 ? key.toUpperCase() : key);
        const combo = keys.join("+");
        saveBinding(editingId, combo);
      } else {
        setRecordedKeys(keys);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [editingId]);

  // ── Progress percentage ──────────────────────────────────────

  const progress =
    totalSize > 0 ? Math.min((downloaded / totalSize) * 100, 100) : 0;

  return (
    <div className="space-y-8">
      {/* ── About ─────────────────────────────────────────────── */}

      <Section title="About" icon={Info}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[15px] font-semibold text-foreground">
                Toorker
              </span>
              <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                v{version}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground/60">
              Developer toolkit — by developers, for developers.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1">
            <Shield className="h-3 w-3 text-emerald-500" />
            <span className="text-[10px] font-medium text-emerald-500">
              Signed
            </span>
          </div>
        </div>
      </Section>

      {/* ── Updates ────────────────────────────────────────────── */}

      <Section title="Updates" icon={ArrowUpCircle}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-medium text-foreground">
              Automatic updates
            </div>
            <div className="text-[11px] text-muted-foreground/50">
              Check and install updates when the app launches
            </div>
          </div>
          <button
            onClick={toggleAutoUpdate}
            className={cn(
              "relative h-[22px] w-[40px] rounded-full transition-colors duration-200",
              autoUpdate ? "bg-foreground" : "bg-secondary",
            )}
          >
            <div
              className={cn(
                "absolute top-[3px] h-[16px] w-[16px] rounded-full bg-background shadow-sm transition-transform duration-200",
                autoUpdate ? "translate-x-[21px]" : "translate-x-[3px]",
              )}
            />
          </button>
        </div>

        <div className="my-3 h-px bg-border" />

        <button
          onClick={checkForUpdates}
          disabled={status === "checking" || status === "downloading"}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors",
            status === "checking" || status === "downloading"
              ? "cursor-not-allowed bg-secondary/50 text-muted-foreground/40"
              : "bg-secondary text-foreground hover:bg-secondary/80",
          )}
        >
          <RefreshCw
            className={cn(
              "h-3.5 w-3.5",
              status === "checking" && "animate-spin",
            )}
          />
          {status === "checking" ? "Checking..." : "Check for updates"}
        </button>

        {status === "up-to-date" && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/5 px-3 py-2.5">
            <Check className="h-4 w-4 text-emerald-500" />
            <div>
              <div className="text-[12px] font-medium text-emerald-500">
                You're up to date
              </div>
              <div className="text-[11px] text-muted-foreground/40">
                Toorker v{version} is the latest version
              </div>
            </div>
          </div>
        )}

        {status === "available" && updateInfo && (
          <div className="mt-3 space-y-3">
            <div className="rounded-lg border bg-card px-3 py-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="h-4 w-4 text-foreground" />
                  <span className="text-[12px] font-semibold text-foreground">
                    v{updateInfo.version} available
                  </span>
                </div>
                {updateInfo.date && (
                  <span className="text-[10px] text-muted-foreground/40">
                    {new Date(updateInfo.date).toLocaleDateString()}
                  </span>
                )}
              </div>
              {updateInfo.body && (
                <div className="mt-2 border-t pt-2">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
                    What's new
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-muted-foreground/70">
                    {updateInfo.body}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={downloadAndInstall}
              className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-[12px] font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              <Download className="h-3.5 w-3.5" />
              Download & Install
            </button>
          </div>
        )}

        {status === "downloading" && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="h-3.5 w-3.5 animate-bounce text-foreground" />
                <span className="text-[12px] font-medium text-foreground">
                  Downloading...
                </span>
              </div>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground/50">
                {totalSize > 0
                  ? `${formatBytes(downloaded)} / ${formatBytes(totalSize)}`
                  : formatBytes(downloaded)}
              </span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {totalSize > 0 && (
              <div className="text-right font-mono text-[10px] tabular-nums text-muted-foreground/30">
                {Math.round(progress)}%
              </div>
            )}
          </div>
        )}

        {status === "ready" && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/5 px-3 py-2.5">
              <Check className="h-4 w-4 text-emerald-500" />
              <div>
                <div className="text-[12px] font-medium text-emerald-500">
                  Update installed
                </div>
                <div className="text-[11px] text-muted-foreground/40">
                  Restart Toorker to apply the update
                </div>
              </div>
            </div>

            <button
              onClick={handleRelaunch}
              className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-[12px] font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restart Now
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/5 px-3 py-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <div className="text-[12px] font-medium text-destructive">
                Update error
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground/50">
                {errorMsg}
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ── Keyboard Shortcuts ──────────────────────────────────── */}

      <Section title="Keyboard Shortcuts" icon={Keyboard}>
        <div className="space-y-2">
          {keybindings.map((binding) => {
            const isEditing = editingId === binding.id;
            const isModified = binding.currentKey !== binding.defaultKey;

            return (
              <div
                key={binding.id}
                className="flex items-center justify-between rounded-lg border bg-secondary/20 px-3 py-2"
              >
                <div className="flex-1">
                  <div className="text-[12px] font-medium text-foreground">
                    {binding.label}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <kbd className="min-w-[80px] rounded-md border border-foreground/20 bg-foreground/5 px-2 py-1 text-center font-mono text-[11px] font-medium text-foreground">
                        {recordedKeys.length > 0
                          ? recordedKeys.join("+") + "+"
                          : "Press keys..."}
                      </kbd>
                      <button
                        onClick={cancelEditing}
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Cancel"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(binding.id)}
                        className={cn(
                          "min-w-[80px] rounded-md border px-2 py-1 text-center font-mono text-[11px] font-medium transition-colors hover:bg-secondary",
                          isModified
                            ? "border-foreground/20 bg-foreground/5 text-foreground"
                            : "bg-secondary/50 text-muted-foreground",
                        )}
                      >
                        {binding.currentKey}
                      </button>
                      {isModified && (
                        <button
                          onClick={() => resetBinding(binding.id)}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          title="Restore default"
                        >
                          <Undo2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {editingId && (
          <div className="mt-3 rounded-lg bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground/60">
            Press any key combination. Press Escape to cancel.
          </div>
        )}
      </Section>
    </div>
  );
};

// ── Section wrapper ────────────────────────────────────────────────────────────

const Section = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <section>
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground/30" />
      <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/40">
        {title}
      </h2>
    </div>
    <div className="rounded-xl border bg-card/50 p-4">{children}</div>
  </section>
);
