const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export type ApiError = {
  message: string;
  status: number;
};

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw {
      message: `request failed: ${response.statusText}`,
      status: response.status
    } as ApiError;
  }
  return (await response.json()) as T;
}
