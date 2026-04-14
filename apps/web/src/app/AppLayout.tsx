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
  const cvdCompactIcons: Record<(typeof cvdModes)[number]["id"], string> = {
    none: "◌",
    protanopia: "P",
    deuteranopia: "D",
    tritanopia: "T"
  };

  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    `nav-link${isActive ? " nav-link-active" : ""}`;

  return (
    <div className="layout">
      <header className="app-header">
        <div className="app-header-main">
          <div className="app-brand-block">
            <h1 className="brand-title">Rede Colmeia</h1>
            <p className="brand-subtitle">{t("app.tagline")}</p>
          </div>
          <div className="utility-toolbar" aria-label="Personalization controls">
            <label className="sr-only" htmlFor="language-select">
              {t("nav.languageLabel")}
            </label>
            <select
              id="language-select"
              className="utility-select"
              aria-label={t("nav.languageLabel")}
              value={language}
              onChange={(event) => setLanguage(event.target.value as LanguageCode)}
            >
              {languagePriority.map((option) => (
                <option key={option.code} value={option.code}>
                  {flags[option.code]}
                </option>
              ))}
            </select>
            {visualModesEnabled ? (
              <>
                <label className="sr-only" htmlFor="theme-select">
                  {t("nav.visualLabel")}
                </label>
                <select
                  id="theme-select"
                  className="utility-select utility-select-icon"
                  aria-label={t("nav.visualLabel")}
                  value={themeMode}
                  onChange={(event) =>
                    setThemeMode(event.target.value as (typeof themeModes)[number]["id"])
                  }
                >
                  {themeModes.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.id === "light" ? "☀" : "☾"}
                    </option>
                  ))}
                </select>

                <label className="sr-only" htmlFor="cvd-select">
                  {t("nav.cvdLabel")}
                </label>
                <select
                  id="cvd-select"
                  className="utility-select utility-select-icon"
                  aria-label={t("nav.cvdLabel")}
                  value={cvdMode}
                  onChange={(event) => setCvdMode(event.target.value as (typeof cvdModes)[number]["id"])}
                >
                  {cvdModes.map((option) => (
                    <option key={option.id} value={option.id}>
                      {cvdCompactIcons[option.id] ?? option.compactLabel}
                    </option>
                  ))}
                </select>
              </>
            ) : null}
          </div>
        </div>
        <div className="app-nav-shell">
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
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
