import { PasswordGenerator } from "./password-generator";
import type { ToolDefinition } from "@/types/tool";

export const passwordGeneratorTool: ToolDefinition = {
  id: "password-generator",
  name: "Password",
  description: "Generate secure random passwords",
  icon: "Lock",
  category: "generators",
  component: PasswordGenerator,
  keywords: ["password", "generate", "random", "secure", "strong"],
};
