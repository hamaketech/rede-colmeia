import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDistributionsWorkflowList } from "@/hooks/useWorkflowLists";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function DistributionsDrilldownPage() {
  const { t } = useLanguage();
  const { loading, error, items } = useDistributionsWorkflowList();

  return (
    <section className="page">
      <h2>{t("workflow.distributions.title")}</h2>
      <p className="dashboard-muted">{t("workflow.distributions.subtitle")}</p>
      <Card className="dashboard-panel-card">
        <CardHeader>
          <CardTitle>{t("workflow.distributions.listTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="stack">
          {loading ? <p className="dashboard-muted">{t("workflow.common.loading")}</p> : null}
          {error ? (
            <p className="error-text">
              {t("workflow.common.error")}: {error}
            </p>
          ) : null}
          {!loading && !error && items.length === 0 ? <p className="dashboard-muted">{t("workflow.common.empty")}</p> : null}
          {!loading && !error && items.length > 0 ? (
            <div className="workflow-list-grid">
              {items.map((item) => (
                <article key={item.id} className="dashboard-flow-card">
                  <strong>{item.id}</strong>
                  <p className="dashboard-muted">
                    {t("workflow.distributions.partnerLabel")}: {item.partnerId || "--"}
                  </p>
                  <p className="dashboard-muted">
                    {t("workflow.distributions.regionLabel")}: {item.region || "--"}
                  </p>
                  <p className="dashboard-muted">
                    {t("workflow.distributions.statusLabel")}: {item.status}
                  </p>
                  <p className="dashboard-muted">
                    {t("workflow.distributions.basketsLabel")}: {item.baskets}
                  </p>
                </article>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
