import { useHealth } from "../../hooks/useHealth";

export function DashboardPage() {
  const { status, error } = useHealth();

  return (
    <section>
      <h2>Dashboard</h2>
      <p>API health: {status}</p>
      {error ? <p>Health check error: {error}</p> : null}
    </section>
  );
}
