import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { AuthFormCard } from "./AuthFormCard";
import { useAuthFlow } from "./useAuthFlow";

export function AuthPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuthFlow(t);
  const isSessionRequiredNotice =
    typeof location.state === "object" &&
    location.state !== null &&
    "authReason" in location.state &&
    location.state.authReason === "required";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const didAuthenticate = await auth.submit();
    if (didAuthenticate && auth.mode === "login") {
      navigate("/dashboard");
    }
  }

  return (
    <section className="page">
      <h2>{t("auth.title")}</h2>
      <p>{t("auth.subtitle")}</p>
      {isSessionRequiredNotice ? (
        <p className="auth-feedback auth-feedback-info">{t("auth.loginRequiredNotice")}</p>
      ) : null}
      <AuthFormCard
        mode={auth.mode}
        setMode={auth.setMode}
        email={auth.email}
        setEmail={auth.setEmail}
        password={auth.password}
        setPassword={auth.setPassword}
        loading={auth.loading}
        actor={auth.actor}
        formError={auth.formError}
        formInfo={auth.formInfo}
        onSubmit={handleSubmit}
        t={t}
      />
    </section>
  );
}
