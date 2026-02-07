import { DataConverter } from "./data-converter";
import type { ToolDefinition } from "@/types/tool";

export const dataConverterTool: ToolDefinition = {
  id: "data-converter",
  name: "YAML / JSON / TOML",
  description: "Convert between YAML, JSON, and TOML formats",
  icon: "ArrowLeftRight",
  category: "converters",
  component: DataConverter,
  keywords: [
    "yaml",
    "json",
    "toml",
    "convert",
    "converter",
    "transform",
    "config",
    "configuration",
    "data",
    "format",
  ],
};
