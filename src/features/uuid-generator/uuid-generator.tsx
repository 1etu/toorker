import { useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export const UuidGenerator = () => {
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([crypto.randomUUID()]);
  const [uppercase, setUppercase] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const generate = () => {
    setUuids(Array.from({ length: count }, () => crypto.randomUUID()));
  };

  const displayUuids = uppercase
    ? uuids.map((u) => u.toUpperCase())
    : uuids;

  const copyOne = async (idx: number) => {
    await navigator.clipboard.writeText(displayUuids[idx]!);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(displayUuids.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={generate}
          className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          <RefreshCw className="h-3 w-3" />
          Generate
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">Count</span>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) =>
              setCount(
                Math.max(1, Math.min(100, Number(e.target.value))),
              )
            }
            className="h-8 w-16 rounded-md border bg-transparent px-2 text-center font-mono text-[12px] outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <button
          onClick={() => setUppercase(!uppercase)}
          className={cn(
            "rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
            uppercase
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Uppercase
        </button>

        <div className="flex-1" />

        <button
          onClick={copyAll}
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {copiedAll ? (
            <Check className="h-2.5 w-2.5 text-success" />
          ) : (
            <Copy className="h-2.5 w-2.5" />
          )}
          Copy all
        </button>
      </div>

      <div className="rounded-lg border">
        {displayUuids.map((uuid, idx) => (
          <div
            key={idx}
            className="group flex items-center justify-between border-b px-4 py-2.5 last:border-0 hover:bg-card/60"
          >
            <span className="font-mono text-[13px] text-foreground/90">
              {uuid}
            </span>
            <button
              onClick={() => copyOne(idx)}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground opacity-0 transition-all hover:bg-secondary hover:text-foreground group-hover:opacity-100"
            >
              {copiedIdx === idx ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
