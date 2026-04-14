import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { whoAmI } from "@/lib/api/auth";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    let active = true;
    void whoAmI()
      .then(() => {
        if (active) {
          setStatus("authenticated");
        }
      })
      .catch(() => {
        if (active) {
          setStatus("unauthenticated");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return <section className="page">{t("auth.verifyingSession")}</section>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/auth" state={{ authReason: "required" }} replace />;
  }

  return <>{children}</>;
}
