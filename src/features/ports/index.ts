import { Ports } from "./ports";
import type { ToolDefinition } from "@/types/tool";

export const portsTool: ToolDefinition = {
  id: "ports",
  name: "Ports",
  description: "Monitor listening ports and manage services",
  icon: "Radio",
  category: "network",
  keywords: ["port", "network", "listen", "service", "tcp", "udp", "kill"],
  component: Ports,
};
