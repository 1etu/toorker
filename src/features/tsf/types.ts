export interface TsfAction {
  id: string;
  type: "navigate" | "port-action" | "command" | "recent" | "smart";
  label: string;
  description: string;
  icon: string;
  keywords: string[];
  section: string;
  shortcut?: string;
  result?: string;
  execute: () => void | Promise<void>;
}

export interface TsfSection {
  title: string;
  actions: TsfAction[];
}
