import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { AuthPage } from "../features/auth/AuthPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { LandingPage } from "../features/landing/LandingPage";
import { SecuritySettingsPage } from "../features/settings/SecuritySettingsPage";
import { TransparencyPage } from "../features/transparency/TransparencyPage";
import { BeneficiariesDrilldownPage } from "../features/workflow/BeneficiariesDrilldownPage";
import { DistributionsDrilldownPage } from "../features/workflow/DistributionsDrilldownPage";
import { PartnersDrilldownPage } from "../features/workflow/PartnersDrilldownPage";
import { RequireAuth } from "./RequireAuth";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: "dashboard",
        element: (
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        )
      },
      {
        path: "settings/security",
        element: (
          <RequireAuth>
            <SecuritySettingsPage />
          </RequireAuth>
        )
      },
      {
        path: "partners",
        element: (
          <RequireAuth>
            <PartnersDrilldownPage />
          </RequireAuth>
        )
      },
      {
        path: "beneficiaries",
        element: (
          <RequireAuth>
            <BeneficiariesDrilldownPage />
          </RequireAuth>
        )
      },
      {
        path: "distributions",
        element: (
          <RequireAuth>
            <DistributionsDrilldownPage />
          </RequireAuth>
        )
      },
      { path: "transparency", element: <TransparencyPage /> },
      { path: "auth", element: <AuthPage /> }
    ]
  }
]);
