import { NavLink, Outlet } from "react-router-dom";
import { useLanguage, type LanguageCode } from "@/lib/i18n/LanguageProvider";

export function AppLayout() {
  const { language, setLanguage, languagePriority, t } = useLanguage();
  const flags: Record<LanguageCode, string> = {
    pt: "🇧🇷",
    es: "🇪🇸",
    en: "🇺🇸"
  };

  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    `nav-link${isActive ? " nav-link-active" : ""}`;

  return (
    <div className="layout">
      <header className="app-header">
        <div className="app-header-top">
          <div>
            <h1 className="brand-title">Rede Colmeia</h1>
            <p className="brand-subtitle">{t("app.tagline")}</p>
          </div>
          <div className="language-switch" role="group" aria-label={t("nav.languageLabel")}>
            <span>{t("nav.languageLabel")}</span>
            <div className="language-flag-group">
              {languagePriority.map((option) => {
                const isActive = language === option.code;
                return (
                  <button
                    key={option.code}
                    type="button"
                    className={`language-flag-button${isActive ? " language-flag-button-active" : ""}`}
                    onClick={() => setLanguage(option.code)}
                    aria-label={option.label}
                    aria-pressed={isActive}
                    title={option.label}
                  >
                    <span className="language-flag-icon" aria-hidden="true">
                      {flags[option.code]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <nav className="app-nav" aria-label="Primary navigation">
          <NavLink className={linkClassName} to="/">
            {t("nav.home")}
          </NavLink>
          <NavLink className={linkClassName} to="/partners">
            {t("nav.partners")}
          </NavLink>
          <NavLink className={linkClassName} to="/transparency">
            {t("nav.transparency")}
          </NavLink>
          <NavLink className={linkClassName} to="/auth">
            {t("nav.auth")}
          </NavLink>
        </nav>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
