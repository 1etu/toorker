import { useState, useMemo } from "react";
import {
  Copy,
  Plus,
  Trash2,
  RotateCw,
  Sparkles,
  Code2,
  Palette,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type GradientType = "linear" | "radial" | "conic";

interface ColorStop {
  id: string;
  color: string;
  position: number; // 0-100
}

interface GradientState {
  type: GradientType;
  angle: number; // For linear
  stops: ColorStop[];
  radialShape: "circle" | "ellipse";
  radialPosition: string; // e.g., "center", "top left"
}

// ── Presets ────────────────────────────────────────────────────────────────────

const PRESETS: { name: string; gradient: Partial<GradientState> }[] = [
  {
    name: "Sunset",
    gradient: {
      type: "linear",
      angle: 135,
      stops: [
        { id: "1", color: "#ff6b6b", position: 0 },
        { id: "2", color: "#feca57", position: 50 },
        { id: "3", color: "#ee5a6f", position: 100 },
      ],
    },
  },
  {
    name: "Ocean",
    gradient: {
      type: "linear",
      angle: 180,
      stops: [
        { id: "1", color: "#667eea", position: 0 },
        { id: "2", color: "#764ba2", position: 100 },
      ],
    },
  },
  {
    name: "Purple Haze",
    gradient: {
      type: "linear",
      angle: 45,
      stops: [
        { id: "1", color: "#c471f5", position: 0 },
        { id: "2", color: "#fa71cd", position: 100 },
      ],
    },
  },
  {
    name: "Emerald",
    gradient: {
      type: "linear",
      angle: 90,
      stops: [
        { id: "1", color: "#11998e", position: 0 },
        { id: "2", color: "#38ef7d", position: 100 },
      ],
    },
  },
  {
    name: "Fire",
    gradient: {
      type: "radial",
      stops: [
        { id: "1", color: "#f12711", position: 0 },
        { id: "2", color: "#f5af19", position: 100 },
      ],
    },
  },
  {
    name: "Arctic",
    gradient: {
      type: "linear",
      angle: 120,
      stops: [
        { id: "1", color: "#e0f7fa", position: 0 },
        { id: "2", color: "#80deea", position: 50 },
        { id: "3", color: "#00acc1", position: 100 },
      ],
    },
  },
  {
    name: "Neon",
    gradient: {
      type: "conic",
      stops: [
        { id: "1", color: "#ff0080", position: 0 },
        { id: "2", color: "#7928ca", position: 33 },
        { id: "3", color: "#0070f3", position: 66 },
        { id: "4", color: "#ff0080", position: 100 },
      ],
    },
  },
  {
    name: "Gold",
    gradient: {
      type: "linear",
      angle: 135,
      stops: [
        { id: "1", color: "#f7971e", position: 0 },
        { id: "2", color: "#ffd200", position: 100 },
      ],
    },
  },
];

// ── Gradient CSS Generator ────────────────────────────────────────────────────

function generateCSS(state: GradientState): string {
  const stops = state.stops
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ");

  switch (state.type) {
    case "linear":
      return `linear-gradient(${state.angle}deg, ${stops})`;
    case "radial":
      return `radial-gradient(${state.radialShape} at ${state.radialPosition}, ${stops})`;
    case "conic":
      return `conic-gradient(from ${state.angle}deg, ${stops})`;
  }
}

// ── Export Formats ─────────────────────────────────────────────────────────────

function exportCSS(state: GradientState): string {
  const css = generateCSS(state);
  return `background: ${css};`;
}

function exportTailwind(state: GradientState): string {
  // Tailwind doesn't have native gradient angle/stops, so use arbitrary values
  const css = generateCSS(state);
  return `bg-[${css.replace(/\s+/g, "_")}]`;
}

function exportReact(state: GradientState): string {
  const css = generateCSS(state);
  return `style={{ background: "${css}" }}`;
}

function exportVue(state: GradientState): string {
  const css = generateCSS(state);
  return `:style="{ background: '${css}' }"`;
}

function exportSCSS(state: GradientState): string {
  const css = generateCSS(state);
  return `$gradient: ${css};\nbackground: $gradient;`;
}

function exportSwiftUI(state: GradientState): string {
  const colors = state.stops
    .map(
      (s) =>
        `.init(Color(hex: "${s.color}"), location: ${(s.position / 100).toFixed(2)})`,
    )
    .join(",\n    ");

  const gradientType = state.type === "linear" ? "LinearGradient" : "RadialGradient";
  const angle = state.type === "linear" ? `startPoint: .topLeading, endPoint: .bottomTrailing` : `center: .center, startRadius: 0, endRadius: 200`;

  return `${gradientType}(
  gradient: Gradient(stops: [
    ${colors}
  ]),
  ${angle}
)`;
}

function exportKotlin(state: GradientState): string {
  const colors = state.stops.map((s) => `Color(0xFF${s.color.slice(1)})`).join(", ");
  return `Brush.linearGradient(colors = listOf(${colors}))`;
}

// ── Component ──────────────────────────────────────────────────────────────────

export const GradientBuilder = () => {
  const [state, setState] = useState<GradientState>({
    type: "linear",
    angle: 90,
    stops: [
      { id: "1", color: "#667eea", position: 0 },
      { id: "2", color: "#764ba2", position: 100 },
    ],
    radialShape: "circle",
    radialPosition: "center",
  });

  const [copied, setCopied] = useState("");

  const gradientCSS = useMemo(() => generateCSS(state), [state]);

  // ── Handlers ─────────────────────────────────────────────────

  const addStop = () => {
    const newId = String(Date.now());
    const newPosition = 50;
    setState((prev) => ({
      ...prev,
      stops: [...prev.stops, { id: newId, color: "#888888", position: newPosition }].sort(
        (a, b) => a.position - b.position,
      ),
    }));
  };

  const removeStop = (id: string) => {
    if (state.stops.length <= 2) return; // Min 2 stops
    setState((prev) => ({
      ...prev,
      stops: prev.stops.filter((s) => s.id !== id),
    }));
  };

  const updateStop = (id: string, updates: Partial<ColorStop>) => {
    setState((prev) => ({
      ...prev,
      stops: prev.stops.map((s) => (s.id === id ? { ...s, ...updates } : s)).sort(
        (a, b) => a.position - b.position,
      ),
    }));
  };

  const randomize = () => {
    const randomColor = () =>
      `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`;
    const count = Math.floor(Math.random() * 3) + 2; // 2-4 stops
    const newStops: ColorStop[] = Array.from({ length: count }, (_, i) => ({
      id: String(Date.now() + i),
      color: randomColor(),
      position: (i / (count - 1)) * 100,
    }));

    setState((prev) => ({
      ...prev,
      stops: newStops,
      angle: Math.floor(Math.random() * 360),
    }));
  };

  const applyPreset = (preset: Partial<GradientState>) => {
    setState((prev) => ({ ...prev, ...preset }));
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* ── Left: Preview & Controls ────────────────────────── */}

      <div className="space-y-4">
        {/* Preview */}
        <div className="relative overflow-hidden rounded-xl border">
          <div
            className="aspect-video w-full"
            style={{ background: gradientCSS }}
          />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="rounded-lg bg-black/60 px-2.5 py-1.5 backdrop-blur-sm">
              <div className="font-mono text-[10px] text-white/80">
                {state.stops.length} stops · {state.type}
                {state.type === "linear" && ` · ${state.angle}°`}
              </div>
            </div>
            <button
              onClick={randomize}
              className="flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              <RotateCw className="h-3 w-3 text-white" />
              <span className="text-[11px] font-medium text-white">Random</span>
            </button>
          </div>
        </div>

        {/* Gradient Type */}
        <Section title="Type" icon={Sparkles}>
          <div className="grid grid-cols-3 gap-2">
            {(["linear", "radial", "conic"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setState((prev) => ({ ...prev, type }))}
                className={cn(
                  "rounded-lg px-3 py-2 text-[12px] font-medium capitalize transition-colors",
                  state.type === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </Section>

        {/* Angle (Linear/Conic) */}
        {(state.type === "linear" || state.type === "conic") && (
          <Section title="Angle" icon={RotateCw}>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="360"
                value={state.angle}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, angle: Number(e.target.value) }))
                }
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="360"
                value={state.angle}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, angle: Number(e.target.value) }))
                }
                className="w-16 rounded-md border bg-secondary px-2 py-1 text-center font-mono text-[12px] text-foreground"
              />
              <span className="text-[11px] text-muted-foreground">deg</span>
            </div>
          </Section>
        )}

        {/* Radial Shape */}
        {state.type === "radial" && (
          <Section title="Shape" icon={Maximize2}>
            <div className="grid grid-cols-2 gap-2">
              {(["circle", "ellipse"] as const).map((shape) => (
                <button
                  key={shape}
                  onClick={() =>
                    setState((prev) => ({ ...prev, radialShape: shape }))
                  }
                  className={cn(
                    "rounded-lg px-3 py-2 text-[12px] font-medium capitalize transition-colors",
                    state.radialShape === shape
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
                  )}
                >
                  {shape}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Color Stops */}
        <Section title="Color Stops" icon={Palette}>
          <div className="space-y-2">
            {state.stops.map((stop) => (
              <div key={stop.id} className="flex items-center gap-2">
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                  className="h-9 w-9 cursor-pointer rounded-md border"
                />
                <input
                  type="text"
                  value={stop.color}
                  onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                  className="w-24 rounded-md border bg-secondary px-2 py-1.5 font-mono text-[11px] text-foreground"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={stop.position}
                  onChange={(e) =>
                    updateStop(stop.id, { position: Number(e.target.value) })
                  }
                  className="flex-1"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={stop.position}
                  onChange={(e) =>
                    updateStop(stop.id, { position: Number(e.target.value) })
                  }
                  className="w-14 rounded-md border bg-secondary px-2 py-1.5 text-center font-mono text-[11px] text-foreground"
                />
                <span className="text-[11px] text-muted-foreground">%</span>
                {state.stops.length > 2 && (
                  <button
                    onClick={() => removeStop(stop.id)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addStop}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Stop
            </button>
          </div>
        </Section>

        {/* Presets */}
        <Section title="Presets" icon={Sparkles}>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.gradient)}
                className="group relative overflow-hidden rounded-lg border transition-all hover:scale-105"
                title={preset.name}
              >
                <div
                  className="aspect-square w-full"
                  style={{
                    background: generateCSS({
                      ...state,
                      ...preset.gradient,
                    } as GradientState),
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/50">
                  <span className="text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {preset.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Section>
      </div>

      {/* ── Right: Export Code ──────────────────────────────── */}

      <div className="space-y-4">
        <Section title="Export" icon={Code2}>
          <div className="space-y-3">
            <ExportBox
              label="CSS"
              code={exportCSS(state)}
              copied={copied === "CSS"}
              onCopy={() => copyToClipboard(exportCSS(state), "CSS")}
            />
            <ExportBox
              label="Tailwind"
              code={exportTailwind(state)}
              copied={copied === "Tailwind"}
              onCopy={() => copyToClipboard(exportTailwind(state), "Tailwind")}
            />
            <ExportBox
              label="React"
              code={exportReact(state)}
              copied={copied === "React"}
              onCopy={() => copyToClipboard(exportReact(state), "React")}
            />
            <ExportBox
              label="Vue"
              code={exportVue(state)}
              copied={copied === "Vue"}
              onCopy={() => copyToClipboard(exportVue(state), "Vue")}
            />
            <ExportBox
              label="SCSS"
              code={exportSCSS(state)}
              copied={copied === "SCSS"}
              onCopy={() => copyToClipboard(exportSCSS(state), "SCSS")}
            />
            <ExportBox
              label="SwiftUI"
              code={exportSwiftUI(state)}
              copied={copied === "SwiftUI"}
              onCopy={() => copyToClipboard(exportSwiftUI(state), "SwiftUI")}
            />
            <ExportBox
              label="Kotlin (Compose)"
              code={exportKotlin(state)}
              copied={copied === "Kotlin"}
              onCopy={() => copyToClipboard(exportKotlin(state), "Kotlin")}
            />
          </div>
        </Section>
      </div>
    </div>
  );
};

// ── Section ────────────────────────────────────────────────────────────────────

const Section = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border bg-card/50 p-4">
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground/30" />
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/40">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

// ── Export Box ─────────────────────────────────────────────────────────────────

const ExportBox = ({
  label,
  code,
  copied,
  onCopy,
}: {
  label: string;
  code: string;
  copied: boolean;
  onCopy: () => void;
}) => (
  <div className="group relative overflow-hidden rounded-lg border bg-secondary/30">
    <div className="flex items-center justify-between border-b bg-secondary/50 px-3 py-1.5">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <button
        onClick={onCopy}
        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors hover:bg-secondary"
      >
        <Copy className="h-3 w-3" />
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
    <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-foreground/80">
      {code}
    </pre>
  </div>
);
