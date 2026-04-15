import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { WorkflowListParams } from "@/lib/api/ops";
import type { WorkflowListState } from "@/hooks/useWorkflowLists";

type Option = {
  value: string;
  label: string;
};

type WorkflowDrilldownPageProps<T> = {
  title: string;
  subtitle: string;
  listTitle: string;
  statusOptions: Option[];
  sortOptions: Option[];
  useList: (params: WorkflowListParams) => WorkflowListState<T>;
  getItemKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
};

export function WorkflowDrilldownPage<T>({
  title,
  subtitle,
  listTitle,
  statusOptions,
  sortOptions,
  useList,
  getItemKey,
  renderItem
}: WorkflowDrilldownPageProps<T>) {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") ?? "";
  const region = searchParams.get("region") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");
  const { loading, error, items } = useList({
    page,
    pageSize,
    status,
    region,
    sort
  });

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    if (key !== "page") {
      next.set("page", "1");
    }
    setSearchParams(next);
  }

  return (
    <section className="page">
      <h2>{title}</h2>
      <p className="dashboard-muted">{subtitle}</p>
      <Card className="dashboard-panel-card">
        <CardContent className="workflow-controls">
          <label className="field-label">
            {t("workflow.filters.status")}
            <select value={status} onChange={(event) => updateFilter("status", event.target.value)} className="utility-select">
              <option value="">{t("workflow.filters.all")}</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            {t("workflow.filters.region")}
            <input
              className="ui-input"
              value={region}
              onChange={(event) => updateFilter("region", event.target.value)}
              placeholder={t("workflow.filters.regionPlaceholder")}
            />
          </label>
          <label className="field-label">
            {t("workflow.filters.sort")}
            <select value={sort} onChange={(event) => updateFilter("sort", event.target.value)} className="utility-select">
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            {t("workflow.filters.pageSize")}
            <select
              value={String(pageSize)}
              onChange={(event) => updateFilter("pageSize", event.target.value)}
              className="utility-select"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </label>
        </CardContent>
      </Card>
      <Card className="dashboard-panel-card">
        <CardHeader>
          <CardTitle>{listTitle}</CardTitle>
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
                <article key={getItemKey(item)} className="dashboard-flow-card">
                  {renderItem(item)}
                </article>
              ))}
            </div>
          ) : null}
          <div className="workflow-pagination">
            <button
              type="button"
              className="ui-button ui-button-ghost"
              onClick={() => updateFilter("page", String(Math.max(1, page - 1)))}
              disabled={page <= 1}
            >
              {t("workflow.pagination.prev")}
            </button>
            <p className="dashboard-muted">
              {t("workflow.pagination.page")} {page}
            </p>
            <button
              type="button"
              className="ui-button ui-button-ghost"
              onClick={() => updateFilter("page", String(page + 1))}
              disabled={loading || items.length < pageSize}
            >
              {t("workflow.pagination.next")}
            </button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
