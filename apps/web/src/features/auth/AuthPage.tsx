import type { FormEvent } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { AuthFormCard } from "./AuthFormCard";
import { useAuthFlow } from "./useAuthFlow";

export function AuthPage() {
  const { t } = useLanguage();
  const auth = useAuthFlow(t);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await auth.submit();
  }

  return (
    <section className="page">
      <h2>{t("auth.title")}</h2>
      <p>{t("auth.subtitle")}</p>
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
        onLoadSession={auth.loadCurrentSession}
        onLogout={auth.clearCurrentSession}
        t={t}
      />
    </section>
  );
}
