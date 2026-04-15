import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePartnersWorkflowList } from "@/hooks/useWorkflowLists";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function PartnersDrilldownPage() {
  const { t } = useLanguage();
  const { loading, error, items } = usePartnersWorkflowList();

  return (
    <section className="page">
      <h2>{t("workflow.partners.title")}</h2>
      <p className="dashboard-muted">{t("workflow.partners.subtitle")}</p>
      <Card className="dashboard-panel-card">
        <CardHeader>
          <CardTitle>{t("workflow.partners.listTitle")}</CardTitle>
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
                  <strong>{item.name}</strong>
                  <p className="dashboard-muted">
                    {t("workflow.partners.regionLabel")}: {item.region || "--"}
                  </p>
                  <p className="dashboard-muted">
                    {t("workflow.partners.statusLabel")}: {item.status}
                  </p>
                  <p className="dashboard-muted">
                    {t("workflow.partners.capacityLabel")}: {item.capacityMonthlyBaskets}
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
