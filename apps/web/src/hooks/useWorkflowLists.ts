import { useEffect, useState } from "react";
import {
  getBeneficiariesWorkflowList,
  getDistributionsWorkflowList,
  getPartnersWorkflowList,
  type BeneficiaryWorkflowItem,
  type DistributionWorkflowItem,
  type PartnerWorkflowItem,
  type WorkflowListParams
} from "@/lib/api/ops";

export type WorkflowListState<T> = {
  loading: boolean;
  error: string | null;
  items: T[];
};

function useWorkflowList<T>(
  params: WorkflowListParams,
  fetcher: (params: WorkflowListParams) => Promise<{ items: T[] }>
): WorkflowListState<T> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const status = params.status ?? "";
  const region = params.region ?? "";
  const sort = params.sort ?? "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetcher({ page, pageSize, status, region, sort })
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setItems(payload.items);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : "could not load workflow list");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, status, region, sort, fetcher]);

  return { loading, error, items };
}

export function usePartnersWorkflowList(params: WorkflowListParams) {
  return useWorkflowList<PartnerWorkflowItem>(params, getPartnersWorkflowList);
}

export function useBeneficiariesWorkflowList(params: WorkflowListParams) {
  return useWorkflowList<BeneficiaryWorkflowItem>(params, getBeneficiariesWorkflowList);
}

export function useDistributionsWorkflowList(params: WorkflowListParams) {
  return useWorkflowList<DistributionWorkflowItem>(params, getDistributionsWorkflowList);
}
