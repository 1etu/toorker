import { TextDiff } from "./text-diff";
import type { ToolDefinition } from "@/types/tool";

export const textDiffTool: ToolDefinition = {
  id: "text-diff",
  name: "Text Diff",
  description: "Compare two texts and highlight differences",
  icon: "GitCompareArrows",
  category: "text",
  component: TextDiff,
  keywords: ["diff", "compare", "text", "difference", "merge"],
};
