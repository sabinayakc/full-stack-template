import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { SERVER_URL } from "@/constants/app";

type HealthStatus = "checking" | "healthy" | "unreachable";

export function useHealthCheck() {
  const [status, setStatus] = useState<HealthStatus>("checking");

  const check = useCallback(async () => {
    setStatus("checking");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${SERVER_URL}/api/health`, {
        method: "GET",
        signal: controller.signal,
      });
      setStatus(res.ok ? "healthy" : "unreachable");
    } catch {
      setStatus("unreachable");
    } finally {
      clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active" && status === "unreachable") check();
    });
    return () => sub.remove();
  }, [status, check]);

  return { status, retry: check };
}
