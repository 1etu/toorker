import type {
  ToolDefinition,
  ToolCategory,
  CategoryDefinition,
} from "@/types/tool";
import { portsTool } from "@/features/ports";
import { processesTool } from "@/features/processes";
import { apiTesterTool } from "@/features/api-tester";
import { jsonFormatterTool } from "@/features/json-formatter";
import { markdownPreviewTool } from "@/features/markdown-preview";
import { base64Tool } from "@/features/base64";
import { urlEncoderTool } from "@/features/url-encoder";
import { htmlEncoderTool } from "@/features/html-encoder";
import { jwtDecoderTool } from "@/features/jwt-decoder";
import { uuidGeneratorTool } from "@/features/uuid-generator";
import { hashGeneratorTool } from "@/features/hash-generator";
import { passwordGeneratorTool } from "@/features/password-generator";
import { loremIpsumTool } from "@/features/lorem-ipsum";
import { numberBaseTool } from "@/features/number-base";
import { dateConverterTool } from "@/features/date-converter";
import { colorConverterTool } from "@/features/color-converter";
import { cronParserTool } from "@/features/cron-parser";
import { regexTesterTool } from "@/features/regex-tester";
import { textDiffTool } from "@/features/text-diff";
import { gradientBuilderTool } from "@/features/gradient-builder";
import { qrCodeTool } from "@/features/qr-code";
import { dataConverterTool } from "@/features/data-converter";

export const CATEGORIES: CategoryDefinition[] = [
  { id: "network", label: "Network", icon: "Globe" },
  { id: "system", label: "System", icon: "Monitor" },
  { id: "converters", label: "Converters", icon: "ArrowLeftRight" },
  { id: "formatters", label: "Formatters", icon: "Braces" },
  { id: "encoders", label: "Encoders / Decoders", icon: "Lock" },
  { id: "generators", label: "Generators", icon: "Sparkles" },
  { id: "text", label: "Text", icon: "Type" },
];


export const tools: ToolDefinition[] = [
  portsTool,
  apiTesterTool,
  processesTool,
  numberBaseTool,
  dateConverterTool,
  colorConverterTool,
  cronParserTool,
  jsonFormatterTool,
  markdownPreviewTool,
  base64Tool,
  urlEncoderTool,
  htmlEncoderTool,
  jwtDecoderTool,
  uuidGeneratorTool,
  hashGeneratorTool,
  passwordGeneratorTool,
  loremIpsumTool,
  qrCodeTool,
  gradientBuilderTool,
  regexTesterTool,
  textDiffTool,
  dataConverterTool,
];

export const getToolById = (id: string): ToolDefinition | undefined =>
  tools.find((t) => t.id === id);

export const getToolsByCategory = () => {
  const grouped = new Map<ToolCategory, ToolDefinition[]>();
  for (const cat of CATEGORIES) grouped.set(cat.id, []);
  for (const tool of tools) grouped.get(tool.category)?.push(tool);
  return grouped;
};

export const getCategoryById = (id: ToolCategory) =>
  CATEGORIES.find((c) => c.id === id);
