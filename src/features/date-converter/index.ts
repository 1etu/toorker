import { DateConverter } from "./date-converter";
import type { ToolDefinition } from "@/types/tool";

export const dateConverterTool: ToolDefinition = {
  id: "date-converter",
  name: "Date Converter",
  description: "Convert between Unix timestamps and human dates",
  icon: "Calendar",
  category: "converters",
  component: DateConverter,
  keywords: ["date", "time", "unix", "timestamp", "epoch", "iso", "utc", "convert"],
};
