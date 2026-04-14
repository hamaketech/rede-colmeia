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
  const insightCards = [
    {
      label: t("dashboard.insightCoverage"),
      value: t("dashboard.insightCoverageValue"),
      progress: 86
    },
    {
      label: t("dashboard.insightActivation"),
      value: t("dashboard.insightActivationValue"),
      progress: 72
    },
    {
      label: t("dashboard.insightResponse"),
      value: t("dashboard.insightResponseValue"),
      progress: 64
    }
  ];
  const pipeline = [
    { label: t("dashboard.pipelineQueued"), value: 21 },
    { label: t("dashboard.pipelinePreparing"), value: 14 },
    { label: t("dashboard.pipelineDelivery"), value: 9 },
    { label: t("dashboard.pipelineDone"), value: 37 }
  ];

  return (
    <section className="page dashboard-page">
      <header className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <p className="dashboard-eyebrow">{t("dashboard.title")}</p>
          <h2 className="dashboard-title">{t("dashboard.welcomeTitle")}</h2>
          <p className="dashboard-subtitle">{t("dashboard.subtitle")}</p>
        </div>
        <div className="dashboard-hero-status">
          <span className="dashboard-status-label">{t("dashboard.apiStatus")}</span>
          <Badge variant={statusVariant}>{status}</Badge>
        </div>
      </header>

      <Card className="surface-card dashboard-surface-card">
        <CardHeader>
          <CardTitle>{t("dashboard.welcomeTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="dashboard-muted">{t("dashboard.welcomeBody")}</p>
        </CardContent>
      </Card>

      <section className="dashboard-section">
        <header className="dashboard-section-head">
          <h3>{t("dashboard.impactSectionTitle")}</h3>
        </header>
        <section className="dashboard-grid" aria-label={t("dashboard.impactSectionTitle")}>
          {impactCards.map((card) => (
            <Card key={card.label} className="dashboard-stat-card">
              <CardHeader>
                <CardTitle>{card.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="dashboard-muted">{card.label}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </section>

      <Card className="dashboard-panel-card">
        <CardHeader>
          <CardTitle>{t("dashboard.sectionInsights")}</CardTitle>
        </CardHeader>
        <CardContent className="stack">
          <p className="dashboard-muted">{t("dashboard.sectionInsightsHint")}</p>
          <section className="dashboard-grid">
            {insightCards.map((insight) => (
              <article key={insight.label} className="dashboard-insight-card">
                <p className="dashboard-muted">{insight.label}</p>
                <strong className="dashboard-insight-value">{insight.value}</strong>
                <div className="dashboard-progress-track" aria-hidden="true">
                  <div className="dashboard-progress-fill" style={{ width: `${insight.progress}%` }} />
                </div>
              </article>
            ))}
          </section>
        </CardContent>
      </Card>

      <Card className="dashboard-panel-card">
        <CardHeader>
          <CardTitle>{t("dashboard.flowSectionTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="dashboard-grid">
          {flowCards.map((step) => (
            <section key={step.title} className="stack dashboard-flow-card">
              <strong>{step.title}</strong>
              <p className="dashboard-muted">{step.description}</p>
            </section>
          ))}
        </CardContent>
      </Card>

      <Card className="dashboard-panel-card">
        <CardHeader>
          <CardTitle>{t("dashboard.pipelineTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="stack">
          <section className="dashboard-pipeline-grid">
            {pipeline.map((step) => (
              <article key={step.label} className="dashboard-pipeline-card">
                <strong>{step.value}</strong>
                <p className="dashboard-muted">{step.label}</p>
              </article>
            ))}
          </section>
          <div className="meta-row dashboard-status-row">
            <strong>{t("dashboard.apiStatus")}</strong>
            <Badge variant={statusVariant}>{status}</Badge>
            <Button variant="secondary" onClick={() => toast.success(t("dashboard.feedbackToast"))} type="button">
              {t("dashboard.feedback")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="dashboard-split-grid">
        <Card className="dashboard-panel-card">
          <CardHeader>
            <CardTitle>{t("dashboard.actionsTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="dashboard-action-grid">
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

        <Card className="dashboard-panel-card">
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
      </section>

      {error ? (
        <Card className="dashboard-panel-card">
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
