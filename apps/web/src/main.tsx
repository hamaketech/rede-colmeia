import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Sonner } from "./components/ui/sonner";
import { router } from "./app/router";
import { LanguageProvider } from "./lib/i18n/LanguageProvider";
import { VisualModeProvider } from "./lib/theme/VisualModeProvider";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
      <VisualModeProvider>
        <ErrorBoundary>
          <RouterProvider router={router} />
          <Sonner />
        </ErrorBoundary>
      </VisualModeProvider>
    </LanguageProvider>
  </React.StrictMode>
);
