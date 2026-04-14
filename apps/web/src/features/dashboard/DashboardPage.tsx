import { useHealth } from "../../hooks/useHealth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export function DashboardPage() {
  const { t } = useLanguage();
  const { status, error } = useHealth();
  const statusVariant = status === "ok" ? "success" : "error";
  const impactCards = [
    {
      label: t("dashboard.impactContributorsLabel"),
      value: t("dashboard.impactContributorsValue")
    },
    {
      label: t("dashboard.impactPartnersLabel"),
      value: t("dashboard.impactPartnersValue")
    },
    {
      label: t("dashboard.impactFamiliesLabel"),
      value: t("dashboard.impactFamiliesValue")
    }
  ];
  const flowCards = [
    {
      title: t("dashboard.flowOneTitle"),
      description: t("dashboard.flowOneDescription")
    },
    {
      title: t("dashboard.flowTwoTitle"),
      description: t("dashboard.flowTwoDescription")
    },
    {
      title: t("dashboard.flowThreeTitle"),
      description: t("dashboard.flowThreeDescription")
    }
  ];

  return (
    <section className="page dashboard-page">
      <h2>{t("dashboard.title")}</h2>
      <p className="dashboard-subtitle">{t("dashboard.subtitle")}</p>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>{t("dashboard.welcomeTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="dashboard-muted">{t("dashboard.welcomeBody")}</p>
        </CardContent>
      </Card>

      <section className="dashboard-grid" aria-label={t("dashboard.impactSectionTitle")}>
        {impactCards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle>{card.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="dashboard-muted">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.flowSectionTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="dashboard-grid">
          {flowCards.map((step) => (
            <section key={step.title} className="stack">
              <strong>{step.title}</strong>
              <p className="dashboard-muted">{step.description}</p>
            </section>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.healthTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="meta-row">
            <strong>{t("dashboard.apiStatus")}</strong>
            <Badge variant={statusVariant}>{status}</Badge>
            <Button
              variant="secondary"
              onClick={() => toast.success(t("dashboard.feedbackToast"))}
              type="button"
            >
              {t("dashboard.feedback")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.actionsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="meta-row">
          <Button asChild>
            <Link to="/partners">{t("dashboard.actionPartners")}</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/transparency">{t("dashboard.actionTransparency")}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/settings/security">{t("dashboard.actionAccount")}</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.roadmapTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="stack">
          <p className="dashboard-muted">{t("dashboard.roadmapIntro")}</p>
          <ul className="dashboard-roadmap-list">
            <li>{t("dashboard.roadmapFinance")}</li>
            <li>{t("dashboard.roadmapDistribution")}</li>
            <li>{t("dashboard.roadmapSecurity")}</li>
          </ul>
        </CardContent>
      </Card>
      {error ? (
        <Card>
          <CardContent>
            <p className="error-text">
              {t("dashboard.errorPrefix")}: {error}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
