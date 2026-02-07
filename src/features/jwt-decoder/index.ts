import { JwtDecoder } from "./jwt-decoder";
import type { ToolDefinition } from "@/types/tool";

export const jwtDecoderTool: ToolDefinition = {
  id: "jwt-decoder",
  name: "JWT Decoder",
  description: "Decode and inspect JSON Web Tokens",
  icon: "KeyRound",
  category: "encoders",
  keywords: ["jwt", "token", "decode", "json", "web", "auth", "bearer"],
  component: JwtDecoder,
};
