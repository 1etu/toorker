import { useState } from "react";
import { Copy, Check, Clock, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
}

type Tab = "body" | "headers" | "raw";

interface ResponseViewerProps {
  response: ApiResponse;
}

export const ResponseViewer = ({ response }: ResponseViewerProps) => {
  const [tab, setTab] = useState<Tab>("body");
  const [copied, setCopied] = useState(false);

  const statusColor =
    response.status < 300
      ? "text-emerald-400"
      : response.status < 400
        ? "text-amber-400"
        : "text-red-400";

  const statusBg =
    response.status < 300
      ? "bg-emerald-400/10"
      : response.status < 400
        ? "bg-amber-400/10"
        : "bg-red-400/10";

  const copyBody = async () => {
    await navigator.clipboard.writeText(response.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const formattedBody = (() => {
    try {
      return JSON.stringify(JSON.parse(response.body), null, 2);
    } catch {
      return response.body;
    }
  })();

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border">
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <span
          className={cn(
            "rounded-md px-2 py-0.5 font-mono text-[12px] font-semibold tabular-nums",
            statusColor,
            statusBg,
          )}
        >
          {response.status} {response.statusText}
        </span>

        <div className="flex items-center gap-1 text-muted-foreground/60">
          <Clock className="h-3 w-3" />
          <span className="font-mono text-[11px] tabular-nums">
            {response.time}ms
          </span>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground/60">
          <Scale className="h-3 w-3" />
          <span className="font-mono text-[11px] tabular-nums">
            {formatSize(response.size)}
          </span>
        </div>

        <button
          onClick={copyBody}
          className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {copied ? (
            <Check className="h-2.5 w-2.5 text-success" />
          ) : (
            <Copy className="h-2.5 w-2.5" />
          )}
          Copy
        </button>
      </div>

      <div className="flex border-b">
        {(["body", "headers", "raw"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-3 py-1.5 text-[11px] font-medium capitalize transition-colors",
              tab === t
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
            {t === "headers" && (
              <span className="ml-1 text-muted-foreground/50">
                ({Object.keys(response.headers).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {tab === "body" && (
          <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-foreground/90">
            {formattedBody}
          </pre>
        )}
        {tab === "raw" && (
          <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-muted-foreground">
            {response.body}
          </pre>
        )}
        {tab === "headers" && (
          <div className="space-y-1">
            {Object.entries(response.headers).map(([key, value]) => (
              <div
                key={key}
                className="flex items-baseline gap-2 font-mono text-[12px]"
              >
                <span className="shrink-0 text-muted-foreground">
                  {key}
                </span>
                <span className="text-muted-foreground/30">:</span>
                <span className="break-all text-foreground/80">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
