import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function TransparencyPage() {
  const { t } = useLanguage();

  return (
    <section className="page">
      <h2>{t("transparency.title")}</h2>
      <p>{t("transparency.subtitle")}</p>
    </section>
  );
}
