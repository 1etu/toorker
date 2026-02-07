import { invoke } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { tools } from "@/lib/tool-registry";
import type { TsfAction } from "./types";

interface PortEntry {
  port: number;
  protocol: string;
  pid: number;
  process_name: string;
  executable_path: string | null;
}

const TOOL_ACTIONS: TsfAction[] = [
  {
    id: "nav-home",
    type: "navigate",
    label: "Home",
    description: "Back to tool overview",
    icon: "Home",
    keywords: ["home", "dashboard", "overview", "all"],
    section: "Navigation",
    execute: () => navigateToTool(null),
  },
  ...tools.map((tool, idx) => ({
    id: `nav-${tool.id}`,
    type: "navigate" as const,
    label: tool.name,
    description: tool.description,
    icon: tool.icon,
    keywords: tool.keywords ?? [tool.name.toLowerCase()],
    section: "Tools",
    shortcut: idx < 9 ? `Ctrl+${idx + 1}` : undefined,
    execute: () => navigateToTool(tool.id),
  })),
];


function buildPortActions(ports: PortEntry[]): TsfAction[] {
  const actions: TsfAction[] = [];

  for (const entry of ports) {
    actions.push({
      id: `kill-port-${entry.port}`,
      type: "port-action",
      label: `Kill port ${entry.port}`,
      description: `${entry.process_name} (PID ${entry.pid})`,
      icon: "Trash2",
      keywords: [
        "kill",
        "stop",
        "terminate",
        entry.process_name.toLowerCase(),
        String(entry.port),
        String(entry.pid),
      ],
      section: "Active Ports",
      execute: async () => {
        await invoke("kill_by_port", { port: entry.port });
      },
    });

    actions.push({
      id: `open-api-${entry.port}`,
      type: "command",
      label: `Test localhost:${entry.port}`,
      description: `Open in API Tester — ${entry.process_name}`,
      icon: "Send",
      keywords: [
        "api",
        "test",
        "http",
        entry.process_name.toLowerCase(),
        String(entry.port),
      ],
      section: "Active Ports",
      execute: () =>
        navigateToTool("api-tester", {
          prefillUrl: `http://localhost:${entry.port}`,
        }),
    });

    actions.push({
      id: `copy-url-${entry.port}`,
      type: "command",
      label: `Copy localhost:${entry.port}`,
      description: `Copy URL to clipboard — ${entry.process_name}`,
      icon: "Copy",
      keywords: ["copy", "url", "localhost", String(entry.port)],
      section: "Active Ports",
      execute: async () => {
        await navigator.clipboard.writeText(
          `http://localhost:${entry.port}`,
        );
      },
    });
  }

  return actions;
}

export async function gatherActions(
  recentActions: TsfAction[],
): Promise<TsfAction[]> {
  let portActions: TsfAction[] = [];

  try {
    const ports = await invoke<PortEntry[]>("scan_all_listening_ports");
    portActions = buildPortActions(ports);
  } catch {
    // silent fail?
  }

  return [...TOOL_ACTIONS, ...portActions, ...recentActions];
}


async function navigateToTool(
  toolId: string | null,
  payload?: Record<string, string>,
) {
  await emit("palette-tool-selected", { toolId, ...payload });

  const mainWin = await WebviewWindow.getByLabel("main");
  if (mainWin) {
    await mainWin.show();
    await mainWin.setFocus();
  }
}
