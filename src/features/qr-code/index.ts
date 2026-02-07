import { QrCode } from "./qr-code";
import type { ToolDefinition } from "@/types/tool";

export const qrCodeTool: ToolDefinition = {
  id: "qr-code",
  name: "QR Code Generator",
  description: "Generate QR codes from text, URLs, WiFi, email & phone",
  icon: "QrCode",
  category: "generators",
  component: QrCode,
  keywords: ["qr", "qrcode", "barcode", "scan", "url", "wifi", "link"],
};
