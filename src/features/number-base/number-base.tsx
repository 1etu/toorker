import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

interface BaseField {
  id: string;
  label: string;
  base: number;
  prefix: string;
}

const BASES: BaseField[] = [
  { id: "dec", label: "Decimal", base: 10, prefix: "" },
  { id: "hex", label: "Hexadecimal", base: 16, prefix: "0x" },
  { id: "oct", label: "Octal", base: 8, prefix: "0o" },
  { id: "bin", label: "Binary", base: 2, prefix: "0b" },
];

export const NumberBase = () => {
  const [values, setValues] = useState<Record<string, string>>({
    dec: "",
    hex: "",
    oct: "",
    bin: "",
  });
  const [activeField, setActiveField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const updateFrom = useCallback((fieldId: string, input: string) => {
    const field = BASES.find((b) => b.id === fieldId)!;

    if (!input.trim()) {
      setValues({ dec: "", hex: "", oct: "", bin: "" });
      setError(null);
      return;
    }

    //
    let clean = input.trim();
    if (field.base === 16) clean = clean.replace(/^0x/i, "");
    if (field.base === 8) clean = clean.replace(/^0o/i, "");
    if (field.base === 2) clean = clean.replace(/^0b/i, "");

    try {
      const num = BigInt(
        field.base === 10
          ? clean
          : `0${field.base === 16 ? "x" : field.base === 8 ? "o" : "b"}${clean}`,
      );

      if (num < 0n) {
        setError("Negative numbers not supported");
        setValues((prev) => ({ ...prev, [fieldId]: input }));
        return;
      }

      setError(null);
      setValues({
        dec: num.toString(10),
        hex: num.toString(16).toUpperCase(),
        oct: num.toString(8),
        bin: num.toString(2),
        [fieldId]: input,
      });
    } catch {
      setError(`Invalid ${field.label.toLowerCase()} value`);
      setValues((prev) => ({ ...prev, [fieldId]: input }));
    }
  }, []);

  const copyValue = async (fieldId: string) => {
    const val = values[fieldId] ?? "";
    if (!val) return;
    await navigator.clipboard.writeText(val);
    setCopied(fieldId);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {BASES.map((field) => (
          <div key={field.id} className="flex items-center gap-2">
            <div className="w-24 shrink-0">
              <div className="text-[11px] font-medium text-muted-foreground">
                {field.label}
              </div>
              {field.prefix && (
                <div className="font-mono text-[10px] text-muted-foreground/30">
                  {field.prefix}
                </div>
              )}
            </div>
            <input
              value={
                activeField === field.id
                  ? values[field.id] ?? ""
                  : values[field.id] ?? ""
              }
              onChange={(e) => {
                setActiveField(field.id);
                updateFrom(field.id, e.target.value);
              }}
              onFocus={() => setActiveField(field.id)}
              placeholder="0"
              spellCheck={false}
              className="h-9 flex-1 rounded-md border bg-card px-3 font-mono text-[13px] outline-none placeholder:text-muted-foreground/30 focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={() => copyValue(field.id)}
              disabled={!values[field.id]}
              className="flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground/40 transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
            >
              {copied === field.id ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        ))}
      </div>

      {values.bin && (
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground/40 tabular-nums">
          <span>{values.bin.replace(/^0b/i, "").length} bits</span>
          <span>
            {Math.ceil(values.bin.replace(/^0b/i, "").length / 8)} bytes
          </span>
        </div>
      )}
    </div>
  );
};
