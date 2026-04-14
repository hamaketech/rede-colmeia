import { useState } from "react";
import { login, logout, register, whoAmI, type AuthActor } from "@/lib/api/auth";
import { toast } from "sonner";

type AuthMode = "login" | "register";
type Translate = (key: string) => string;

export function useAuthFlow(t: Translate) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [actor, setActor] = useState<AuthActor | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formInfo, setFormInfo] = useState<string | null>(null);

  function mapApiError(message: string) {
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
    } catch (error) {
      const message =
        typeof error === "object" && error && "message" in error ? String(error.message) : "";
      const parsedMessage = mapApiError(message);
      setFormError(parsedMessage);
      toast.error(parsedMessage);
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
      setFormInfo(t("auth.noSession"));
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
    submit,
    loadCurrentSession,
    clearCurrentSession
  };
}
