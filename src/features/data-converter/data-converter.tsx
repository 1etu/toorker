import { useState, useMemo } from "react";
import { Copy, Check, ArrowLeftRight, ArrowDownUp, Trash2 } from "lucide-react";
import * as yaml from "js-yaml";
import * as TOML from "smol-toml";
import { cn } from "@/lib/utils";

type Format = "json" | "yaml" | "toml";

const FORMAT_OPTIONS: { value: Format; label: string }[] = [
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "toml", label: "TOML" },
];

const PLACEHOLDERS: Record<Format, string> = {
  json: `{
  "name": "Toorker",
  "version": "1.0.0",
  "features": ["fast", "beautiful"]
}`,
  yaml: `name: Toorker
version: 1.0.0
features:
  - fast
  - beautiful`,
  toml: `name = "Toorker"
version = "1.0.0"
features = ["fast", "beautiful"]`,
};

function detectFormat(input: string): Format | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^\s*[\[{]/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch { }
  }

  if (
    /^\s*\[[\w.-]+\]\s*$/m.test(trimmed) ||
    /^\s*[\w.-]+\s*=\s*/m.test(trimmed)
  ) {
    try {
      TOML.parse(trimmed);
      return "toml";
    } catch {}
  }

  if (/^\s*[\w.-]+\s*:\s*/m.test(trimmed)) {
    try {
      const parsed = yaml.load(trimmed);
      if (typeof parsed === "object" && parsed !== null) return "yaml";
    } catch {
    }
  }

  return null;
}

function parseInput(input: string, format: Format): unknown {
  switch (format) {
    case "json":
      return JSON.parse(input);
    case "yaml":
      return yaml.load(input);
    case "toml":
      return TOML.parse(input);
  }
}

function stringifyOutput(data: unknown, format: Format): string {
  switch (format) {
    case "json":
      return JSON.stringify(data, null, 2);
    case "yaml":
      return yaml.dump(data, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false,
      });
    case "toml":
      return TOML.stringify(data as Record<string, unknown>);
  }
}

export const DataConverter = () => {
  const [input, setInput] = useState("");
  const [inputFormat, setInputFormat] = useState<Format>("json");
  const [outputFormat, setOutputFormat] = useState<Format>("yaml");
  const [autoDetect, setAutoDetect] = useState(true);
  const [copied, setCopied] = useState(false);

  const detectedFormat = useMemo(() => {
    if (!autoDetect || !input.trim()) return null;
    return detectFormat(input);
  }, [input, autoDetect]);

  const effectiveInputFormat = autoDetect && detectedFormat ? detectedFormat : inputFormat;

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null };

    if (effectiveInputFormat === outputFormat) {
      try {
        const parsed = parseInput(input, effectiveInputFormat);
        return { output: stringifyOutput(parsed, outputFormat), error: null };
      } catch (e) {
        return { output: "", error: `Parse error: ${(e as Error).message}` };
      }
    }

    try {
      const parsed = parseInput(input, effectiveInputFormat);
      const result = stringifyOutput(parsed, outputFormat);
      return { output: result, error: null };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, effectiveInputFormat, outputFormat]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSwap = () => {
    if (output && !error) {
      setInput(output);
      setInputFormat(outputFormat);
      setOutputFormat(effectiveInputFormat);
      setAutoDetect(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch {
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
            From
          </span>
          <div className="flex items-center rounded-md border bg-card p-0.5">
            {FORMAT_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setInputFormat(f.value);
                  setAutoDetect(false);
                }}
                className={cn(
                  "rounded-[3px] px-2.5 py-1 text-[11px] font-medium transition-colors",
                  effectiveInputFormat === f.value
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          {autoDetect && detectedFormat && (
            <span className="text-[10px] text-muted-foreground/50">
              (auto-detected)
            </span>
          )}
        </div>

        <button
          onClick={handleSwap}
          disabled={!output || !!error}
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
        >
          <ArrowLeftRight className="h-2.5 w-2.5" />
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
            To
          </span>
          <div className="flex items-center rounded-md border bg-card p-0.5">
            {FORMAT_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => setOutputFormat(f.value)}
                className={cn(
                  "rounded-[3px] px-2.5 py-1 text-[11px] font-medium transition-colors",
                  outputFormat === f.value
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <input
            type="checkbox"
            checked={autoDetect}
            onChange={(e) => setAutoDetect(e.target.checked)}
            className="rounded"
          />
          Auto-detect
        </label>

        <button
          onClick={handlePaste}
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowDownUp className="h-2.5 w-2.5" />
          Paste
        </button>

        <button
          onClick={() => setInput("")}
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Trash2 className="h-2.5 w-2.5" />
          Clear
        </button>

        <button
          onClick={handleCopy}
          disabled={!output}
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
        >
          {copied ? (
            <Check className="h-2.5 w-2.5 text-success" />
          ) : (
            <Copy className="h-2.5 w-2.5" />
          )}
          Copy
        </button>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Input ({effectiveInputFormat.toUpperCase()})
          </span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={PLACEHOLDERS[effectiveInputFormat]}
            spellCheck={false}
            className="flex-1 resize-none rounded-lg border bg-card p-3 font-mono text-[12px] leading-relaxed outline-none placeholder:text-muted-foreground/30 focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Output ({outputFormat.toUpperCase()})
          </span>
          {error ? (
            <div className="flex-1 overflow-auto rounded-lg border border-destructive/20 bg-destructive/5 p-3 font-mono text-[12px] text-destructive">
              {error}
            </div>
          ) : (
            <pre className="flex-1 overflow-auto whitespace-pre-wrap rounded-lg border bg-card p-3 font-mono text-[12px] leading-relaxed text-foreground/90">
              {output || (
                <span className="text-muted-foreground/40">
                  Converted output will appear here
                </span>
              )}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
