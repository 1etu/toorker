import { MarkdownPreview } from "./markdown-preview";
import type { ToolDefinition } from "@/types/tool";

export const markdownPreviewTool: ToolDefinition = {
  id: "markdown-preview",
  name: "Markdown",
  description: "Preview markdown with live rendering",
  icon: "FileText",
  category: "formatters",
  component: MarkdownPreview,
  keywords: ["markdown", "md", "preview", "render", "format"],
};
