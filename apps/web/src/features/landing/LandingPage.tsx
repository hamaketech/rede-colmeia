import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useLandingVariant } from "@/lib/landing/useLandingVariant";
import { Link } from "react-router-dom";

export function LandingPage() {
  const { t } = useLanguage();
  const { variant, abTestEnabled } = useLandingVariant();
  const impactStats = [
    { label: t("landing.statContributors"), value: "1,240+" },
    { label: t("landing.statPartners"), value: "38" },
    { label: t("landing.statFamilies"), value: "5,800+" }
  ];

  const flowSteps = [
    {
      title: t("landing.flow1Title"),
      description: t("landing.flow1Description")
    },
    {
      title: t("landing.flow2Title"),
      description: t("landing.flow2Description")
    },
    {
      title: t("landing.flow3Title"),
      description: t("landing.flow3Description")
    }
  ];

  return (
    <section className={`landing${variant === "campaign-dark" ? " landing-campaign-dark" : ""}`}>
      <div className="landing-hero surface-card">
        <div className="landing-kicker-row">
          <Badge>{t("landing.badge")}</Badge>
          {abTestEnabled ? (
            <Badge variant="warning">
              {variant === "campaign-dark" ? "Campaign B" : "Campaign A"}
            </Badge>
          ) : null}
          <span className="landing-kicker">{t("landing.kicker")}</span>
        </div>

        <h2 className="landing-title">{t("landing.title")}</h2>
        <p className="landing-subtitle">{t("landing.subtitle")}</p>

        <div className="landing-cta-row">
          <Button asChild>
            <Link to="/auth">{t("landing.ctaPrimary")}</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/transparency">{t("landing.ctaSecondary")}</Link>
          </Button>
        </div>
      </div>

      <div className="landing-grid">
        {impactStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle>{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="landing-stat-label">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="landing-section">
        <div className="landing-section-header">
          <h3>{t("landing.flowTitle")}</h3>
          <p>{t("landing.flowSubtitle")}</p>
        </div>
        <div className="landing-flow-grid">
          {flowSteps.map((step, index) => (
            <Card key={step.title}>
              <CardHeader>
                <span className="landing-step-pill">
                  {t("landing.step")} {index + 1}
                </span>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="landing-final-cta">
        <CardContent className="landing-final-content">
          <div>
            <h3>{t("landing.finalTitle")}</h3>
            <p>{t("landing.finalBody")}</p>
          </div>
          <div className="landing-cta-row">
            <Button asChild variant="secondary">
              <Link to="/partners">{t("landing.finalPartnerCta")}</Link>
            </Button>
            <Button asChild variant="primary">
              <Link to="/auth">{t("landing.finalStartCta")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
