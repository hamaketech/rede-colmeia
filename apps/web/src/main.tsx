import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Sonner } from "./components/ui/sonner";
import { router } from "./app/router";
import { LanguageProvider } from "./lib/i18n/LanguageProvider";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
        <Sonner />
      </ErrorBoundary>
    </LanguageProvider>
  </React.StrictMode>
);
