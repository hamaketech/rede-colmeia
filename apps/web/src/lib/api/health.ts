import { apiGet } from "./client";

export type HealthResponse = {
  status: string;
};

export function getHealthStatus() {
  return apiGet<HealthResponse>("/health");
}
