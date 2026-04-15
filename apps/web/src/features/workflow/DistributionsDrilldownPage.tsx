import { useDistributionsWorkflowList } from "@/hooks/useWorkflowLists";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { DistributionWorkflowItem } from "@/lib/api/ops";
import { WorkflowDrilldownPage } from "./WorkflowDrilldownPage";

export function DistributionsDrilldownPage() {
  const { t } = useLanguage();

  return (
    <WorkflowDrilldownPage<DistributionWorkflowItem>
      title={t("workflow.distributions.title")}
      subtitle={t("workflow.distributions.subtitle")}
      listTitle={t("workflow.distributions.listTitle")}
      statusOptions={[
        { value: "planned", label: "planned" },
        { value: "in_progress", label: "in_progress" },
        { value: "confirmed", label: "confirmed" }
      ]}
      sortOptions={[
        { value: "newest", label: t("workflow.filters.sortNewest") },
        { value: "oldest", label: t("workflow.filters.sortOldest") },
        { value: "baskets_desc", label: t("workflow.filters.sortBasketsDesc") },
        { value: "baskets_asc", label: t("workflow.filters.sortBasketsAsc") }
      ]}
      useList={useDistributionsWorkflowList}
      getItemKey={(item) => item.id}
      renderItem={(item) => (
        <>
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
        </>
      )}
    />
  );
}
