import { RegexTester } from "./regex-tester";
import type { ToolDefinition } from "@/types/tool";

export const regexTesterTool: ToolDefinition = {
  id: "regex-tester",
  name: "Regex Tester",
  description: "Test regular expressions with live highlighting",
  icon: "Regex",
  category: "text",
  component: RegexTester,
  keywords: ["regex", "regexp", "regular expression", "pattern", "match", "test"],
};
