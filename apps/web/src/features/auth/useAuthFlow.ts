import { useState } from "react";
import {
  login,
  register,
  type AuthActor
} from "@/lib/api/auth";
import type { ApiError } from "@/lib/api/client";
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
    if (message.includes("reset request is temporarily throttled")) {
      return t("auth.errorResetThrottled");
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
      window.dispatchEvent(new Event("auth-changed"));
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
    submit
  };
}
