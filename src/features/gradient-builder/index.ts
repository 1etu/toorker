import { GradientBuilder } from "./gradient-builder";
import type { ToolDefinition } from "@/types/tool";

export const gradientBuilderTool: ToolDefinition = {
  id: "gradient-builder",
  name: "Gradient Builder",
  description: "Create beautiful gradients with live preview and code export",
  icon: "Palette",
  category: "generators",
  component: GradientBuilder,
  keywords: [
    "gradient",
    "color",
    "css",
    "linear",
    "radial",
    "conic",
    "background",
    "design",
    "tailwind",
  ],
};

export { GradientBuilder };
