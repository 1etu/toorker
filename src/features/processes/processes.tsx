import { useState, useMemo } from "react";
import { RotateCw, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useProcessList,
  type SortField,
  type SortDir,
} from "./use-process-list";

function formatMemory(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  if (kb < 1024 * 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${(kb / (1024 * 1024)).toFixed(1)} GB`;
}

export const Processes = () => {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("memory");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [confirmKill, setConfirmKill] = useState<number | null>(null);
  const { processes, loading, refresh, killProcess } = useProcessList();

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "name" ? "asc" : "desc");
    }
  };

  const filteredProcesses = useMemo(() => {
    let result = processes;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.pid.toString().includes(q) ||
          (p.executable_path?.toLowerCase().includes(q) ?? false),
      );
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "memory") cmp = a.memory_kb - b.memory_kb;
      else if (sortField === "pid") cmp = a.pid - b.pid;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [processes, search, sortField, sortDir]);

  const totalMemory = useMemo(
    () => processes.reduce((sum, p) => sum + p.memory_kb, 0),
    [processes],
  );

  const handleKill = (pid: number) => {
    if (confirmKill === pid) {
      killProcess(pid);
      setConfirmKill(null);
    } else {
      setConfirmKill(pid);
      setTimeout(() => setConfirmKill(null), 3000);
    }
  };

  const SortHeader = ({
    field,
    label,
    className,
  }: {
    field: SortField;
    label: string;
    className?: string;
  }) => (
    <th
      className={cn(
        "cursor-pointer select-none px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
      onClick={() => toggleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortField === field && (
          <span className="text-foreground">
            {sortDir === "asc" ? "↑" : "↓"}
          </span>
        )}
      </span>
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter processes..."
            className="h-8 w-full rounded-md border bg-transparent pl-9 pr-3 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground tabular-nums">
          <span>{filteredProcesses.length} processes</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{formatMemory(totalMemory)} total</span>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="flex h-8 items-center gap-1.5 rounded-md border px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
        >
          <RotateCw
            className={cn("h-3 w-3", loading && "animate-spin")}
          />
          Refresh
        </button>
      </div>
      
      {filteredProcesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 py-20 text-center">
          <p className="text-[13px] text-muted-foreground">
            No processes found
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-card">
                <SortHeader field="name" label="Process" />
                <SortHeader field="memory" label="Memory" />
                <SortHeader field="pid" label="PID" />
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Path
                </th>
                <th className="w-[60px] px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.map((proc) => (
                <tr
                  key={proc.pid}
                  className="group border-b transition-colors last:border-0 hover:bg-card/60"
                >
                  <td className="px-4 py-2 font-medium text-foreground">
                    {proc.name}
                  </td>
                  <td className="px-4 py-2 font-mono text-[12px] text-muted-foreground tabular-nums">
                    {formatMemory(proc.memory_kb)}
                  </td>
                  <td className="px-4 py-2 font-mono text-[12px] text-muted-foreground tabular-nums">
                    {proc.pid}
                  </td>
                  <td className="max-w-[300px] px-4 py-2">
                    <span
                      className="block truncate font-mono text-[11px] text-muted-foreground/60"
                      title={proc.executable_path ?? ""}
                    >
                      {proc.executable_path ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      title={
                        confirmKill === proc.pid
                          ? "Confirm kill"
                          : "Kill process"
                      }
                      onClick={() => handleKill(proc.pid)}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded opacity-0 transition-all group-hover:opacity-100",
                        confirmKill === proc.pid
                          ? "bg-destructive/10 text-destructive opacity-100"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
