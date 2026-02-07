import { useState, useMemo } from "react";
import { Copy, Check, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "encode" | "decode";

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

function encodeHtml(str: string): string {
  return str.replace(/[&<>"'`=/]/g, (s) => HTML_ENTITIES[s] ?? s);
}

function decodeHtml(str: string): string {
  const el = document.createElement("textarea");
  el.innerHTML = str;
  return el.value;
}

export const HtmlEncoder = () => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!input) return "";
    try {
      return mode === "encode" ? encodeHtml(input) : decodeHtml(input);
    } catch {
      return "Error processing input";
    }
  }, [input, mode]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSwap = () => {
    setInput(output);
    setMode(mode === "encode" ? "decode" : "encode");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-md border bg-card p-0.5">
          {(["encode", "decode"] as Mode[]).map((m) => (
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
          disabled={!output}
          className="flex h-8 items-center gap-1 rounded-md border px-2.5 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
        >
          <ArrowLeftRight className="h-3 w-3" />
          Swap
        </button>

        <div className="flex-1" />

        <button
          onClick={handleCopy}
          disabled={!output}
          className="flex h-8 items-center gap-1.5 rounded-md border px-3 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
        >
          {copied ? (
            <Check className="h-3 w-3 text-success" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          Copy
        </button>
      </div>
                
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Input
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "<div>Hello & World</div>"
                : "&lt;div&gt;Hello &amp; World&lt;/div&gt;"
            }
            spellCheck={false}
            className="h-56 w-full resize-none rounded-lg border bg-card p-3 font-mono text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground/30 focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Output
          </div>
          <textarea
            value={output}
            readOnly
            className="h-56 w-full resize-none rounded-lg border bg-card p-3 font-mono text-[13px] leading-relaxed text-foreground/80 outline-none"
          />
        </div>
      </div>
    </div>
  );
};
