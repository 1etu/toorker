import { Base64 } from "./base64";
import type { ToolDefinition } from "@/types/tool";

export const base64Tool: ToolDefinition = {
  id: "base64",
  name: "Base64",
  description: "Encode and decode Base64 text",
  icon: "FileCode",
  category: "encoders",
  keywords: ["base64", "encode", "decode", "text", "binary"],
  component: Base64,
};
