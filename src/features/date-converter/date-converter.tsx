import { useState, useMemo, useCallback } from "react";
import { Copy, Check, Clock } from "lucide-react";

interface DateInfo {
  unix: number;
  iso: string;
  utc: string;
  local: string;
  relative: string;
  dayOfWeek: string;
  dayOfYear: number;
  weekNumber: number;
}

function getWeekNumber(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1);
  const diff = d.getTime() - start.getTime();
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
}

function getRelative(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const abs = Math.abs(diff);
  const suffix = diff > 0 ? "ago" : "from now";

  if (abs < 60000) return "just now";
  if (abs < 3600000) return `${Math.floor(abs / 60000)} min ${suffix}`;
  if (abs < 86400000) return `${Math.floor(abs / 3600000)} hours ${suffix}`;
  if (abs < 2592000000) return `${Math.floor(abs / 86400000)} days ${suffix}`;
  if (abs < 31536000000) return `${Math.floor(abs / 2592000000)} months ${suffix}`;
  return `${Math.floor(abs / 31536000000)} years ${suffix}`;
}

function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function buildInfo(ts: number): DateInfo {
  const d = new Date(ts);
  return {
    unix: Math.floor(ts / 1000),
    iso: d.toISOString(),
    utc: d.toUTCString(),
    local: d.toLocaleString(),
    relative: getRelative(ts),
    dayOfWeek: d.toLocaleDateString("en-US", { weekday: "long" }),
    dayOfYear: getDayOfYear(d),
    weekNumber: getWeekNumber(d),
  };
}

export const DateConverter = () => {
  const [unixInput, setUnixInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [activeSource, setActiveSource] = useState<"unix" | "date">(
    "unix",
  );
  const [copied, setCopied] = useState<string | null>(null);

  const info = useMemo((): DateInfo | null => {
    if (activeSource === "unix") {
      if (!unixInput.trim()) return null;
      const num = Number(unixInput);
      if (isNaN(num)) return null;
      const ts = num > 1e12 ? num : num * 1000;
      return buildInfo(ts);
    }
    if (!dateInput.trim()) return null;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    return buildInfo(d.getTime());
  }, [unixInput, dateInput, activeSource]);

  const setNow = useCallback(() => {
    const now = Date.now();
    setUnixInput(Math.floor(now / 1000).toString());
    setActiveSource("unix");
  }, []);

  const copyValue = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Unix Timestamp
          </div>
          <div className="flex items-center gap-1.5">
            <input
              value={unixInput}
              onChange={(e) => {
                setUnixInput(e.target.value);
                setActiveSource("unix");
              }}
              placeholder="1700000000"
              spellCheck={false}
              className="h-9 flex-1 rounded-md border bg-card px-3 font-mono text-[13px] outline-none placeholder:text-muted-foreground/30 focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={setNow}
              title="set to current time"
              className="flex h-9 items-center gap-1.5 rounded-md border px-3 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Clock className="h-3 w-3" />
              Now
            </button>
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Date String
          </div>
          <input
            value={dateInput}
            onChange={(e) => {
              setDateInput(e.target.value);
              setActiveSource("date");
            }}
            placeholder="2024-01-15T12:00:00Z"
            spellCheck={false}
            className="h-9 w-full rounded-md border bg-card px-3 font-mono text-[13px] outline-none placeholder:text-muted-foreground/30 focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {info && (
        <div className="space-y-1">
          <InfoRow
            label="Unix (seconds)"
            value={info.unix.toString()}
            copied={copied}
            onCopy={copyValue}
          />
          <InfoRow
            label="Unix (milliseconds)"
            value={(info.unix * 1000).toString()}
            copied={copied}
            onCopy={copyValue}
          />
          <InfoRow
            label="ISO 8601"
            value={info.iso}
            copied={copied}
            onCopy={copyValue}
          />
          <InfoRow
            label="UTC"
            value={info.utc}
            copied={copied}
            onCopy={copyValue}
          />
          <InfoRow
            label="Local"
            value={info.local}
            copied={copied}
            onCopy={copyValue}
          />
          <InfoRow
            label="Relative"
            value={info.relative}
            copied={copied}
            onCopy={copyValue}
          />
          <InfoRow
            label="Day of Week"
            value={info.dayOfWeek}
            copied={copied}
            onCopy={copyValue}
          />
          <InfoRow
            label="Day of Year"
            value={info.dayOfYear.toString()}
            copied={copied}
            onCopy={copyValue}
          />
          <InfoRow
            label="Week Number"
            value={info.weekNumber.toString()}
            copied={copied}
            onCopy={copyValue}
          />
        </div>
      )}

      {!info && (unixInput || dateInput) && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
          Invalid date input
        </div>
      )}
    </div>
  );
};

const InfoRow = ({
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
  <div className="group flex items-center gap-3 rounded-md px-3 py-1.5 transition-colors hover:bg-card">
    <span className="w-32 shrink-0 text-[11px] text-muted-foreground/50">
      {label}
    </span>
    <span className="flex-1 truncate font-mono text-[13px] tabular-nums text-foreground/80">
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
