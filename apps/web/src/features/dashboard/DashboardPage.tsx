import { useHealth } from "../../hooks/useHealth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function DashboardPage() {
  const { status, error } = useHealth();
  const statusVariant = status === "ok" ? "success" : "error";

  return (
    <section className="page">
      <h2>Dashboard</h2>
      <Card>
        <CardHeader>
          <CardTitle>Platform health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="meta-row">
            <strong>API status</strong>
            <Badge variant={statusVariant}>{status}</Badge>
            <Button
              variant="secondary"
              onClick={() => toast.success("Health check flow is connected.")}
              type="button"
            >
              Test feedback
            </Button>
          </div>
        </CardContent>
      </Card>
      {error ? (
        <Card>
          <CardContent>
          <p className="error-text">Health check error: {error}</p>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
