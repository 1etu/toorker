import { UuidGenerator } from "./uuid-generator";
import type { ToolDefinition } from "@/types/tool";

export const uuidGeneratorTool: ToolDefinition = {
  id: "uuid-generator",
  name: "UUID Generator",
  description: "Generate random UUIDs (v4)",
  icon: "Fingerprint",
  category: "generators",
  keywords: ["uuid", "guid", "random", "generate", "id", "unique"],
  component: UuidGenerator,
};
