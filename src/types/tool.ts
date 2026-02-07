export type ToolCategory =
  | "network"
  | "system"
  | "converters"
  | "formatters"
  | "encoders"
  | "generators"
  | "text";

export interface CategoryDefinition {
  id: ToolCategory;
  label: string;
  icon: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ToolCategory;
  component: React.ComponentType;
  keywords?: string[];
}
