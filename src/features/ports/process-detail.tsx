import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { getPortExplanation } from "./port-intelligence";
import type { PortEntry } from "./use-port-scanner";

interface ProcessDetailProps {
  entry: PortEntry;
}

export const ProcessDetail = ({ entry }: ProcessDetailProps) => {
  const explanation = getPortExplanation(entry.port, entry.process_name);
  const [copied, setCopied] = useState<string | null>(null);

  const copyValue = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const localhost = `http://localhost:${entry.port}`;

  return (
    <div className="border-t bg-card/30 px-4 py-3">
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-[12px]">
        <DetailRow
          label="PID"
          value={String(entry.pid)}
          copied={copied}
          onCopy={copyValue}
          mono
        />
        <DetailRow
          label="URL"
          value={localhost}
          copied={copied}
          onCopy={copyValue}
          mono
        />
        <DetailRow
          label="Executable"
          value={entry.executable_path ?? "N/A"}
          copied={copied}
          onCopy={copyValue}
          mono
        />
        <DetailRow
          label="Info"
          value={explanation}
          copied={copied}
          onCopy={copyValue}
        />
      </div>
    </div>
  );
};

const DetailRow = ({
  label,
  value,
  copied,
  onCopy,
  mono = false,
}: {
  label: string;
  value: string;
  copied: string | null;
  onCopy: (label: string, value: string) => void;
  mono?: boolean;
}) => (
  <div className="group flex items-start gap-2">
    <div className="w-16 shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40 pt-0.5">
      {label}
    </div>
    <div
      className={`min-w-0 flex-1 truncate text-muted-foreground ${mono ? "font-mono" : ""}`}
      title={value}
    >
      {value}
    </div>
    <button
      onClick={() => onCopy(label, value)}
      className="shrink-0 text-muted-foreground/20 opacity-0 transition-opacity hover:text-muted-foreground group-hover:opacity-100"
      title={`Copy ${label}`}
    >
      {copied === label ? (
        <Check className="h-3 w-3 text-success" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  </div>
);
