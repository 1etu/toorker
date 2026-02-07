import { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";

function decodeJwtPart(part: string): string {
  try {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const decoded = atob(padded);
    const json = JSON.parse(decoded);
    return JSON.stringify(json, null, 2);
  } catch {
    return "Invalid";
  }
}

export const JwtDecoder = () => {
  const [input, setInput] = useState("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const decoded = useMemo(() => {
    if (!input.trim()) return null;
    const parts = input.trim().split(".");
    if (parts.length !== 3) {
      return {
        error:
          "Invalid JWT format — expected 3 parts separated by dots",
      };
    }
    return {
      header: decodeJwtPart(parts[0]!),
      payload: decodeJwtPart(parts[1]!),
      signature: parts[2]!,
    };
  }, [input]);

  const copy = async (section: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Token
        </span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste JWT token here..."
          spellCheck={false}
          className="h-24 w-full resize-none rounded-lg border bg-card p-3 font-mono text-[12px] leading-relaxed outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
        />
      </div>

      {decoded && "error" in decoded && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
          {decoded.error}
        </div>
      )}

      {decoded && !("error" in decoded) && (
        <div className="grid gap-3 md:grid-cols-2">
          <JwtSection
            label="Header"
            content={decoded.header}
            copied={copiedSection === "header"}
            onCopy={() => copy("header", decoded.header)}
          />

          <JwtSection
            label="Payload"
            content={decoded.payload}
            copied={copiedSection === "payload"}
            onCopy={() => copy("payload", decoded.payload)}
          />
    
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Signature
              </span>
              <button
                onClick={() => copy("signature", decoded.signature)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {copiedSection === "signature" ? (
                  <Check className="h-2.5 w-2.5 text-success" />
                ) : (
                  <Copy className="h-2.5 w-2.5" />
                )}
              </button>
            </div>
            <div className="overflow-auto break-all rounded-lg border bg-card p-3 font-mono text-[11px] text-muted-foreground">
              {decoded.signature}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const JwtSection = ({
  label,
  content,
  copied,
  onCopy,
}: {
  label: string;
  content: string;
  copied: boolean;
  onCopy: () => void;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <button
        onClick={onCopy}
        className="flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
      >
        {copied ? (
          <Check className="h-2.5 w-2.5 text-success" />
        ) : (
          <Copy className="h-2.5 w-2.5" />
        )}
      </button>
    </div>
    <pre className="overflow-auto whitespace-pre-wrap rounded-lg border bg-card p-3 font-mono text-[12px] leading-relaxed text-foreground/90">
      {content}
    </pre>
  </div>
);
