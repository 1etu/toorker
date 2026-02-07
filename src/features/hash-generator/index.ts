import { HashGenerator } from "./hash-generator";
import type { ToolDefinition } from "@/types/tool";

export const hashGeneratorTool: ToolDefinition = {
  id: "hash-generator",
  name: "Hash Generator",
  description: "Calculate SHA-1, SHA-256, SHA-384, SHA-512 hashes",
  icon: "ShieldCheck",
  category: "generators",
  keywords: ["hash", "sha", "sha256", "sha512", "checksum", "digest"],
  component: HashGenerator,
};
