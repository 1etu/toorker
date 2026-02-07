import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

type DiffType = "equal" | "added" | "removed";

interface DiffLine {
  type: DiffType;
  text: string;
  leftNum?: number;
  rightNum?: number;
}

function computeLCS(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1]![j - 1]! + 1
          : Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
    }
  }
  return dp;
}

function computeDiff(original: string, modified: string): DiffLine[] {
  const a = original.split("\n");
  const b = modified.split("\n");
  const dp = computeLCS(a, b);
  const result: DiffLine[] = [];

  let i = a.length;
  let j = b.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({
        type: "equal",
        text: a[i - 1]!,
        leftNum: i,
        rightNum: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i]![j - 1]! >= dp[i - 1]![j]!)) {
      result.unshift({ type: "added", text: b[j - 1]!, rightNum: j });
      j--;
    } else {
      result.unshift({ type: "removed", text: a[i - 1]!, leftNum: i });
      i--;
    }
  }

  return result;
}

export const TextDiff = () => {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");

  const diff = useMemo(
    () =>
      original || modified
        ? computeDiff(original, modified)
        : [],
    [original, modified],
  );

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const d of diff) {
      if (d.type === "added") added++;
      if (d.type === "removed") removed++;
    }
    return { added, removed };
  }, [diff]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Original
          </div>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste original text..."
            spellCheck={false}
            className="h-40 w-full resize-none rounded-lg border bg-card p-3 font-mono text-[12px] leading-relaxed outline-none placeholder:text-muted-foreground/30 focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Modified
          </div>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder="Paste modified text..."
            spellCheck={false}
            className="h-40 w-full resize-none rounded-lg border bg-card p-3 font-mono text-[12px] leading-relaxed outline-none placeholder:text-muted-foreground/30 focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {diff.length > 0 && (
        <div className="flex items-center gap-3 text-[11px] tabular-nums">
          <span className="text-emerald-400">
            +{stats.added} added
          </span>
          <span className="text-red-400">
            -{stats.removed} removed
          </span>
          <span className="text-muted-foreground/40">
            {diff.filter((d) => d.type === "equal").length} unchanged
          </span>
        </div>
      )}

      {diff.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <div className="max-h-[360px] overflow-y-auto">
            {diff.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "flex font-mono text-[12px] leading-6",
                  line.type === "added" &&
                    "bg-emerald-500/[0.07] text-emerald-300",
                  line.type === "removed" &&
                    "bg-red-500/[0.07] text-red-300",
                  line.type === "equal" && "text-foreground/60",
                )}
              >
                <span className="w-10 shrink-0 select-none text-right text-[10px] leading-6 text-muted-foreground/25 pr-2 tabular-nums">
                  {line.leftNum ?? ""}
                </span>
                <span className="w-10 shrink-0 select-none text-right text-[10px] leading-6 text-muted-foreground/25 pr-2 tabular-nums">
                  {line.rightNum ?? ""}
                </span>
                <span className="w-5 shrink-0 select-none text-center text-muted-foreground/30">
                  {line.type === "added"
                    ? "+"
                    : line.type === "removed"
                      ? "-"
                      : " "}
                </span>
                <span className="flex-1 whitespace-pre pr-3">
                  {line.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
