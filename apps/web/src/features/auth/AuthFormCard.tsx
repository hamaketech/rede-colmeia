import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AuthActor } from "@/lib/api/auth";

type AuthMode = "login" | "register";

type AuthFormCardProps = {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  loading: boolean;
  actor: AuthActor | null;
  formError: string | null;
  formInfo: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onLoadSession: () => void;
  onLogout: () => void;
  t: (key: string) => string;
};

export function AuthFormCard({
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
  onSubmit,
  onLoadSession,
  onLogout,
  t
}: AuthFormCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="stack">
        <div className="meta-row">
          <Button
            type="button"
            variant={mode === "login" ? "primary" : "secondary"}
            onClick={() => setMode("login")}
          >
            {t("auth.loginTab")}
          </Button>
          <Button
            type="button"
            variant={mode === "register" ? "primary" : "secondary"}
            onClick={() => setMode("register")}
          >
            {t("auth.registerTab")}
          </Button>
        </div>

        <form className="stack" onSubmit={onSubmit}>
          {formError ? <p className="auth-feedback auth-feedback-error">{formError}</p> : null}
          {!formError && formInfo ? <p className="auth-feedback auth-feedback-info">{formInfo}</p> : null}

          <label className="field-label" htmlFor="auth-email">
            {t("auth.emailLabel")}
          </label>
          <Input
            id="auth-email"
            type="email"
            autoComplete="email"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label className="field-label" htmlFor="auth-password">
            {t("auth.passwordLabel")}
          </label>
          <Input
            id="auth-password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={t("auth.passwordPlaceholder")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {mode === "register" ? <p className="auth-helper">{t("auth.passwordRuleHint")}</p> : null}

          <Button type="submit" disabled={loading}>
            {mode === "login" ? t("auth.loginAction") : t("auth.registerAction")}
          </Button>
        </form>

        <div className="meta-row">
          <Button type="button" variant="secondary" onClick={onLoadSession} disabled={loading}>
            {t("auth.whoAmIAction")}
          </Button>
          <Button type="button" variant="ghost" onClick={onLogout} disabled={loading}>
            {t("auth.logoutAction")}
          </Button>
        </div>

        {actor ? (
          <p>
            {t("auth.currentSession")}: <strong>{actor.email}</strong> ({actor.role})
          </p>
        ) : (
          <p>{t("auth.noSessionHint")}</p>
        )}
      </CardContent>
    </Card>
  );
}
