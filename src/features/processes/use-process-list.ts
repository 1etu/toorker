import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface ProcessInfo {
  pid: number;
  name: string;
  memory_kb: number;
  executable_path: string | null;
}

export type SortField = "name" | "memory" | "pid";
export type SortDir = "asc" | "desc";

export function useProcessList() {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<ProcessInfo[]>("list_processes");
      setProcesses(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const killProcess = useCallback(
    async (pid: number) => {
      try {
        await invoke("kill_process", { pid });
        await refresh();
      } catch (err) {
        setError(String(err));
      }
    },
    [refresh],
  );

  return { processes, loading, error, refresh, killProcess };
}
