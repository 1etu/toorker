import { NumberBase } from "./number-base";
import type { ToolDefinition } from "@/types/tool";

export const numberBaseTool: ToolDefinition = {
  id: "number-base",
  name: "Number Base",
  description: "Convert numbers between decimal, hex, octal, binary",
  icon: "Binary",
  category: "converters",
  component: NumberBase,
  keywords: ["number", "base", "hex", "decimal", "binary", "octal", "convert"],
};
