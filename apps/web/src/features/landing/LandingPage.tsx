import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const impactStats = [
  { label: "Active contributors", value: "1,240+" },
  { label: "Partner networks", value: "38" },
  { label: "Families supported", value: "5,800+" }
];

const flowSteps = [
  {
    title: "People contribute monthly",
    description:
      "Supporters subscribe with a value they can sustain. Every contribution is converted into real food impact."
  },
  {
    title: "Funds become basket capacity",
    description:
      "The platform calculates operational capacity and allocation by region with transparent conversion logic."
  },
  {
    title: "Partners deliver locally",
    description:
      "Local partners identify and deliver to families with dignity, speed, and accountable reporting."
  }
];

export function LandingPage() {
  return (
    <section className="landing">
      <div className="landing-hero surface-card">
        <div className="landing-kicker-row">
          <Badge>Decentralized mutual aid</Badge>
          <span className="landing-kicker">Community powered infrastructure</span>
        </div>

        <h2 className="landing-title">From people to people, with traceable impact.</h2>
        <p className="landing-subtitle">
          Rede Colmeia transforms recurring contributions into essential food baskets through local
          community networks. Fast, transparent, and built for collective action.
        </p>

        <div className="landing-cta-row">
          <Button asChild>
            <Link to="/auth">Become a contributor</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/transparency">View public transparency</Link>
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
          <h3>How the network works</h3>
          <p>
            A simple and accountable operating cycle that scales without losing local autonomy.
          </p>
        </div>
        <div className="landing-flow-grid">
          {flowSteps.map((step, index) => (
            <Card key={step.title}>
              <CardHeader>
                <span className="landing-step-pill">Step {index + 1}</span>
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
            <h3>No one stands alone.</h3>
            <p>
              Start with one contribution, one partner, one family. The network expands with every
              action.
            </p>
          </div>
          <div className="landing-cta-row">
            <Button asChild variant="secondary">
              <Link to="/partners">Partner with Rede Colmeia</Link>
            </Button>
            <Button asChild variant="primary">
              <Link to="/auth">Start now</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
