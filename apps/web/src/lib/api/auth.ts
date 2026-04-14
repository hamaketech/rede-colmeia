import { apiGet, apiPost } from "./client";

export type AuthRole = "admin" | "contributor" | "partner";

export type AuthActor = {
  email: string;
  role: AuthRole;
};

type AuthEnvelope = {
  status: string;
  actor: AuthActor;
};

export function register(payload: { email: string; password: string; role?: AuthRole }) {
  return apiPost<AuthEnvelope, { email: string; password: string; role?: AuthRole }>(
    "/api/v1/auth/register",
    payload
  );
}

export function login(payload: { email: string; password: string }) {
  return apiPost<AuthEnvelope, { email: string; password: string }>("/api/v1/auth/login", payload);
}

export function logout() {
  return apiPost<{ status: string }, Record<string, never>>("/api/v1/auth/logout", {});
}

export function whoAmI() {
  return apiGet<AuthEnvelope>("/api/v1/auth/whoami");
}
