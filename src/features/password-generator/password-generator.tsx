import { useState, useCallback } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

type CharsetKey = keyof typeof CHARSETS;

function generatePassword(
  length: number,
  charsets: Set<CharsetKey>,
): string {
  let pool = "";
  for (const key of charsets) pool += CHARSETS[key];
  if (!pool) return "";

  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => pool[n % pool.length]).join("");
}

function getStrength(
  pw: string,
  charsets: Set<CharsetKey>,
): { label: string; color: string; percent: number } {
  const len = pw.length;
  const poolSize =
    Array.from(charsets).reduce(
      (sum, k) => sum + CHARSETS[k].length,
      0,
    ) || 1;
  const entropy = len * Math.log2(poolSize);

  if (entropy < 28)
    return { label: "Weak", color: "bg-red-400", percent: 20 };
  if (entropy < 36)
    return { label: "Fair", color: "bg-orange-400", percent: 40 };
  if (entropy < 60)
    return { label: "Good", color: "bg-amber-400", percent: 60 };
  if (entropy < 80)
    return { label: "Strong", color: "bg-emerald-400", percent: 80 };
  return { label: "Very Strong", color: "bg-emerald-400", percent: 100 };
}

const CHARSET_LABELS: { key: CharsetKey; label: string }[] = [
  { key: "uppercase", label: "A-Z" },
  { key: "lowercase", label: "a-z" },
  { key: "numbers", label: "0-9" },
  { key: "symbols", label: "!@#" },
];

export const PasswordGenerator = () => {
  const [length, setLength] = useState(20);
  const [charsets, setCharsets] = useState<Set<CharsetKey>>(
    new Set(["uppercase", "lowercase", "numbers", "symbols"]),
  );
  const [count, setCount] = useState(5);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const toggleCharset = (key: CharsetKey) => {
    const next = new Set(charsets);
    if (next.has(key) && next.size > 1) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setCharsets(next);
  };

  const generate = useCallback(() => {
    setPasswords(
      Array.from({ length: count }, () =>
        generatePassword(length, charsets),
      ),
    );
  }, [length, count, charsets]);

  const copyOne = async (idx: number) => {
    await navigator.clipboard.writeText(passwords[idx]!);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(passwords.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  useState(() => {
    setPasswords(
      Array.from({ length: count }, () =>
        generatePassword(length, charsets),
      ),
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground/50">
            Length
          </span>
          <input
            type="number"
            min={4}
            max={128}
            value={length}
            onChange={(e) =>
              setLength(
                Math.max(4, Math.min(128, parseInt(e.target.value) || 4)),
              )
            }
            className="h-8 w-16 rounded-md border bg-card px-2 text-center font-mono text-[13px] outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-0.5">
          {CHARSET_LABELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleCharset(key)}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-colors",
                charsets.has(key)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground/30 hover:text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground/50">
            Count
          </span>
          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) =>
              setCount(
                Math.max(1, Math.min(20, parseInt(e.target.value) || 1)),
              )
            }
            className="h-8 w-14 rounded-md border bg-card px-2 text-center font-mono text-[13px] outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex-1" />

        <button
          onClick={generate}
          className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Generate
        </button>

        {passwords.length > 1 && (
          <button
            onClick={copyAll}
            className="flex h-8 items-center gap-1.5 rounded-md border px-3 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {copiedAll ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            Copy All
          </button>
        )}
      </div>
          
      {passwords.length > 0 && (
        <div className="space-y-1">
          {passwords.map((pw, i) => {
            const strength = getStrength(pw, charsets);
            return (
              <div
                key={i}
                className="group flex items-center gap-3 rounded-md border px-3 py-2"
              >
                <span className="flex-1 truncate font-mono text-[13px] tracking-wide text-foreground/80">
                  {pw}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1 w-12 rounded-full bg-secondary">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          strength.color,
                        )}
                        style={{ width: `${strength.percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground/40">
                      {strength.label}
                    </span>
                  </div>
                  <button
                    onClick={() => copyOne(i)}
                    className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground/30 opacity-0 transition-all hover:text-foreground group-hover:opacity-100"
                  >
                    {copiedIdx === i ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
