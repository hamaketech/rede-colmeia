import { useEffect, useState } from "react";
import {
  getBeneficiariesWorkflowList,
  getDistributionsWorkflowList,
  getPartnersWorkflowList,
  type BeneficiaryWorkflowItem,
  type DistributionWorkflowItem,
  type PartnerWorkflowItem
} from "@/lib/api/ops";

type WorkflowListState<T> = {
  loading: boolean;
  error: string | null;
  items: T[];
};

export function usePartnersWorkflowList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<PartnerWorkflowItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    getPartnersWorkflowList()
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
  }, []);

  return { loading, error, items } satisfies WorkflowListState<PartnerWorkflowItem>;
}

export function useBeneficiariesWorkflowList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<BeneficiaryWorkflowItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    getBeneficiariesWorkflowList()
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
  }, []);

  return { loading, error, items } satisfies WorkflowListState<BeneficiaryWorkflowItem>;
}

export function useDistributionsWorkflowList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<DistributionWorkflowItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    getDistributionsWorkflowList()
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
  }, []);

  return { loading, error, items } satisfies WorkflowListState<DistributionWorkflowItem>;
}
