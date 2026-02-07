import { UrlEncoder } from "./url-encoder";
import type { ToolDefinition } from "@/types/tool";

export const urlEncoderTool: ToolDefinition = {
  id: "url-encoder",
  name: "URL Encoder",
  description: "Encode and decode URL components",
  icon: "Link",
  category: "encoders",
  keywords: ["url", "encode", "decode", "percent", "uri", "component"],
  component: UrlEncoder,
};
