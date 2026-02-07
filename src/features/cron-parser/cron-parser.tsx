import { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const FIELD_NAMES = [
  "Minute",
  "Hour",
  "Day of Month",
  "Month",
  "Day of Week",
] as const;

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DOW_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const PRESETS: { label: string; value: string }[] = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every day at midnight", value: "0 0 * * *" },
  { label: "Every Monday at 9am", value: "0 9 * * 1" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "First of every month", value: "0 0 1 * *" },
  { label: "Weekdays at 8:30am", value: "30 8 * * 1-5" },
];

function describeField(
  value: string,
  fieldIdx: number,
): string {
  if (value === "*") return `every ${FIELD_NAMES[fieldIdx]!.toLowerCase()}`;

  if (value.startsWith("*/")) {
    const step = value.slice(2);
    return `every ${step} ${FIELD_NAMES[fieldIdx]!.toLowerCase()}${Number(step) > 1 ? "s" : ""}`;
  }

  if (value.includes("-") && !value.includes(",")) {
    const [start, end] = value.split("-");
    const fmtStart = formatValue(start!, fieldIdx);
    const fmtEnd = formatValue(end!, fieldIdx);
    return `${fmtStart} through ${fmtEnd}`;
  }

  if (value.includes(",")) {
    const parts = value.split(",").map((v) => formatValue(v.trim(), fieldIdx));
    return parts.join(", ");
  }

  return formatValue(value, fieldIdx);
}

function formatValue(val: string, fieldIdx: number): string {
  const num = parseInt(val);
  if (isNaN(num)) return val;
  if (fieldIdx === 3 && num >= 1 && num <= 12) return MONTH_NAMES[num] ?? val;
  if (fieldIdx === 4 && num >= 0 && num <= 6) return DOW_NAMES[num] ?? val;
  if (fieldIdx === 0 || fieldIdx === 1)
    return num.toString().padStart(2, "0");
  return val;
}

function describeCron(expr: string): {
  parts: string[];
  summary: string;
  error: string | null;
} {
  const fields = expr.trim().split(/\s+/);
  if (fields.length !== 5) {
    return {
      parts: [],
      summary: "",
      error: `Expected 5 fields, got ${fields.length}`,
    };
  }

  const parts = fields.map((f, i) => describeField(f, i));

  let summary = "Runs ";
  const [min, hour, dom, mon, dow] = fields as [
    string,
    string,
    string,
    string,
    string,
  ];

  if (min === "*" && hour === "*") {
    summary += "every minute";
  } else if (min.startsWith("*/")) {
    summary += `every ${min.slice(2)} minutes`;
  } else if (hour === "*") {
    summary += `at minute ${min} of every hour`;
  } else if (hour.startsWith("*/")) {
    summary += `at minute ${min}, every ${hour.slice(2)} hours`;
  } else {
    summary += `at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
  }

  if (dom !== "*") summary += `, on day ${dom} of the month`;
  if (mon !== "*")
    summary += `, in ${describeField(mon, 3)}`;
  if (dow !== "*") summary += `, on ${describeField(dow, 4)}`;

  return { parts, summary, error: null };
}

export const CronParser = () => {
  const [input, setInput] = useState("*/15 * * * *");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => describeCron(input), [input]);

  const copyDescription = async () => {
    if (!result.summary) return;
    await navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
          Cron Expression
        </div>
        <div className="flex items-center gap-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="* * * * *"
            spellCheck={false}
            className="h-9 flex-1 rounded-md border bg-card px-3 font-mono text-[15px] tracking-wider outline-none placeholder:text-muted-foreground/30 focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={copyDescription}
            disabled={!result.summary}
            className="flex h-9 items-center gap-1.5 rounded-md border px-3 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
          >
            {copied ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            Copy
          </button>
        </div>
      </div>

      {result.error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
          {result.error}
        </div>
      )}

      {result.summary && (
        <div className="rounded-lg border bg-card px-4 py-3 text-[13px] text-foreground/80">
          {result.summary}
        </div>
      )}

      {result.parts.length === 5 && (
        <div className="space-y-1">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Fields
          </div>
          {FIELD_NAMES.map((name, i) => {
            const field = input.trim().split(/\s+/)[i] ?? "";
            return (
              <div
                key={name}
                className="flex items-center gap-3 rounded-md px-3 py-1.5 transition-colors hover:bg-card"
              >
                <span className="w-28 shrink-0 text-[11px] text-muted-foreground/50">
                  {name}
                </span>
                <span className="w-12 shrink-0 font-mono text-[13px] text-foreground">
                  {field}
                </span>
                <span className="text-[12px] text-muted-foreground/60">
                  {result.parts[i]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    
      <div>
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
          Presets
        </div>
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setInput(p.value)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-[11px] transition-colors",
                input === p.value
                  ? "border-foreground/10 bg-card text-foreground"
                  : "text-muted-foreground/50 hover:bg-card hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
