import { ApiTester } from "./api-tester";
import type { ToolDefinition } from "@/types/tool";

export const apiTesterTool: ToolDefinition = {
  id: "api-tester",
  name: "API Tester",
  description: "Send HTTP requests and inspect responses",
  icon: "Send",
  category: "network",
  keywords: ["http", "request", "get", "post", "api", "fetch", "curl", "rest"],
  component: ApiTester,
};
