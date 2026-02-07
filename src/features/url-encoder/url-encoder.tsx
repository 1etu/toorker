import { useState, useMemo } from "react";
import { Copy, Check, ArrowDownUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const UrlEncoder = () => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null };
    try {
      if (mode === "encode") {
        return { output: encodeURIComponent(input), error: null };
      } else {
        return {
          output: decodeURIComponent(input.trim()),
          error: null,
        };
      }
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSwap = () => {
    setMode((m) => (m === "encode" ? "decode" : "encode"));
    if (output) setInput(output);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-md border bg-card p-0.5">
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded-[3px] px-2.5 py-1 text-[11px] font-medium capitalize transition-colors",
                mode === m
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <button
          onClick={handleSwap}
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowDownUp className="h-2.5 w-2.5" />
          Swap
        </button>

        <div className="flex-1" />

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
            Input
          </span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Text to encode..."
                : "URL-encoded text to decode..."
            }
            spellCheck={false}
            className="flex-1 resize-none rounded-lg border bg-card p-3 font-mono text-[12px] leading-relaxed outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Output
          </span>
          {error ? (
            <div className="flex-1 overflow-auto rounded-lg border border-destructive/20 bg-destructive/5 p-3 font-mono text-[12px] text-destructive">
              {error}
            </div>
          ) : (
            <pre className="flex-1 overflow-auto whitespace-pre-wrap rounded-lg border bg-card p-3 font-mono text-[12px] leading-relaxed text-foreground/90">
              {output || (
                <span className="text-muted-foreground/40">
                  Result will appear here
                </span>
              )}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
