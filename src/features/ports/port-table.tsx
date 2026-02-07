import { useState } from "react";
import {
  Copy,
  Check,
  Send,
  Trash2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getServiceInfo,
  type ServiceCategory,
} from "./port-intelligence";
import { ProcessDetail } from "./process-detail";
import type { PortEntry } from "./use-port-scanner";
import type { Conflict } from "./port-intelligence";

interface PortTableProps {
  ports: PortEntry[];
  conflicts: Conflict[];
  onKill: (port: number) => void;
  onOpenInApiTester: (port: number) => void;
}

const CATEGORY_DOT: Record<ServiceCategory, string> = {
  dev: "bg-blue-400",
  database: "bg-emerald-400",
  infra: "bg-amber-400",
  system: "bg-muted-foreground/40",
};

const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  dev: "Development",
  database: "Database",
  infra: "Infrastructure",
  system: "System",
};

export const PortTable = ({
  ports,
  conflicts,
  onKill,
  onOpenInApiTester,
}: PortTableProps) => {
  const [expandedPort, setExpandedPort] = useState<number | null>(null);
  const [copiedPort, setCopiedPort] = useState<number | null>(null);
  const [confirmKill, setConfirmKill] = useState<number | null>(null);

  const conflictSet = new Set(conflicts.map((c) => c.port));

  const copyUrl = async (port: number) => {
    await navigator.clipboard.writeText(`http://localhost:${port}`);
    setCopiedPort(port);
    setTimeout(() => setCopiedPort(null), 1500);
  };

  const handleKill = (port: number) => {
    if (confirmKill === port) {
      onKill(port);
      setConfirmKill(null);
    } else {
      setConfirmKill(port);
      setTimeout(() => setConfirmKill(null), 3000);
    }
  };

  if (ports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-20 text-center">
        <div className="mb-2 text-muted-foreground/20">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="15" x2="16" y2="15" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>
        <p className="text-[13px] text-muted-foreground">
          No listening ports detected
        </p>
        <p className="text-[11px] text-muted-foreground/40">
          Start a dev server or database to see ports here
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b bg-card">
            <th className="w-6 px-2 py-2.5" />
            <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              Service
            </th>
            <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              Port
            </th>
            <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              Proto
            </th>
            <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              Process
            </th>
            <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              PID
            </th>
            <th className="w-[100px] px-3 py-2.5 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {ports.map((entry) => {
            const service = getServiceInfo(
              entry.port,
              entry.process_name,
            );
            const isExpanded = expandedPort === entry.port;
            const isConflict = conflictSet.has(entry.port);

            return (
              <RowGroup key={`${entry.port}-${entry.pid}`}>
                <tr
                  className={cn(
                    "group cursor-pointer border-b transition-colors last:border-0",
                    isConflict
                      ? "bg-warning/[0.03] hover:bg-warning/[0.06]"
                      : "hover:bg-card/60",
                  )}
                  onClick={() =>
                    setExpandedPort(isExpanded ? null : entry.port)
                  }
                >
                  <td className="px-2 py-2.5">
                    <ChevronRight
                      className={cn(
                        "h-3 w-3 text-muted-foreground/30 transition-transform",
                        isExpanded && "rotate-90 text-muted-foreground",
                      )}
                    />
                  </td>

                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          CATEGORY_DOT[service.category],
                        )}
                        title={CATEGORY_LABEL[service.category]}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-foreground">
                            {service.name}
                          </span>
                          {isConflict && (
                            <AlertTriangle className="h-3 w-3 text-warning" />
                          )}
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground/50">
                          {service.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-2.5">
                    <span className="font-mono tabular-nums text-foreground/80">
                      {entry.port}
                    </span>
                  </td>

                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[11px] text-muted-foreground/50">
                      {entry.protocol}
                    </span>
                  </td>

                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[12px] text-muted-foreground">
                      {entry.process_name}
                    </span>
                  </td>

                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[12px] tabular-nums text-muted-foreground/50">
                      {entry.pid}
                    </span>
                  </td>

                  <td
                    className="px-3 py-2.5 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <ActionButton
                        title="Copy localhost URL"
                        onClick={() => copyUrl(entry.port)}
                      >
                        {copiedPort === entry.port ? (
                          <Check className="h-3 w-3 text-success" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </ActionButton>
                      <ActionButton
                        title="Open in API Tester"
                        onClick={() => onOpenInApiTester(entry.port)}
                      >
                        <Send className="h-3 w-3" />
                      </ActionButton>
                      <ActionButton
                        title={
                          confirmKill === entry.port
                            ? "Click again to confirm"
                            : "Kill process"
                        }
                        onClick={() => handleKill(entry.port)}
                        variant={
                          confirmKill === entry.port
                            ? "destructive"
                            : "default"
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                      </ActionButton>
                    </div>
                  </td>
                </tr>

                {isExpanded && (
                  <tr>
                    <td colSpan={7}>
                      <ProcessDetail entry={entry} />
                    </td>
                  </tr>
                )}
              </RowGroup>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const RowGroup = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

const ActionButton = ({
  children,
  title,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={cn(
      "flex h-6 w-6 items-center justify-center rounded transition-colors",
      variant === "destructive"
        ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
    )}
  >
    {children}
  </button>
);
