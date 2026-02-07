import { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";

interface RGB {
  r: number;
  g: number;
  b: number;
}
interface HSL {
  h: number;
  s: number;
  l: number;
}

function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean) && !/^[0-9a-fA-F]{3}$/.test(clean))
    return null;
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

type InputMode = "hex" | "rgb" | "hsl";

export const ColorConverter = () => {
  const [hexInput, setHexInput] = useState("#3B82F6");
  const [rgbInput, setRgbInput] = useState({ r: "59", g: "130", b: "246" });
  const [hslInput, setHslInput] = useState({ h: "217", s: "91", l: "60" });
  const [activeMode, setActiveMode] = useState<InputMode>("hex");
  const [copied, setCopied] = useState<string | null>(null);

  const computed = useMemo(() => {
    if (activeMode === "hex") {
      const rgb = hexToRgb(hexInput);
      if (!rgb) return null;
      const hsl = rgbToHsl(rgb);
      return { hex: hexInput.toUpperCase().replace(/^#?/, "#"), rgb, hsl };
    }
    if (activeMode === "rgb") {
      const r = parseInt(rgbInput.r) || 0;
      const g = parseInt(rgbInput.g) || 0;
      const b = parseInt(rgbInput.b) || 0;
      if ([r, g, b].some((v) => v < 0 || v > 255)) return null;
      const rgb: RGB = { r, g, b };
      return { hex: rgbToHex(rgb), rgb, hsl: rgbToHsl(rgb) };
    }
    const h = parseInt(hslInput.h) || 0;
    const s = parseInt(hslInput.s) || 0;
    const l = parseInt(hslInput.l) || 0;
    if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100)
      return null;
    const hsl: HSL = { h, s, l };
    const rgb = hslToRgb(hsl);
    return { hex: rgbToHex(rgb), rgb, hsl };
  }, [activeMode, hexInput, rgbInput, hslInput]);

  const copyValue = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const hexStr = computed?.hex ?? "#000000";
  const rgbStr = computed
    ? `rgb(${computed.rgb.r}, ${computed.rgb.g}, ${computed.rgb.b})`
    : "rgb(0, 0, 0)";
  const hslStr = computed
    ? `hsl(${computed.hsl.h}, ${computed.hsl.s}%, ${computed.hsl.l}%)`
    : "hsl(0, 0%, 0%)";

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div
          className="h-20 w-20 shrink-0 rounded-lg border"
          style={{ backgroundColor: hexStr }}
        />
        <div className="flex-1 space-y-2">
          <div>
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
              HEX
            </div>
            <div className="flex items-center gap-1.5">
              <input
                value={activeMode === "hex" ? hexInput : hexStr}
                onChange={(e) => {
                  setActiveMode("hex");
                  setHexInput(e.target.value);
                }}
                onFocus={() => setActiveMode("hex")}
                spellCheck={false}
                className="h-8 flex-1 rounded-md border bg-card px-3 font-mono text-[13px] outline-none focus:ring-1 focus:ring-ring"
              />
              <CopyBtn
                label="hex"
                value={hexStr}
                copied={copied}
                onCopy={copyValue}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
              RGB
            </div>
            <div className="flex items-center gap-1.5">
              {(["r", "g", "b"] as const).map((ch) => (
                <input
                  key={ch}
                  value={
                    activeMode === "rgb"
                      ? rgbInput[ch]
                      : computed
                        ? String(computed.rgb[ch])
                        : "0"
                  }
                  onChange={(e) => {
                    setActiveMode("rgb");
                    setRgbInput((prev) => ({
                      ...prev,
                      [ch]: e.target.value,
                    }));
                  }}
                  onFocus={() => setActiveMode("rgb")}
                  placeholder={ch.toUpperCase()}
                  className="h-8 w-16 rounded-md border bg-card px-2 text-center font-mono text-[13px] outline-none focus:ring-1 focus:ring-ring"
                />
              ))}
              <div className="flex-1" />
              <CopyBtn
                label="rgb"
                value={rgbStr}
                copied={copied}
                onCopy={copyValue}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
              HSL
            </div>
            <div className="flex items-center gap-1.5">
              {(["h", "s", "l"] as const).map((ch) => (
                <input
                  key={ch}
                  value={
                    activeMode === "hsl"
                      ? hslInput[ch]
                      : computed
                        ? String(computed.hsl[ch])
                        : "0"
                  }
                  onChange={(e) => {
                    setActiveMode("hsl");
                    setHslInput((prev) => ({
                      ...prev,
                      [ch]: e.target.value,
                    }));
                  }}
                  onFocus={() => setActiveMode("hsl")}
                  placeholder={ch.toUpperCase()}
                  className="h-8 w-16 rounded-md border bg-card px-2 text-center font-mono text-[13px] outline-none focus:ring-1 focus:ring-ring"
                />
              ))}
              <div className="flex-1" />
              <CopyBtn
                label="hsl"
                value={hslStr}
                copied={copied}
                onCopy={copyValue}
              />
            </div>
          </div>
        </div>
      </div>

      {computed && (
        <div className="space-y-1">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
            CSS Values
          </div>
          <div className="space-y-0.5">
            <CssRow
              label="Tailwind"
              value={hexStr.replace("#", "").toLowerCase()}
              copied={copied}
              onCopy={copyValue}
            />
            <CssRow
              label="CSS HSL"
              value={`${computed.hsl.h} ${computed.hsl.s}% ${computed.hsl.l}%`}
              copied={copied}
              onCopy={copyValue}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const CopyBtn = ({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: string | null;
  onCopy: (label: string, value: string) => void;
}) => (
  <button
    onClick={() => onCopy(label, value)}
    className="flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground/40 transition-colors hover:bg-secondary hover:text-foreground"
  >
    {copied === label ? (
      <Check className="h-3 w-3 text-success" />
    ) : (
      <Copy className="h-3 w-3" />
    )}
  </button>
);

const CssRow = ({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: string | null;
  onCopy: (label: string, value: string) => void;
}) => (
  <div className="group flex items-center gap-3 rounded-md px-3 py-1 transition-colors hover:bg-card">
    <span className="w-20 shrink-0 text-[11px] text-muted-foreground/40">
      {label}
    </span>
    <span className="flex-1 font-mono text-[12px] text-foreground/70">
      {value}
    </span>
    <button
      onClick={() => onCopy(label, value)}
      className="shrink-0 text-muted-foreground/20 opacity-0 transition-opacity hover:text-muted-foreground group-hover:opacity-100"
    >
      {copied === label ? (
        <Check className="h-3 w-3 text-success" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  </div>
);
