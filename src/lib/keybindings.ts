export const KEYBINDINGS_KEY = "toorker-keybindings";

export interface KeyBinding {
  id: string;
  label: string;
  defaultKey: string;
}

export const DEFAULT_KEYBINDINGS: KeyBinding[] = [
  { id: "palette", label: "Command Palette", defaultKey: "Ctrl+K" },
  { id: "settings", label: "Settings", defaultKey: "Ctrl+," },
  { id: "tool-1", label: "Tool 1", defaultKey: "Ctrl+1" },
  { id: "tool-2", label: "Tool 2", defaultKey: "Ctrl+2" },
  { id: "tool-3", label: "Tool 3", defaultKey: "Ctrl+3" },
  { id: "tool-4", label: "Tool 4", defaultKey: "Ctrl+4" },
  { id: "tool-5", label: "Tool 5", defaultKey: "Ctrl+5" },
  { id: "tool-6", label: "Tool 6", defaultKey: "Ctrl+6" },
  { id: "tool-7", label: "Tool 7", defaultKey: "Ctrl+7" },
  { id: "tool-8", label: "Tool 8", defaultKey: "Ctrl+8" },
  { id: "tool-9", label: "Tool 9", defaultKey: "Ctrl+9" },
];

export function getStoredKeybindings(): Record<string, string> {
  try {
    const stored = localStorage.getItem(KEYBINDINGS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function saveKeybinding(id: string, key: string) {
  const stored = getStoredKeybindings();
  stored[id] = key;
  try {
    localStorage.setItem(KEYBINDINGS_KEY, JSON.stringify(stored));
    window.dispatchEvent(new CustomEvent("keybindings-changed"));
  } catch {
    /* noop */
  }
}

export function getKeybinding(id: string): string {
  const stored = getStoredKeybindings();
  const defaultBinding = DEFAULT_KEYBINDINGS.find((kb) => kb.id === id);
  return stored[id] || defaultBinding?.defaultKey || "";
}

export function parseKeybinding(combo: string): {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
} {
  const parts = combo.split("+");
  return {
    ctrl: parts.includes("Ctrl"),
    shift: parts.includes("Shift"),
    alt: parts.includes("Alt"),
    key: parts[parts.length - 1] || "",
  };
}

export function matchesKeybinding(e: KeyboardEvent, combo: string): boolean {
  const parsed = parseKeybinding(combo);
  const eventKey = e.key.length === 1 ? e.key.toUpperCase() : e.key;

  return (
    (e.ctrlKey || e.metaKey) === parsed.ctrl &&
    e.shiftKey === parsed.shift &&
    e.altKey === parsed.alt &&
    eventKey === parsed.key
  );
}
