import { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Send,
  Loader2,
  ClipboardPaste,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseCurl } from "./curl-parser";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
export type HttpMethod = (typeof METHODS)[number];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "text-emerald-400",
  POST: "text-blue-400",
  PUT: "text-amber-400",
  PATCH: "text-orange-400",
  DELETE: "text-red-400",
};

const METHOD_DOT: Record<HttpMethod, string> = {
  GET: "bg-emerald-400",
  POST: "bg-blue-400",
  PUT: "bg-amber-400",
  PATCH: "bg-orange-400",
  DELETE: "bg-red-400",
};

export interface RequestData {
  method: HttpMethod;
  url: string;
  headers: Array<{ key: string; value: string }>;
  body: string;
}

type ReqTab = "headers" | "body";

interface RequestBuilderProps {
  request: RequestData;
  onChange: (data: RequestData) => void;
  onSend: () => void;
  loading: boolean;
}

export const RequestBuilder = ({
  request,
  onChange,
  onSend,
  loading,
}: RequestBuilderProps) => {
  const [activeTab, setActiveTab] = useState<ReqTab>("headers");

  const filledHeaders = request.headers.filter(
    (h) => h.key.trim() !== "",
  );
  const hasBody = ["POST", "PUT", "PATCH"].includes(request.method);

  const updateMethod = (method: HttpMethod) => {
    onChange({ ...request, method });
    if (["POST", "PUT", "PATCH"].includes(method) && activeTab !== "body") {
      setActiveTab("body");
    }
  };

  const updateUrl = (url: string) => {
    onChange({ ...request, url });
  };

  const updateHeader = (
    index: number,
    field: "key" | "value",
    val: string,
  ) => {
    const headers = [...request.headers];
    headers[index] = { ...headers[index]!, [field]: val };
    onChange({ ...request, headers });
  };

  const addHeader = () => {
    onChange({
      ...request,
      headers: [...request.headers, { key: "", value: "" }],
    });
  };

  const removeHeader = (index: number) => {
    onChange({
      ...request,
      headers: request.headers.filter((_, i) => i !== index),
    });
  };

  const handlePaste = useCallback(
    async () => {
      try {
        const text = await navigator.clipboard.readText();
        const parsed = parseCurl(text);
        if (parsed) {
          onChange({
            method: parsed.method as HttpMethod,
            url: parsed.url,
            headers:
              parsed.headers.length > 0
                ? parsed.headers
                : [{ key: "", value: "" }],
            body: parsed.body,
          });
          if (["POST", "PUT", "PATCH"].includes(parsed.method)) {
            setActiveTab("body");
          }
        } else {
          const trimmed = text.trim();
          if (
            trimmed.startsWith("http://") ||
            trimmed.startsWith("https://")
          ) {
            onChange({ ...request, url: trimmed });
          }
        }
      } catch {
        // err clivboard
      }
    },
    [onChange, request],
  );

  return (
    <div className="space-y-0">
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <div
            className={cn(
              "absolute left-2.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full",
              METHOD_DOT[request.method],
            )}
          />
          <select
            value={request.method}
            onChange={(e) =>
              updateMethod(e.target.value as HttpMethod)
            }
            className={cn(
              "h-9 rounded-md border bg-card pl-6 pr-2 font-mono text-[12px] font-semibold outline-none transition-colors focus:ring-1 focus:ring-ring",
              METHOD_COLORS[request.method],
            )}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <input
          value={request.url}
          onChange={(e) => updateUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Enter URL..."
          className="h-9 flex-1 rounded-md border bg-card px-3 font-mono text-[13px] outline-none placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-ring"
        />

        <button
          onClick={handlePaste}
          title="Paste URL or curl command"
          className="flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={onSend}
          disabled={loading || !request.url.trim()}
          className="flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Send
        </button>
      </div>

      <div className="mt-3 flex items-center border-b">
        <button
          onClick={() => setActiveTab("headers")}
          className={cn(
            "border-b-2 px-3 py-1.5 text-[11px] font-medium transition-colors",
            activeTab === "headers"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          Headers
          {filledHeaders.length > 0 && (
            <span className="ml-1 text-muted-foreground/50">
              ({filledHeaders.length})
            </span>
          )}
        </button>
        {hasBody && (
          <button
            onClick={() => setActiveTab("body")}
            className={cn(
              "border-b-2 px-3 py-1.5 text-[11px] font-medium transition-colors",
              activeTab === "body"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Body
          </button>
        )}
      </div>

      <div className="pt-3">
        {activeTab === "headers" && (
          <div className="space-y-1.5">
            {request.headers.map((header, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <input
                  value={header.key}
                  onChange={(e) =>
                    updateHeader(idx, "key", e.target.value)
                  }
                  placeholder="Header name"
                  className="h-7 flex-1 rounded-md border bg-card px-2 font-mono text-[12px] outline-none placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-ring"
                />
                <input
                  value={header.value}
                  onChange={(e) =>
                    updateHeader(idx, "value", e.target.value)
                  }
                  placeholder="Value"
                  className="h-7 flex-1 rounded-md border bg-card px-2 font-mono text-[12px] outline-none placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-ring"
                />
                <button
                  onClick={() => removeHeader(idx)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
            <button
              onClick={addHeader}
              className="flex items-center gap-1 rounded-md px-1 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="h-3 w-3" />
              Add header
            </button>
          </div>
        )}

        {activeTab === "body" && hasBody && (
          <textarea
            value={request.body}
            onChange={(e) =>
              onChange({ ...request, body: e.target.value })
            }
            placeholder='{"key": "value"}'
            spellCheck={false}
            className="h-32 w-full resize-none rounded-lg border bg-card p-3 font-mono text-[12px] leading-relaxed outline-none placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-ring"
          />
        )}
      </div>
    </div>
  );
};
