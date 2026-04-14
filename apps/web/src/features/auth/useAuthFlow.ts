import { useState } from "react";
import {
  confirmPasswordReset,
  login,
  logout,
  logoutAll,
  register,
  requestPasswordReset,
  rotateSession,
  whoAmI,
  type AuthActor
} from "@/lib/api/auth";
import type { ApiError } from "@/lib/api/client";
import { toast } from "sonner";

type AuthMode = "login" | "register";
type Translate = (key: string) => string;

export function useAuthFlow(t: Translate) {
  const isDevEnvironment = import.meta.env.DEV;
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [actor, setActor] = useState<AuthActor | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formInfo, setFormInfo] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [issuedResetToken, setIssuedResetToken] = useState<string | null>(null);
  const [recoveryRequested, setRecoveryRequested] = useState(false);

  function mapApiError(error: unknown) {
    const apiError = (typeof error === "object" && error ? (error as ApiError) : null) ?? null;
    const message = apiError?.message ?? "";
    if (message.includes("password must be at least 8 characters")) {
      return t("auth.errorPasswordShort");
    }
    if (message.includes("email is invalid")) {
      return t("auth.errorEmailInvalid");
    }
    if (message.includes("credential already exists")) {
      return t("auth.errorCredentialExists");
    }
    if (message.includes("role must be one of")) {
      return t("auth.errorRoleInvalid");
    }
    if (message.includes("invalid credentials")) {
      return t("auth.errorInvalidCredentials");
    }
    if (message.includes("password reset token is invalid")) {
      return t("auth.errorResetTokenInvalid");
    }
    if (message.includes("session cookie is required")) {
      return t("auth.errorSessionExpired");
    }
    if (apiError?.status === 401) {
      return t("auth.errorSessionExpired");
    }
    return t("auth.errorGeneric");
  }

  function validateForm() {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return t("auth.errorEmailInvalid");
    }
    if (!password.trim()) {
      return t("auth.errorPasswordRequired");
    }
    if (mode === "register" && password.trim().length < 8) {
      return t("auth.errorPasswordShort");
    }
    return null;
  }

  async function submit() {
    setFormError(null);
    setFormInfo(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result =
        mode === "login"
          ? await login({ email, password })
          : await register({ email, password, role: "contributor" });
      setActor(result.actor);
      const message = mode === "login" ? t("auth.loginSuccess") : t("auth.registerSuccess");
      setFormInfo(message);
      toast.success(message);
      return true;
    } catch (error) {
      const parsedMessage = mapApiError(error);
      setFormError(parsedMessage);
      toast.error(parsedMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function loadCurrentSession() {
    setLoading(true);
    try {
      const result = await whoAmI();
      setActor(result.actor);
      setFormError(null);
      setFormInfo(t("auth.sessionLoaded"));
      toast.success(t("auth.sessionLoaded"));
    } catch {
      setActor(null);
      setFormInfo(t("auth.errorSessionExpired"));
    } finally {
      setLoading(false);
    }
  }

  async function clearCurrentSession() {
    setLoading(true);
    try {
      await logout();
      setActor(null);
      setFormError(null);
      setFormInfo(t("auth.logoutSuccess"));
      toast.success(t("auth.logoutSuccess"));
    } catch {
      toast.error(t("auth.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  async function clearAllSessions() {
    setLoading(true);
    setFormError(null);
    setFormInfo(null);
    try {
      await logoutAll();
      setActor(null);
      const message = t("auth.logoutAllSuccess");
      setFormInfo(message);
      toast.success(message);
    } catch (error) {
      const parsedMessage = mapApiError(error);
      setFormError(parsedMessage);
      toast.error(parsedMessage);
    } finally {
      setLoading(false);
    }
  }

  async function rotateCurrentSession() {
    setLoading(true);
    setFormError(null);
    setFormInfo(null);
    try {
      await rotateSession();
      const message = t("auth.rotateSuccess");
      setFormInfo(message);
      toast.success(message);
    } catch (error) {
      const parsedMessage = mapApiError(error);
      setFormError(parsedMessage);
      toast.error(parsedMessage);
    } finally {
      setLoading(false);
    }
  }

  async function requestRecovery() {
    if (!email.trim()) {
      setFormError(t("auth.errorEmailInvalid"));
      return;
    }

    setLoading(true);
    setFormError(null);
    setFormInfo(null);
    try {
      const result = await requestPasswordReset({ email: email.trim() });
      if (isDevEnvironment && result.resetToken) {
        setIssuedResetToken(result.resetToken);
      }
      setRecoveryRequested(true);
      const message = t("auth.resetRequested");
      setFormInfo(message);
      toast.success(message);
    } catch (error) {
      const parsedMessage = mapApiError(error);
      setFormError(parsedMessage);
      toast.error(parsedMessage);
    } finally {
      setLoading(false);
    }
  }

  async function confirmRecovery() {
    if (!resetToken.trim()) {
      setFormError(t("auth.errorResetTokenRequired"));
      return;
    }
    if (resetPassword.trim().length < 8) {
      setFormError(t("auth.errorPasswordShort"));
      return;
    }

    setLoading(true);
    setFormError(null);
    setFormInfo(null);
    try {
      await confirmPasswordReset({ token: resetToken.trim(), newPassword: resetPassword.trim() });
      setResetToken("");
      setResetPassword("");
      setIssuedResetToken(null);
      setRecoveryRequested(false);
      const message = t("auth.resetConfirmed");
      setFormInfo(message);
      toast.success(message);
    } catch (error) {
      const parsedMessage = mapApiError(error);
      setFormError(parsedMessage);
      toast.error(parsedMessage);
    } finally {
      setLoading(false);
    }
  }

  return {
    mode,
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    actor,
    formError,
    formInfo,
    isDevEnvironment,
    recoveryRequested,
    resetToken,
    setResetToken,
    resetPassword,
    setResetPassword,
    issuedResetToken,
    submit,
    loadCurrentSession,
    clearCurrentSession,
    clearAllSessions,
    rotateCurrentSession,
    requestRecovery,
    confirmRecovery
  };
}
