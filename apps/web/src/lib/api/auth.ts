import { apiGet, apiPost } from "./client";

export type AuthRole = "admin" | "contributor" | "partner";

export type AuthActor = {
  email: string;
  role: AuthRole;
};

type AuthData = {
  actor: AuthActor;
};

export function register(payload: { email: string; password: string; role?: AuthRole }) {
  return apiPost<AuthData, { email: string; password: string; role?: AuthRole }>(
    "/api/v1/auth/register",
    payload
  );
}

export function login(payload: { email: string; password: string }) {
  return apiPost<AuthData, { email: string; password: string }>("/api/v1/auth/login", payload);
}

export function logout() {
  return apiPost<{ message: string }, Record<string, never>>("/api/v1/auth/logout", {});
}

export function whoAmI() {
  return apiGet<AuthData>("/api/v1/auth/whoami");
}

export function logoutAll() {
  return apiPost<{ message: string }, Record<string, never>>("/api/v1/auth/logout-all", {});
}

export function rotateSession() {
  return apiPost<{ message: string }, Record<string, never>>("/api/v1/auth/session/rotate", {});
}

export function requestPasswordReset(payload: { email: string }) {
  return apiPost<{ message: string; resetToken?: string }, { email: string }>(
    "/api/v1/auth/password-reset/request",
    payload
  );
}

export function confirmPasswordReset(payload: { token: string; newPassword: string }) {
  return apiPost<{ message: string }, { token: string; newPassword: string }>(
    "/api/v1/auth/password-reset/confirm",
    payload
  );
}
