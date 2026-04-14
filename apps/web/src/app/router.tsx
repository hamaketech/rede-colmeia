import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { AuthPage } from "../features/auth/AuthPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { PartnersPage } from "../features/partners/PartnersPage";
import { TransparencyPage } from "../features/transparency/TransparencyPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "partners", element: <PartnersPage /> },
      { path: "transparency", element: <TransparencyPage /> },
      { path: "auth", element: <AuthPage /> }
    ]
  }
]);
