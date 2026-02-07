import { LoremIpsum } from "./lorem-ipsum";
import type { ToolDefinition } from "@/types/tool";

export const loremIpsumTool: ToolDefinition = {
  id: "lorem-ipsum",
  name: "Lorem Ipsum",
  description: "Generate placeholder text",
  icon: "TextCursorInput",
  category: "generators",
  component: LoremIpsum,
  keywords: ["lorem", "ipsum", "placeholder", "text", "dummy"],
};
