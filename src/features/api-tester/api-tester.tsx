import { useState, useEffect, useCallback } from "react";
import { Copy, Check, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/use-app-store";
import {
  RequestBuilder,
  type RequestData,
  type HttpMethod,
} from "./request-builder";
import { ResponseViewer, type ApiResponse } from "./response-viewer";
import { toCurl, toFetch, toAxios } from "./export-snippets";
import { useApiHistory } from "./use-api-history";

type ExportFormat = "curl" | "fetch" | "axios";

const DEFAULT_REQUEST: RequestData = {
  method: "GET",
  url: "",
  headers: [{ key: "", value: "" }],
  body: "",
};

export const ApiTester = () => {
  const [request, setRequest] = useState<RequestData>(DEFAULT_REQUEST);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportCopied, setExportCopied] = useState<ExportFormat | null>(
    null,
  );
  const [showHistory, setShowHistory] = useState(false);

  const { entries: history, addEntry, clearHistory } = useApiHistory();
  const prefillUrl = useAppStore((s) => s.prefillUrl);
  const setPrefillUrl = useAppStore((s) => s.setPrefillUrl);

  useEffect(() => {
    if (prefillUrl) {
      setRequest((prev) => ({ ...prev, url: prefillUrl }));
      setPrefillUrl(null);
    }
  }, [prefillUrl, setPrefillUrl]);

  const send = useCallback(async () => {
    if (!request.url.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const start = performance.now();

      const headerObj: Record<string, string> = {};
      for (const { key, value } of request.headers) {
        if (key.trim()) headerObj[key.trim()] = value;
      }

      const fetchOptions: RequestInit = {
        method: request.method,
        headers: headerObj,
      };

      if (
        request.body.trim() &&
        ["POST", "PUT", "PATCH"].includes(request.method)
      ) {
        fetchOptions.body = request.body;
      }

      const res = await fetch(request.url, fetchOptions);
      const body = await res.text();
      const time = Math.round(performance.now() - start);

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        responseHeaders[k] = v;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body,
        time,
        size: new Blob([body]).size,
      });

      addEntry({
        method: request.method,
        url: request.url,
        status: res.status,
        time,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [request, addEntry]);

  const exportAs = async (format: ExportFormat) => {
    const data = {
      method: request.method,
      url: request.url,
      headers: request.headers.filter((h) => h.key.trim()),
      body: request.body,
    };
    const snippet =
      format === "curl"
        ? toCurl(data)
        : format === "fetch"
          ? toFetch(data)
          : toAxios(data);
    await navigator.clipboard.writeText(snippet);
    setExportCopied(format);
    setTimeout(() => setExportCopied(null), 1500);
  };

  const loadFromHistory = (entry: (typeof history)[0]) => {
    setRequest({
      method: entry.method as HttpMethod,
      url: entry.url,
      headers: [{ key: "", value: "" }],
      body: "",
    });
    setShowHistory(false);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <RequestBuilder
        request={request}
        onChange={setRequest}
        onSend={send}
        loading={loading}
      />

      <div className="flex items-center gap-1.5 border-t pt-3">
        <span className="mr-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
          Export
        </span>
        {(["curl", "fetch", "axios"] as ExportFormat[]).map((format) => (
          <button
            key={format}
            onClick={() => exportAs(format)}
            className="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {exportCopied === format ? (
              <Check className="h-2.5 w-2.5 text-success" />
            ) : (
              <Copy className="h-2.5 w-2.5" />
            )}
            {format}
          </button>
        ))}

        <div className="flex-1" />

        {history.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              "flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
              showHistory
                ? "border-foreground/20 bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Clock className="h-2.5 w-2.5" />
            History
            <span className="text-muted-foreground/50">
              {history.length}
            </span>
          </button>
        )}
      </div>

      {showHistory && history.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between border-b bg-card px-3 py-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              Recent Requests
            </span>
            <button
              onClick={clearHistory}
              className="flex items-center gap-1 text-[10px] text-muted-foreground/50 transition-colors hover:text-destructive"
            >
              <Trash2 className="h-2.5 w-2.5" />
              Clear
            </button>
          </div>
          <div className="max-h-44 overflow-y-auto">
            {history.map((entry) => (
              <button
                key={entry.id}
                onClick={() => loadFromHistory(entry)}
                className="flex w-full items-center gap-3 border-b px-3 py-1.5 text-left transition-colors last:border-0 hover:bg-card/60"
              >
                <span
                  className={cn(
                    "w-10 shrink-0 font-mono text-[11px] font-semibold",
                    entry.method === "GET" && "text-emerald-400",
                    entry.method === "POST" && "text-blue-400",
                    entry.method === "PUT" && "text-amber-400",
                    entry.method === "PATCH" && "text-orange-400",
                    entry.method === "DELETE" && "text-red-400",
                  )}
                >
                  {entry.method}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
                  {entry.url}
                </span>
                <span
                  className={cn(
                    "shrink-0 font-mono text-[11px] tabular-nums",
                    entry.status < 300
                      ? "text-emerald-400"
                      : entry.status < 400
                        ? "text-amber-400"
                        : "text-red-400",
                  )}
                >
                  {entry.status}
                </span>
                <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/40">
                  {entry.time}ms
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
          {error}
        </div>
      )}

      {response && <ResponseViewer response={response} />}
    </div>
  );
};
