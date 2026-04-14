import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { AuthPage } from "../features/auth/AuthPage";
import { LandingPage } from "../features/landing/LandingPage";
import { PartnersPage } from "../features/partners/PartnersPage";
import { TransparencyPage } from "../features/transparency/TransparencyPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "partners", element: <PartnersPage /> },
      { path: "transparency", element: <TransparencyPage /> },
      { path: "auth", element: <AuthPage /> }
    ]
  }
]);
