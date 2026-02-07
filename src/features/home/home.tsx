import { useState, useEffect, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { tools, CATEGORIES } from "@/lib/tool-registry";
import { useAppStore } from "@/stores/use-app-store";
import type { ToolDefinition } from "@/types/tool";


interface SystemStats {
  portCount: number;
  processCount: number;
  totalMemoryKb: number;
  topProcesses: Array<{ name: string; memoryKb: number }>;
  hostname: string;
  localIp: string;
}


function formatMemory(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  if (kb < 1024 * 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${(kb / (1024 * 1024)).toFixed(1)} GB`;
}


export const Home = () => {
  const { setActiveToolId, recentToolIds } = useAppStore();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ports, processes, network] = await Promise.all([
          invoke<Array<{ port: number }>>( "scan_all_listening_ports"),
          invoke<Array<{ name: string; memory_kb: number }>>("list_processes"),
          invoke<{ local_ip: string; hostname: string }>("get_network_overview"),
        ]);

        const memByName = new Map<string, number>();
        let totalMem = 0;
        for (const p of processes) {
          memByName.set(p.name, (memByName.get(p.name) ?? 0) + p.memory_kb);
          totalMem += p.memory_kb;
        }

        const topProcesses = Array.from(memByName.entries())
          .map(([name, memoryKb]) => ({ name, memoryKb }))
          .sort((a, b) => b.memoryKb - a.memoryKb)
          .slice(0, 5);

        setStats({
          portCount: ports.length,
          processCount: processes.length,
          totalMemoryKb: totalMem,
          topProcesses,
          hostname: network.hostname,
          localIp: network.local_ip,
        });
      } catch {
        // stats are optional
      } finally {
        setStatsLoading(false);
      }
    };
    load();
  }, []);

  const recentTools = useMemo(
    () =>
      recentToolIds
        .map((id) => tools.find((t) => t.id === id))
        .filter((t): t is ToolDefinition => Boolean(t))
        .slice(0, 6),
    [recentToolIds],
  );

  const toolsByCategory = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        ...cat,
        tools: tools.filter((t) => t.category === cat.id),
      })).filter((cat) => cat.tools.length > 0),
    [],
  );

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-[15px] font-semibold text-foreground">
          Toorker
        </h1>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          {tools.length} tools available
        </p>
      </div>

      <section>
        <SectionHeader>System</SectionHeader>
        {statsLoading ? (
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-lg border bg-card"
              />
            ))}
          </div>
        ) : stats ? (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <StatCard
                value={stats.portCount}
                label="Ports"
                sub="listening"
                onClick={() => setActiveToolId("ports")}
              />
              <StatCard
                value={stats.processCount}
                label="Processes"
                sub="running"
                onClick={() => setActiveToolId("processes")}
              />
              <StatCard
                value={formatMemory(stats.totalMemoryKb)}
                label="Memory"
                sub="allocated"
              />
              <StatCard
                value={stats.hostname}
                label={stats.localIp}
                sub="host"
                mono={false}
              />
            </div>

            <div className="rounded-lg border p-3">
              <div className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                Memory by Process
              </div>
              <div className="space-y-2">
                {stats.topProcesses.map((proc) => (
                  <div
                    key={proc.name}
                    className="flex items-center gap-3"
                  >
                    <span className="w-28 truncate font-mono text-[11px] text-muted-foreground">
                      {proc.name}
                    </span>
                    <div className="h-1 flex-1 rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary/50"
                        style={{
                          width: `${Math.round((proc.memoryKb / stats.topProcesses[0]!.memoryKb) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="w-16 text-right font-mono text-[10px] tabular-nums text-muted-foreground">
                      {formatMemory(proc.memoryKb)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {recentTools.length > 0 && (
        <section>
          <SectionHeader>Recently Used</SectionHeader>
          <div className="grid grid-cols-3 gap-2">
            {recentTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onClick={() => setActiveToolId(tool.id)}
              />
            ))}
          </div>
        </section>
      )}

      {toolsByCategory.map((cat) => (
        <section key={cat.id}>
          <SectionHeader>{cat.label}</SectionHeader>
          <div className="grid grid-cols-3 gap-2">
            {cat.tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onClick={() => setActiveToolId(tool.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

      
const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50">
    {children}
  </h2>
);

const StatCard = ({
  value,
  label,
  sub,
  mono = true,
  onClick,
}: {
  value: string | number;
  label: string;
  sub: string;
  mono?: boolean;
  onClick?: () => void;
}) => {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "rounded-lg border p-3 text-left transition-colors",
        onClick && "hover:bg-card",
      )}
    >
      <div
        className={cn(
          "text-[15px] font-semibold text-foreground",
          mono && "font-mono tabular-nums",
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">
        {label}
      </div>
      <div className="text-[10px] text-muted-foreground/40">{sub}</div>
    </Comp>
  );
};

const ToolCard = ({
  tool,
  onClick,
}: {
  tool: ToolDefinition;
  onClick: () => void;
}) => {
  const Icon = (Icons as any)[tool.icon] ?? Icons.Box;

  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-card"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
        <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-foreground">
          {tool.name}
        </div>
        <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
          {tool.description}
        </div>
      </div>
    </button>
  );
};
