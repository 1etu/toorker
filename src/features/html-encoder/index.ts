import { HtmlEncoder } from "./html-encoder";
import type { ToolDefinition } from "@/types/tool";

export const htmlEncoderTool: ToolDefinition = {
  id: "html-encoder",
  name: "HTML Encoder",
  description: "Encode and decode HTML entities",
  icon: "Code",
  category: "encoders",
  component: HtmlEncoder,
  keywords: ["html", "entity", "encode", "decode", "escape", "unescape"],
};
