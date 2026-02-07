import { CronParser } from "./cron-parser";
import type { ToolDefinition } from "@/types/tool";

export const cronParserTool: ToolDefinition = {
  id: "cron-parser",
  name: "Cron Parser",
  description: "Parse cron expressions to human-readable format",
  icon: "Timer",
  category: "converters",
  component: CronParser,
  keywords: ["cron", "schedule", "timer", "crontab", "parse"],
};
