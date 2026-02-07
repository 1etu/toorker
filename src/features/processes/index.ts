import { Processes } from "./processes";
import type { ToolDefinition } from "@/types/tool";

export const processesTool: ToolDefinition = {
  id: "processes",
  name: "Processes",
  description: "Monitor running processes and memory usage",
  icon: "Activity",
  category: "system",
  keywords: ["process", "pid", "kill", "memory", "task", "manager"],
  component: Processes,
};
