import { useHealth } from "../../hooks/useHealth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { toast } from "sonner";

export function DashboardPage() {
  const { t } = useLanguage();
  const { status, error } = useHealth();
  const statusVariant = status === "ok" ? "success" : "error";

  return (
    <section className="page">
      <h2>{t("dashboard.title")}</h2>
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.healthTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="meta-row">
            <strong>{t("dashboard.apiStatus")}</strong>
            <Badge variant={statusVariant}>{status}</Badge>
            <Button
              variant="secondary"
              onClick={() => toast.success(t("dashboard.feedbackToast"))}
              type="button"
            >
              {t("dashboard.feedback")}
            </Button>
          </div>
        </CardContent>
      </Card>
      {error ? (
        <Card>
          <CardContent>
            <p className="error-text">
              {t("dashboard.errorPrefix")}: {error}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
