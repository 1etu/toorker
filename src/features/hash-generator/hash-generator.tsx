import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";

const ALGORITHMS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
type Algorithm = (typeof ALGORITHMS)[number];

async function computeHash(
  text: string,
  algorithm: Algorithm,
): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const HashGenerator = () => {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<Algorithm, string>>({
    "SHA-1": "",
    "SHA-256": "",
    "SHA-384": "",
    "SHA-512": "",
  });
  const [copiedAlg, setCopiedAlg] = useState<Algorithm | null>(null);

  useEffect(() => {
    if (!input) {
      setHashes({
        "SHA-1": "",
        "SHA-256": "",
        "SHA-384": "",
        "SHA-512": "",
      });
      return;
    }

    const compute = async () => {
      const results: Record<string, string> = {};
      for (const alg of ALGORITHMS) {
        results[alg] = await computeHash(input, alg);
      }
      setHashes(results as Record<Algorithm, string>);
    };
    compute();
  }, [input]);

  const copy = async (alg: Algorithm) => {
    if (!hashes[alg]) return;
    await navigator.clipboard.writeText(hashes[alg]);
    setCopiedAlg(alg);
    setTimeout(() => setCopiedAlg(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Input
        </span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash..."
          spellCheck={false}
          className="h-28 w-full resize-none rounded-lg border bg-card p-3 font-mono text-[12px] leading-relaxed outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
        />
      </div>
        
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Hashes
        </span>
        <div className="rounded-lg border">
          {ALGORITHMS.map((alg) => (
            <div
              key={alg}
              className="group flex items-center gap-3 border-b px-4 py-2.5 last:border-0"
            >
              <span className="w-16 shrink-0 text-[11px] font-medium text-muted-foreground">
                {alg}
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground/80">
                {hashes[alg] || (
                  <span className="text-muted-foreground/30">—</span>
                )}
              </span>
              <button
                onClick={() => copy(alg)}
                disabled={!hashes[alg]}
                className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground opacity-0 transition-all hover:bg-secondary hover:text-foreground group-hover:opacity-100 disabled:opacity-0"
              >
                {copiedAlg === alg ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
