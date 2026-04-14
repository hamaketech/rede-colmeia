import type { ApiResponse, ApiError as ContractApiError } from "../../../../../packages/contracts/src";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export type ApiError = {
  code?: ContractApiError["code"];
  message: string;
  status: number;
  requestId?: string;
  details?: ContractApiError["details"];
};

function isEnvelope<TData>(payload: unknown): payload is ApiResponse<TData> {
  return typeof payload === "object" && payload !== null && "ok" in payload;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const rawBody = await response.text();
  let parsedBody: unknown = null;
  if (rawBody) {
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      parsedBody = null;
    }
  }

  if (isEnvelope<T>(parsedBody)) {
    if (parsedBody.ok) {
      return parsedBody.data;
    }
    throw {
      status: response.status,
      code: parsedBody.error.code,
      message: parsedBody.error.message,
      requestId: parsedBody.error.requestId,
      details: parsedBody.error.details
    } as ApiError;
  }

  if (!response.ok) {
    throw {
      message: rawBody || `request failed: ${response.statusText}`,
      status: response.status
    } as ApiError;
  }
  return parsedBody as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include"
  });
  return parseResponse<T>(response);
}

export async function apiPost<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  return parseResponse<TResponse>(response);
}
