import { useEffect, useState } from "react";
import { getHealthStatus } from "../lib/api/health";

export function useHealth() {
  const [status, setStatus] = useState<string>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getHealthStatus()
      .then((response) => {
        if (!cancelled) {
          setStatus(response.status);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setStatus("error");
          setError(err instanceof Error ? err.message : "unknown error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { status, error };
}
