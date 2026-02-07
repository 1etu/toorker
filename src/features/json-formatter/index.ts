import { JsonFormatter } from "./json-formatter";
import type { ToolDefinition } from "@/types/tool";

export const jsonFormatterTool: ToolDefinition = {
  id: "json-formatter",
  name: "JSON Formatter",
  description: "Format, minify, and validate JSON data",
  icon: "Braces",
  category: "formatters",
  keywords: ["json", "format", "pretty", "minify", "validate", "parse"],
  component: JsonFormatter,
};
