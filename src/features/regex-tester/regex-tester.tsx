import { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Flag = "g" | "i" | "m" | "s";
const FLAGS: { id: Flag; label: string; title: string }[] = [
  { id: "g", label: "g", title: "Global" },
  { id: "i", label: "i", title: "Case insensitive" },
  { id: "m", label: "m", title: "Multiline" },
  { id: "s", label: "s", title: "Dotall" },
];

interface Segment {
  text: string;
  match: boolean;
  groupIdx?: number;
}

export const RegexTester = () => {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<Set<Flag>>(new Set(["g"]));
  const [testString, setTestString] = useState("");
  const [copied, setCopied] = useState(false);

  const flagStr = Array.from(flags).join("");

  const toggleFlag = (f: Flag) => {
    const next = new Set(flags);
    next.has(f) ? next.delete(f) : next.add(f);
    setFlags(next);
  };

  const { matches, error } = useMemo(() => {
    if (!pattern) return { matches: [] as RegExpExecArray[], error: null };
    try {
      const regex = new RegExp(pattern, flagStr);
      const results: RegExpExecArray[] = [];
      if (flagStr.includes("g")) {
        let m: RegExpExecArray | null;
        while ((m = regex.exec(testString)) !== null) {
          results.push(m);
          if (m[0].length === 0) regex.lastIndex++;
        }
      } else {
        const m = regex.exec(testString);
        if (m) results.push(m);
      }
      return { matches: results, error: null };
    } catch (e) {
      return {
        matches: [] as RegExpExecArray[],
        error: (e as Error).message,
      };
    }
  }, [pattern, flagStr, testString]);

  const segments = useMemo((): Segment[] => {
    if (!pattern || matches.length === 0 || !testString) return [];
    const segs: Segment[] = [];
    let lastIdx = 0;
    for (let mi = 0; mi < matches.length; mi++) {
      const m = matches[mi]!;
      const start = m.index;
      const end = start + m[0].length;
      if (start > lastIdx) {
        segs.push({ text: testString.slice(lastIdx, start), match: false });
      }
      segs.push({ text: m[0], match: true, groupIdx: mi });
      lastIdx = end;
    }
    if (lastIdx < testString.length) {
      segs.push({ text: testString.slice(lastIdx), match: false });
    }
    return segs;
  }, [pattern, matches, testString]);

  const copyPattern = async () => {
    await navigator.clipboard.writeText(`/${pattern}/${flagStr}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[13px] text-muted-foreground/40">
          /
        </span>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="Enter regex pattern..."
          spellCheck={false}
          className="h-9 flex-1 rounded-md border bg-card px-3 font-mono text-[13px] outline-none placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-ring"
        />
        <span className="font-mono text-[13px] text-muted-foreground/40">
          /
        </span>
        <div className="flex items-center gap-0.5">
          {FLAGS.map((f) => (
            <button
              key={f.id}
              title={f.title}
              onClick={() => toggleFlag(f.id)}
              className={cn(
                "flex h-9 w-8 items-center justify-center rounded-md font-mono text-[12px] font-semibold transition-colors",
                flags.has(f.id)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground/40 hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={copyPattern}
          disabled={!pattern}
          className="flex h-9 items-center gap-1 rounded-md border px-3 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
        >
          {copied ? (
            <Check className="h-3 w-3 text-success" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          Copy
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 font-mono text-[12px] text-destructive">
          {error}
        </div>
      )}

      <div>
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
          Test String
        </div>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter text to test against..."
          spellCheck={false}
          className="h-32 w-full resize-none rounded-lg border bg-card p-3 font-mono text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-ring"
        />
      </div>

      {segments.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
              Matches
            </span>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
              {matches.length} match{matches.length !== 1 ? "es" : ""}
            </span>
          </div>
          <div className="rounded-lg border bg-card p-3 font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-all">
            {segments.map((seg, i) =>
              seg.match ? (
                <mark
                  key={i}
                  className="rounded-sm bg-primary/20 text-primary px-0.5"
                >
                  {seg.text}
                </mark>
              ) : (
                <span key={i} className="text-foreground/80">
                  {seg.text}
                </span>
              ),
            )}
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Match Details
          </div>
          <div className="space-y-1">
            {matches.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-md border px-3 py-1.5 text-[12px]"
              >
                <span className="font-mono tabular-nums text-muted-foreground/50">
                  #{i + 1}
                </span>
                <span className="font-mono text-foreground">
                  {m[0]}
                </span>
                <span className="font-mono tabular-nums text-muted-foreground/40">
                  idx:{m.index}
                </span>
                {m.length > 1 && (
                  <span className="text-muted-foreground/50">
                    groups:{" "}
                    {Array.from(m)
                      .slice(1)
                      .map((g, gi) => (
                        <span key={gi} className="font-mono text-primary">
                          {g ?? "∅"}
                          {gi < m.length - 2 ? ", " : ""}
                        </span>
                      ))}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
