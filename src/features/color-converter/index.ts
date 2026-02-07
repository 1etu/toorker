import { ColorConverter } from "./color-converter";
import type { ToolDefinition } from "@/types/tool";

export const colorConverterTool: ToolDefinition = {
  id: "color-converter",
  name: "Color Converter",
  description: "Convert colors between HEX, RGB, and HSL",
  icon: "Palette",
  category: "converters",
  component: ColorConverter,
  keywords: ["color", "hex", "rgb", "hsl", "convert", "palette", "picker"],
};
