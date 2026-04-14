import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Link } from "react-router-dom";
import { useSecuritySettingsFlow } from "./useSecuritySettingsFlow";

export function SecuritySettingsPage() {
  const { t } = useLanguage();
  const security = useSecuritySettingsFlow(t);

  return (
    <section className="page">
      <h2>{t("settings.security.title")}</h2>
      <p className="dashboard-subtitle">{t("settings.security.subtitle")}</p>

      {security.formError ? <p className="auth-feedback auth-feedback-error">{security.formError}</p> : null}
      {!security.formError && security.formInfo ? (
        <p className="auth-feedback auth-feedback-info">{security.formInfo}</p>
      ) : null}
      {!security.sessionsLoading && !security.actor ? (
        <Card>
          <CardContent className="stack">
            <p className="auth-helper">{t("auth.errorSessionExpired")}</p>
            <Button asChild>
              <Link to="/auth">{t("nav.auth")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.security.sessionTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="stack">
          <p className="auth-helper">{t("settings.security.sessionIntro")}</p>
          {security.sessionsLoading ? <p>{t("settings.security.loading")}</p> : null}
          {security.actor ? (
            <p>
              {t("settings.security.currentAccessLabel")}: <strong>{security.actor.email}</strong> ({security.actor.role})
            </p>
          ) : null}
          <div className="meta-row">
            <Button variant="secondary" onClick={security.loadProfileAndSessions} disabled={security.loading}>
              {t("settings.security.refreshAction")}
            </Button>
            <Button variant="ghost" onClick={security.handleRotateSession} disabled={security.loading}>
              {t("settings.security.rotateAction")}
            </Button>
            <Button variant="ghost" onClick={security.handleLogout} disabled={security.loading}>
              {t("settings.security.logoutCurrentAction")}
            </Button>
            <Button variant="ghost" onClick={security.handleLogoutAll} disabled={security.loading}>
              {t("settings.security.logoutAllAction")}
            </Button>
          </div>

          <div className="stack">
            {security.sessions.map((session) => (
              <div className="settings-session-row" key={session.id}>
                <div>
                  <p className="settings-session-id">
                    {t("settings.security.sessionCodeLabel")}: <code>{session.id.slice(0, 10)}</code>
                  </p>
                  <p className="auth-helper">
                    {session.isCurrent ? t("settings.security.currentBadge") : t("settings.security.otherBadge")} ·{" "}
                    {session.isActive ? t("settings.security.activeBadge") : t("settings.security.revokedBadge")}
                  </p>
                </div>
                {!session.isCurrent ? (
                  <Button
                    variant="destructive"
                    onClick={() => security.handleRevokeSession(session.id)}
                    disabled={security.loading}
                  >
                    {t("settings.security.revokeAction")}
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.security.recoveryTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="stack">
          <p className="auth-helper">{t("settings.security.recoveryIntro")}</p>
          <Button variant="secondary" onClick={security.handleRequestRecovery} disabled={security.loading}>
            {t("settings.security.requestResetAction")}
          </Button>
          {security.recoveryRequested ? (
            <p className="auth-feedback auth-feedback-info">{t("settings.security.recoveryRequestedInfo")}</p>
          ) : null}

          {security.isDevEnvironment ? (
            <details className="auth-dev-reset-tools">
              <summary>{t("settings.security.devToolsToggle")}</summary>
              <div className="stack">
                <p className="auth-helper">{t("settings.security.devToolsHint")}</p>
                {security.issuedResetToken ? (
                  <p className="auth-feedback auth-feedback-info">
                    {t("auth.devResetTokenLabel")}: <code>{security.issuedResetToken}</code>
                  </p>
                ) : null}
                <label className="field-label" htmlFor="settings-reset-token">
                  {t("auth.resetTokenLabel")}
                </label>
                <Input
                  id="settings-reset-token"
                  type="text"
                  placeholder={t("auth.resetTokenPlaceholder")}
                  value={security.resetToken}
                  onChange={(event) => security.setResetToken(event.target.value)}
                />
                <label className="field-label" htmlFor="settings-reset-password">
                  {t("auth.newPasswordLabel")}
                </label>
                <Input
                  id="settings-reset-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t("auth.newPasswordPlaceholder")}
                  value={security.resetPassword}
                  onChange={(event) => security.setResetPassword(event.target.value)}
                />
                <Button onClick={security.handleConfirmRecovery} disabled={security.loading}>
                  {t("auth.confirmResetAction")}
                </Button>
              </div>
            </details>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
