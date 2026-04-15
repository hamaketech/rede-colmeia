import { useBeneficiariesWorkflowList } from "@/hooks/useWorkflowLists";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { BeneficiaryWorkflowItem } from "@/lib/api/ops";
import { WorkflowDrilldownPage } from "./WorkflowDrilldownPage";

export function BeneficiariesDrilldownPage() {
  const { t } = useLanguage();

  return (
    <WorkflowDrilldownPage<BeneficiaryWorkflowItem>
      title={t("workflow.beneficiaries.title")}
      subtitle={t("workflow.beneficiaries.subtitle")}
      listTitle={t("workflow.beneficiaries.listTitle")}
      statusOptions={[
        { value: "quick", label: "quick" },
        { value: "validated", label: "validated" }
      ]}
      sortOptions={[
        { value: "newest", label: t("workflow.filters.sortNewest") },
        { value: "oldest", label: t("workflow.filters.sortOldest") },
        { value: "region_asc", label: t("workflow.filters.sortRegionAsc") },
        { value: "region_desc", label: t("workflow.filters.sortRegionDesc") }
      ]}
      useList={useBeneficiariesWorkflowList}
      getItemKey={(item) => item.id}
      renderItem={(item) => (
        <>
          <strong>{item.id}</strong>
          <p className="dashboard-muted">
            {t("workflow.beneficiaries.regionLabel")}: {item.region || "--"}
          </p>
          <p className="dashboard-muted">
            {t("workflow.beneficiaries.validationLabel")}: {item.validationLevel}
          </p>
          <p className="dashboard-muted">
            {t("workflow.beneficiaries.lastDeliveryLabel")}: {item.lastDeliveryAt ? new Date(item.lastDeliveryAt).toLocaleString() : "--"}
          </p>
        </>
      )}
    />
  );
}
