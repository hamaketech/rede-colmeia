import { useCallback, useEffect, useState } from "react";
import {
  confirmPasswordReset,
  listSessions,
  logout,
  logoutAll,
  requestPasswordReset,
  revokeSessionByID,
  rotateSession,
  whoAmI,
  type AuthActor,
  type AuthSession
} from "@/lib/api/auth";
import type { ApiError } from "@/lib/api/client";
import { toast } from "sonner";

type Translate = (key: string) => string;

export function useSecuritySettingsFlow(t: Translate) {
  const isDevEnvironment = import.meta.env.DEV;
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [actor, setActor] = useState<AuthActor | null>(null);
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formInfo, setFormInfo] = useState<string | null>(null);
  const [recoveryRequested, setRecoveryRequested] = useState(false);
  const [issuedResetToken, setIssuedResetToken] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState("");
  const [resetPassword, setResetPassword] = useState("");

  const mapApiError = useCallback(
    (error: unknown) => {
      const apiError = (typeof error === "object" && error ? (error as ApiError) : null) ?? null;
      const message = apiError?.message ?? "";
      if (message.includes("password must be at least 8 characters")) {
        return t("auth.errorPasswordShort");
      }
      if (message.includes("password reset token is invalid")) {
        return t("auth.errorResetTokenInvalid");
      }
      if (message.includes("reset request is temporarily throttled")) {
        return t("auth.errorResetThrottled");
      }
      if (apiError?.status === 401) {
        return t("auth.errorSessionExpired");
      }
      return t("auth.errorGeneric");
    },
    [t]
  );

  const loadProfileAndSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const [actorResponse, sessionsResponse] = await Promise.all([whoAmI(), listSessions()]);
      setActor(actorResponse.actor);
      setSessions(sessionsResponse.sessions);
      setFormError(null);
    } catch (error) {
      const parsedMessage = mapApiError(error);
      setFormError(parsedMessage);
    } finally {
      setSessionsLoading(false);
    }
  }, [mapApiError]);

  useEffect(() => {
    void loadProfileAndSessions();
  }, [loadProfileAndSessions]);

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
      setFormError(null);
      setFormInfo(t("auth.logoutSuccess"));
      toast.success(t("auth.logoutSuccess"));
      window.dispatchEvent(new Event("auth-changed"));
      await loadProfileAndSessions();
    } catch (error) {
      const parsedMessage = mapApiError(error);
      setFormError(parsedMessage);
      toast.error(parsedMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogoutAll() {
    setLoading(true);
    try {
      await logoutAll();
      setFormError(null);
      setFormInfo(t("auth.logoutAllSuccess"));
      toast.success(t("auth.logoutAllSuccess"));
      window.dispatchEvent(new Event("auth-changed"));
      await loadProfileAndSessions();
    } catch (error) {
      const parsedMessage = mapApiError(error);
      setFormError(parsedMessage);
      toast.error(parsedMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleRotateSession() {
    setLoading(true);
    try {
      await rotateSession();
      setFormError(null);
      setFormInfo(t("auth.rotateSuccess"));
      toast.success(t("auth.rotateSuccess"));
      window.dispatchEvent(new Event("auth-changed"));
      await loadProfileAndSessions();
    } catch (error) {
      const parsedMessage = mapApiError(error);
      setFormError(parsedMessage);
      toast.error(parsedMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevokeSession(sessionId: string) {
    setLoading(true);
    try {
      await revokeSessionByID({ sessionId });
      setFormError(null);
      setFormInfo(t("settings.security.revokeSuccess"));
      toast.success(t("settings.security.revokeSuccess"));
      await loadProfileAndSessions();
    } catch (error) {
      const parsedMessage = mapApiError(error);
      setFormError(parsedMessage);
      toast.error(parsedMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestRecovery() {
    if (!actor?.email) {
      setFormError(t("auth.errorSessionExpired"));
      return;
    }
    setLoading(true);
    try {
      const response = await requestPasswordReset({ email: actor.email });
      setRecoveryRequested(true);
      setIssuedResetToken(isDevEnvironment ? response.resetToken ?? null : null);
      setFormError(null);
      setFormInfo(t("auth.resetRequested"));
      toast.success(t("auth.resetRequested"));
    } catch (error) {
      const parsedMessage = mapApiError(error);
      setFormError(parsedMessage);
      toast.error(parsedMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmRecovery() {
    if (!resetToken.trim()) {
      setFormError(t("auth.errorResetTokenRequired"));
      return;
    }
    if (resetPassword.trim().length < 8) {
      setFormError(t("auth.errorPasswordShort"));
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset({ token: resetToken.trim(), newPassword: resetPassword.trim() });
      setResetToken("");
      setResetPassword("");
      setIssuedResetToken(null);
      setRecoveryRequested(false);
      setFormError(null);
      setFormInfo(t("auth.resetConfirmed"));
      toast.success(t("auth.resetConfirmed"));
      await loadProfileAndSessions();
    } catch (error) {
      const parsedMessage = mapApiError(error);
      setFormError(parsedMessage);
      toast.error(parsedMessage);
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    sessionsLoading,
    actor,
    sessions,
    formError,
    formInfo,
    recoveryRequested,
    issuedResetToken,
    resetToken,
    setResetToken,
    resetPassword,
    setResetPassword,
    isDevEnvironment,
    loadProfileAndSessions,
    handleLogout,
    handleLogoutAll,
    handleRotateSession,
    handleRevokeSession,
    handleRequestRecovery,
    handleConfirmRecovery
  };
}
