import { NavLink, Outlet } from "react-router-dom";
import { useLanguage, type LanguageCode } from "@/lib/i18n/LanguageProvider";
import { useVisualMode } from "@/lib/theme/VisualModeProvider";

export function AppLayout() {
  const { language, setLanguage, languagePriority, t } = useLanguage();
  const {
    enabled: visualModesEnabled,
    themeMode,
    setThemeMode,
    cvdMode,
    setCvdMode,
    themeModes,
    cvdModes
  } = useVisualMode();
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
          <div className="app-brand-block">
            <h1 className="brand-title">Rede Colmeia</h1>
            <p className="brand-subtitle">{t("app.tagline")}</p>
          </div>
          <div className="app-controls-stack">
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
            {visualModesEnabled ? (
              <div className="visual-mode-switch" role="group" aria-label="Visual accessibility mode">
                <span>Visual</span>
                <div className="visual-main-group">
                  {themeModes.map((option) => {
                    const isActive = themeMode === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`visual-mode-main-button${isActive ? " visual-mode-main-button-active" : ""}`}
                        onClick={() => setThemeMode(option.id)}
                        aria-label={option.label}
                        aria-pressed={isActive}
                        title={option.label}
                      >
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="visual-mode-compact-group" role="group" aria-label="Color vision filter">
                  {cvdModes.map((option) => {
                    const isActive = cvdMode === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`visual-mode-compact-button${isActive ? " visual-mode-compact-button-active" : ""}`}
                        onClick={() => setCvdMode(option.id)}
                        aria-label={option.label}
                        aria-pressed={isActive}
                        title={option.label}
                      >
                        <span aria-hidden="true">{option.compactLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
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
