import { useHealth } from "../../hooks/useHealth";
import { useOpsMetrics } from "@/hooks/useOpsMetrics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export function DashboardPage() {
  const { t } = useLanguage();
  const { status, error } = useHealth();
  const {
    state: metricsState,
    error: metricsError,
    transparencySummary,
    indicators,
    contributionSummary,
    partnerWorkflowSummary,
    beneficiaryWorkflowSummary,
    distributionWorkflowSummary
  } = useOpsMetrics();
  const statusVariant = status === "ok" ? "success" : "error";
  const formatCount = (value: number | undefined) => (typeof value === "number" ? value.toLocaleString() : "--");
  const impactCards = [
    {
      label: t("dashboard.impactContributorsLabel"),
      value: formatCount(transparencySummary?.contributors)
    },
    {
      label: t("dashboard.impactPartnersLabel"),
      value: formatCount(transparencySummary?.partners)
    },
    {
      label: t("dashboard.impactFamiliesLabel"),
      value: formatCount(transparencySummary?.familiesSupported)
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
      value: indicators ? `${indicators.deliveryCoverageRate}%` : "--",
      progress: indicators?.deliveryCoverageRate ?? 0
    },
    {
      label: t("dashboard.insightActivation"),
      value: indicators ? `${indicators.contributorActivationRate}%` : "--",
      progress: indicators?.contributorActivationRate ?? 0
    },
    {
      label: t("dashboard.insightResponse"),
      value: indicators ? `${indicators.averageResponseHours}h` : "--",
      progress: indicators ? Math.max(10, 100 - indicators.averageResponseHours * 2) : 0
    }
  ];
  const pipeline = [
    { label: t("dashboard.pipelineQueued"), value: indicators?.pipeline.queued ?? 0 },
    { label: t("dashboard.pipelinePreparing"), value: indicators?.pipeline.preparing ?? 0 },
    { label: t("dashboard.pipelineDelivery"), value: indicators?.pipeline.inDelivery ?? 0 },
    { label: t("dashboard.pipelineDone"), value: indicators?.pipeline.delivered ?? 0 }
  ];
  const workflowCards = [
    {
      label: t("dashboard.workflowPartners"),
      value: formatCount(partnerWorkflowSummary?.active),
      hint: t("dashboard.workflowPartnersHint"),
      linkTo: "/partners",
      linkLabel: t("dashboard.workflowPartnersAction")
    },
    {
      label: t("dashboard.workflowBeneficiaries"),
      value: formatCount(beneficiaryWorkflowSummary?.validated),
      hint: t("dashboard.workflowBeneficiariesHint"),
      linkTo: "/beneficiaries",
      linkLabel: t("dashboard.workflowBeneficiariesAction")
    },
    {
      label: t("dashboard.workflowDistributions"),
      value: formatCount(distributionWorkflowSummary?.confirmedBaskets),
      hint: t("dashboard.workflowDistributionsHint"),
      linkTo: "/distributions",
      linkLabel: t("dashboard.workflowDistributionsAction")
    }
  ];
  const metricsLastUpdated = transparencySummary?.lastUpdated ?? indicators?.lastUpdated;

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
          {metricsState === "loading" ? <p className="dashboard-muted">{t("dashboard.liveDataLoading")}</p> : null}
          {metricsState === "error" ? <p className="dashboard-muted">{t("dashboard.liveDataUnavailable")}</p> : null}
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
          <p className="dashboard-muted">
            {t("dashboard.impactContributorsLabel")}: {formatCount(contributionSummary?.activeSubscriptions)}
          </p>
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
          <CardTitle>{t("dashboard.workflowSectionTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="dashboard-grid">
          {workflowCards.map((card) => (
            <section key={card.label} className="stack dashboard-flow-card">
              <p className="dashboard-muted">{card.label}</p>
              <strong className="dashboard-insight-value">{card.value}</strong>
              <p className="dashboard-muted">{card.hint}</p>
              <Button variant="ghost" asChild>
                <Link to={card.linkTo}>{card.linkLabel}</Link>
              </Button>
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
          {metricsLastUpdated ? (
            <p className="dashboard-muted">
              {t("dashboard.lastUpdated")}: {new Date(metricsLastUpdated).toLocaleString()}
            </p>
          ) : (
            <p className="dashboard-muted">{t("dashboard.liveDataFallback")}</p>
          )}
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
      {metricsError ? (
        <Card className="dashboard-panel-card">
          <CardContent>
            <p className="error-text">
              {t("dashboard.liveDataUnavailable")}: {metricsError}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
