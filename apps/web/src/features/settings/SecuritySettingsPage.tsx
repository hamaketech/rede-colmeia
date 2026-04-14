import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
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

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.security.sessionTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="stack">
          {security.sessionsLoading ? <p>{t("settings.security.loading")}</p> : null}
          {security.actor ? (
            <p>
              {t("auth.currentSession")}: <strong>{security.actor.email}</strong> ({security.actor.role})
            </p>
          ) : null}
          <div className="meta-row">
            <Button variant="secondary" onClick={security.loadProfileAndSessions} disabled={security.loading}>
              {t("settings.security.refreshAction")}
            </Button>
            <Button variant="ghost" onClick={security.handleRotateSession} disabled={security.loading}>
              {t("auth.rotateAction")}
            </Button>
            <Button variant="ghost" onClick={security.handleLogout} disabled={security.loading}>
              {t("auth.logoutAction")}
            </Button>
            <Button variant="ghost" onClick={security.handleLogoutAll} disabled={security.loading}>
              {t("auth.logoutAllAction")}
            </Button>
          </div>

          <div className="stack">
            {security.sessions.map((session) => (
              <div className="settings-session-row" key={session.id}>
                <div>
                  <p className="settings-session-id">{session.id}</p>
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
          <p className="auth-helper">{t("auth.recoveryEmailReadyInfo")}</p>
          <Button variant="secondary" onClick={security.handleRequestRecovery} disabled={security.loading}>
            {t("auth.requestResetAction")}
          </Button>
          {security.recoveryRequested ? (
            <p className="auth-feedback auth-feedback-info">{t("settings.security.recoveryRequestedInfo")}</p>
          ) : null}

          {security.isDevEnvironment ? (
            <details className="auth-dev-reset-tools">
              <summary>{t("auth.devResetToolsToggle")}</summary>
              <div className="stack">
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
