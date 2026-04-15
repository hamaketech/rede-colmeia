import { usePartnersWorkflowList } from "@/hooks/useWorkflowLists";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { PartnerWorkflowItem } from "@/lib/api/ops";
import { WorkflowDrilldownPage } from "./WorkflowDrilldownPage";

export function PartnersDrilldownPage() {
  const { t } = useLanguage();

  return (
    <WorkflowDrilldownPage<PartnerWorkflowItem>
      title={t("workflow.partners.title")}
      subtitle={t("workflow.partners.subtitle")}
      listTitle={t("workflow.partners.listTitle")}
      statusOptions={[
        { value: "active", label: "active" },
        { value: "pending", label: "pending" },
        { value: "paused", label: "paused" }
      ]}
      sortOptions={[
        { value: "newest", label: t("workflow.filters.sortNewest") },
        { value: "oldest", label: t("workflow.filters.sortOldest") },
        { value: "name_asc", label: t("workflow.filters.sortNameAsc") },
        { value: "name_desc", label: t("workflow.filters.sortNameDesc") }
      ]}
      useList={usePartnersWorkflowList}
      getItemKey={(item) => item.id}
      renderItem={(item) => (
        <>
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
        </>
      )}
    />
  );
}
