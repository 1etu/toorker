import { useState, useMemo } from "react";
import { RotateCw, Search, Radio, Database, Server, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/use-app-store";
import { detectConflicts, getServiceInfo } from "./port-intelligence";
import { PortTable } from "./port-table";
import {
  usePortScanner,
  REFRESH_OPTIONS,
  type RefreshInterval,
} from "./use-port-scanner";

type CategoryFilter = "all" | "dev" | "database" | "infra" | "system";

const CATEGORY_FILTERS: {
  id: CategoryFilter;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "all", label: "All", icon: Radio },
  { id: "dev", label: "Dev", icon: Cpu },
  { id: "database", label: "Database", icon: Database },
  { id: "infra", label: "Infra", icon: Server },
];

export const Ports = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>("all");
  const {
    ports,
    loading,
    scan,
    killPort,
    refreshInterval,
    setRefreshInterval,
  } = usePortScanner();

  const setActiveToolId = useAppStore((s) => s.setActiveToolId);
  const setPrefillUrl = useAppStore((s) => s.setPrefillUrl);

  const categoryCounts = useMemo(() => {
    const counts = { dev: 0, database: 0, infra: 0, system: 0 };
    for (const p of ports) {
      const info = getServiceInfo(p.port, p.process_name);
      counts[info.category]++;
    }
    return counts;
  }, [ports]);

  const filteredPorts = useMemo(() => {
    let result = ports;

    if (categoryFilter !== "all") {
      result = result.filter((p) => {
        const info = getServiceInfo(p.port, p.process_name);
        return info.category === categoryFilter;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.port.toString().includes(q) ||
          p.process_name.toLowerCase().includes(q) ||
          p.protocol.toLowerCase().includes(q) ||
          (p.executable_path?.toLowerCase().includes(q) ?? false),
      );
    }

    return result;
  }, [ports, search, categoryFilter]);

  const conflicts = useMemo(() => detectConflicts(ports), [ports]);

  const handleOpenInApiTester = (port: number) => {
    setPrefillUrl(`http://localhost:${port}`);
    setActiveToolId("api-tester");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {CATEGORY_FILTERS.map((cat) => {
          const count =
            cat.id === "all"
              ? ports.length
              : categoryCounts[cat.id] ?? 0;
          const isActive = categoryFilter === cat.id;
          const CatIcon = cat.icon;

          return (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-colors",
                isActive
                  ? "border-foreground/10 bg-card"
                  : "hover:bg-card/60",
              )}
            >
              <CatIcon
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground/40",
                )}
              />
              <div>
                <div
                  className={cn(
                    "font-mono text-[14px] font-semibold tabular-nums",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {count}
                </div>
                <div className="text-[10px] text-muted-foreground/50">
                  {cat.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter ports, services, processes..."
            className="h-8 w-full rounded-md border bg-transparent pl-9 pr-3 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center rounded-md border bg-card p-0.5">
          {REFRESH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                setRefreshInterval(opt.value as RefreshInterval)
              }
              className={cn(
                "rounded-[3px] px-2 py-1 text-[11px] font-medium transition-colors",
                refreshInterval === opt.value
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground tabular-nums">
          <span>
            {filteredPorts.length}
            {categoryFilter !== "all" ? ` / ${ports.length}` : ""} port
            {filteredPorts.length !== 1 ? "s" : ""}
          </span>
          {conflicts.length > 0 && (
            <span className="text-warning">
              {conflicts.length} conflict
              {conflicts.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <button
          onClick={scan}
          disabled={loading}
          className="flex h-8 items-center gap-1.5 rounded-md border px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
        >
          <RotateCw
            className={cn("h-3 w-3", loading && "animate-spin")}
          />
          Scan
        </button>
      </div>

      <PortTable
        ports={filteredPorts}
        conflicts={conflicts}
        onKill={killPort}
        onOpenInApiTester={handleOpenInApiTester}
      />
    </div>
  );
};
