import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface PortEntry {
  port: number;
  protocol: string;
  pid: number;
  process_name: string;
  executable_path: string | null;
}

export type RefreshInterval = 0 | 2000 | 5000 | 10000;

export const REFRESH_OPTIONS: { label: string; value: RefreshInterval }[] = [
  { label: "Off", value: 0 },
  { label: "2s", value: 2000 },
  { label: "5s", value: 5000 },
  { label: "10s", value: 10000 },
];

export function usePortScanner() {
  const [ports, setPorts] = useState<PortEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<PortEntry[]>("scan_all_listening_ports");
      setPorts(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    scan();
  }, [scan]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (refreshInterval > 0) {
      intervalRef.current = setInterval(scan, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshInterval, scan]);

  const killPort = useCallback(
    async (port: number) => {
      try {
        await invoke("kill_by_port", { port });
        await scan();
      } catch (err) {
        setError(String(err));
      }
    },
    [scan],
  );

  return {
    ports,
    loading,
    error,
    scan,
    killPort,
    refreshInterval,
    setRefreshInterval,
  };
}
