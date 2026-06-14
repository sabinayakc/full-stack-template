/** biome-ignore-all lint/suspicious/noExplicitAny: Generic API Helper */

import { fetch } from "expo/fetch";
import { Platform } from "react-native";
import { SERVER_URL } from "../constants/app";
import { authClient } from "./auth";

export { SERVER_URL };

function extractErrorMessage(payload: any, status: number): string {
  if (typeof payload === "string" && payload.length > 0) return payload;
  if (!payload || typeof payload !== "object") return `API error: ${status}`;

  if (typeof payload.message === "string") return payload.message;

  const err = payload.error;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const parts: string[] = [];
    for (const [field, value] of Object.entries(err)) {
      const msg = Array.isArray(value) ? value.join(", ") : String(value);
      parts.push(`${field}: ${msg}`);
    }
    if (parts.length > 0) return parts.join("; ");
  }

  return `API error: ${status}`;
}

export async function fetchWithAuth(path: string, init?: RequestInit): Promise<any> {
  const isWeb = Platform.OS === "web";
  const cookies = !isWeb ? authClient.getCookie() : null;
  const isGet = !init?.method || init.method === "GET";
  const res = await fetch(`${SERVER_URL}/api${path}`, {
    ...init,
    credentials: isWeb ? "include" : "omit",
    ...(isGet && !isWeb ? { cache: "no-store" as RequestCache } : {}),
    headers: {
      "Content-Type": "application/json",
      ...(cookies ? { Cookie: cookies } : {}),
      ...init?.headers,
    },
  });
  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error(extractErrorMessage(payload, res.status));
  }

  return payload;
}

export async function fetchPublic(path: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`${SERVER_URL}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
