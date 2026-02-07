import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Copy,
  Check,
  Download,
  RefreshCw,
  Link,
  Type,
  Wifi,
  Mail,
  Phone,
} from "lucide-react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/use-app-store";

type ErrorLevel = "L" | "M" | "Q" | "H";
type InputMode = "text" | "url" | "wifi" | "email" | "phone";

const ERROR_LEVELS: { value: ErrorLevel; label: string; desc: string }[] = [
  { value: "L", label: "L", desc: "~7% recovery" },
  { value: "M", label: "M", desc: "~15% recovery" },
  { value: "Q", label: "Q", desc: "~25% recovery" },
  { value: "H", label: "H", desc: "~30% recovery" },
];

const INPUT_MODES: { value: InputMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "text", label: "Text", icon: Type },
  { value: "url", label: "URL", icon: Link },
  { value: "wifi", label: "WiFi", icon: Wifi },
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Phone", icon: Phone },
];

export const QrCode = () => {
  const { prefillUrl, setPrefillUrl } = useAppStore();

  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");
  const [size, setSize] = useState(256);
  const [margin, setMargin] = useState(2);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [copied, setCopied] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  const [emailAddr, setEmailAddr] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefillUrl) {
      setText(prefillUrl);
      if (/^https?:\/\//i.test(prefillUrl)) {
        setInputMode("url");
      }
      setPrefillUrl(null);
    }
  }, [prefillUrl, setPrefillUrl]);

  const qrContent = useMemo(() => {
    switch (inputMode) {
      case "url":
      case "text":
        return text;
      case "wifi":
        if (!wifiSsid) return "";
        return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};H:${wifiHidden ? "true" : "false"};;`;
      case "email":
        if (!emailAddr) return "";
        const params = [];
        if (emailSubject) params.push(`subject=${encodeURIComponent(emailSubject)}`);
        if (emailBody) params.push(`body=${encodeURIComponent(emailBody)}`);
        return `mailto:${emailAddr}${params.length ? "?" + params.join("&") : ""}`;
      case "phone":
        return phoneNumber ? `tel:${phoneNumber}` : "";
      default:
        return text;
    }
  }, [inputMode, text, wifiSsid, wifiPassword, wifiEncryption, wifiHidden, emailAddr, emailSubject, emailBody, phoneNumber]);

  const generateQR = useCallback(async () => {
    if (!qrContent.trim()) {
      setDataUrl(null);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }

    try {
      const opts: QRCode.QRCodeToDataURLOptions = {
        errorCorrectionLevel: errorLevel,
        margin,
        width: size,
        color: { dark: fgColor, light: bgColor },
      };

      const url = await QRCode.toDataURL(qrContent, opts);
      setDataUrl(url);

      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, qrContent, {
          ...opts,
          width: Math.min(size, 400),
        });
      }
    } catch {
      setDataUrl(null);
    }
  }, [qrContent, errorLevel, size, margin, fgColor, bgColor]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  const handleCopy = async () => {
    if (!dataUrl) return;
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      await navigator.clipboard.writeText(dataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qrcode-${Date.now()}.png`;
    a.click();
  };

  const handleCopyContent = async () => {
    if (!qrContent) return;
    await navigator.clipboard.writeText(qrContent);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-md border bg-card p-0.5">
          {INPUT_MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.value}
                onClick={() => setInputMode(m.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-[3px] px-2.5 py-1 text-[11px] font-medium transition-colors",
                  inputMode === m.value
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3 w-3" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid flex-1 grid-cols-[1fr_auto] gap-4 overflow-hidden">
        <div className="flex flex-col gap-3 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Content
            </span>

            {inputMode === "text" || inputMode === "url" ? (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={inputMode === "url" ? "https://example.com" : "Enter text to encode..."}
                spellCheck={false}
                className="h-28 resize-none rounded-lg border bg-card p-3 font-mono text-[12px] leading-relaxed outline-none placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-ring"
              />
            ) : inputMode === "wifi" ? (
              <div className="space-y-2 rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2">
                  <label className="w-20 text-[11px] text-muted-foreground">SSID</label>
                  <input
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="Network name"
                    className="flex-1 rounded-md border bg-background px-2 py-1.5 text-[12px] outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-20 text-[11px] text-muted-foreground">Password</label>
                  <input
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="Password"
                    type="password"
                    className="flex-1 rounded-md border bg-background px-2 py-1.5 text-[12px] outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-20 text-[11px] text-muted-foreground">Encryption</label>
                  <div className="flex items-center rounded-md border bg-background p-0.5">
                    {(["WPA", "WEP", "nopass"] as const).map((enc) => (
                      <button
                        key={enc}
                        onClick={() => setWifiEncryption(enc)}
                        className={cn(
                          "rounded-[3px] px-2 py-1 text-[11px] font-medium transition-colors",
                          wifiEncryption === enc
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {enc === "nopass" ? "None" : enc}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="rounded"
                    />
                    Hidden
                  </label>
                </div>
              </div>
            ) : inputMode === "email" ? (
              <div className="space-y-2 rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2">
                  <label className="w-16 text-[11px] text-muted-foreground">To</label>
                  <input
                    value={emailAddr}
                    onChange={(e) => setEmailAddr(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 rounded-md border bg-background px-2 py-1.5 text-[12px] outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-16 text-[11px] text-muted-foreground">Subject</label>
                  <input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Subject line"
                    className="flex-1 rounded-md border bg-background px-2 py-1.5 text-[12px] outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-16 text-[11px] text-muted-foreground">Body</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Email body..."
                    rows={2}
                    className="flex-1 resize-none rounded-md border bg-background px-2 py-1.5 text-[12px] outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
                <label className="w-16 text-[11px] text-muted-foreground">Number</label>
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="flex-1 rounded-md border bg-background px-2 py-1.5 text-[12px] outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            )}
          </div>

          {qrContent && inputMode !== "text" && inputMode !== "url" && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground/60 font-mono truncate flex-1">
                {qrContent}
              </span>
              <button
                onClick={handleCopyContent}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Copy raw
              </button>
            </div>
          )}

          <div className="space-y-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Settings
            </span>

            <div className="flex items-center gap-2">
              <label className="w-28 text-[11px] text-muted-foreground">Error correction</label>
              <div className="flex items-center rounded-md border bg-card p-0.5">
                {ERROR_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setErrorLevel(level.value)}
                    title={level.desc}
                    className={cn(
                      "rounded-[3px] px-2.5 py-1 text-[11px] font-medium transition-colors",
                      errorLevel === level.value
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground/50">
                {ERROR_LEVELS.find((l) => l.value === errorLevel)?.desc}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-28 text-[11px] text-muted-foreground">Size</label>
              <input
                type="range"
                min={128}
                max={1024}
                step={64}
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="flex-1 accent-foreground"
              />
              <span className="w-16 text-right font-mono text-[11px] text-muted-foreground">
                {size}px
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-28 text-[11px] text-muted-foreground">Margin</label>
              <input
                type="range"
                min={0}
                max={8}
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value))}
                className="flex-1 accent-foreground"
              />
              <span className="w-16 text-right font-mono text-[11px] text-muted-foreground">
                {margin}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="w-28 text-[11px] text-muted-foreground">Foreground</label>
                <div className="flex items-center gap-1.5 rounded-md border bg-card px-2 py-1">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent"
                  />
                  <input
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-[72px] bg-transparent font-mono text-[11px] outline-none uppercase"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-muted-foreground">Background</label>
                <div className="flex items-center gap-1.5 rounded-md border bg-card px-2 py-1">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent"
                  />
                  <input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-[72px] bg-transparent font-mono text-[11px] outline-none uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-[320px] flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Preview
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={generateQR}
                className="flex h-7 items-center gap-1 rounded-md border px-2 text-[10px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <RefreshCw className="h-2.5 w-2.5" />
              </button>
              <button
                onClick={handleCopy}
                disabled={!dataUrl}
                className="flex h-7 items-center gap-1 rounded-md border px-2 text-[10px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
              >
                {copied ? (
                  <Check className="h-2.5 w-2.5 text-success" />
                ) : (
                  <Copy className="h-2.5 w-2.5" />
                )}
                Copy
              </button>
              <button
                onClick={handleDownload}
                disabled={!dataUrl}
                className="flex h-7 items-center gap-1 rounded-md border px-2 text-[10px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
              >
                <Download className="h-2.5 w-2.5" />
                PNG
              </button>
            </div>
          </div>

          <div
            className="flex flex-1 items-center justify-center rounded-lg border bg-card"
            style={{
              backgroundImage:
                "linear-gradient(45deg, hsl(var(--muted)/0.3) 25%, transparent 25%, transparent 75%, hsl(var(--muted)/0.3) 75%), linear-gradient(45deg, hsl(var(--muted)/0.3) 25%, transparent 25%, transparent 75%, hsl(var(--muted)/0.3) 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 8px 8px",
            }}
          >
            {qrContent.trim() ? (
              <canvas ref={canvasRef} className="max-w-full max-h-full" />
            ) : (
              <span className="text-[12px] text-muted-foreground/40">
                Enter content to generate QR code
              </span>
            )}
          </div>

          {dataUrl && (
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/40 tabular-nums">
              <span>{size}×{size}px</span>
              <span>Error: {errorLevel}</span>
              <span>{qrContent.length} chars</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
