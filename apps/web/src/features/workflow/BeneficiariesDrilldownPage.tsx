import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBeneficiariesWorkflowList } from "@/hooks/useWorkflowLists";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function BeneficiariesDrilldownPage() {
  const { t } = useLanguage();
  const { loading, error, items } = useBeneficiariesWorkflowList();

  return (
    <section className="page">
      <h2>{t("workflow.beneficiaries.title")}</h2>
      <p className="dashboard-muted">{t("workflow.beneficiaries.subtitle")}</p>
      <Card className="dashboard-panel-card">
        <CardHeader>
          <CardTitle>{t("workflow.beneficiaries.listTitle")}</CardTitle>
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
                    {t("workflow.beneficiaries.regionLabel")}: {item.region || "--"}
                  </p>
                  <p className="dashboard-muted">
                    {t("workflow.beneficiaries.validationLabel")}: {item.validationLevel}
                  </p>
                  <p className="dashboard-muted">
                    {t("workflow.beneficiaries.lastDeliveryLabel")}:{" "}
                    {item.lastDeliveryAt ? new Date(item.lastDeliveryAt).toLocaleString() : "--"}
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
