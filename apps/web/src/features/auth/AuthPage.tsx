import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function AuthPage() {
  const { t } = useLanguage();

  return (
    <section className="page">
      <h2>{t("auth.title")}</h2>
      <p>{t("auth.subtitle")}</p>
    </section>
  );
}
