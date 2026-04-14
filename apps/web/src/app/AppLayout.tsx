import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useLanguage, type LanguageCode } from "@/lib/i18n/LanguageProvider";
import { logout, whoAmI, type AuthActor } from "@/lib/api/auth";
import { useVisualMode } from "@/lib/theme/VisualModeProvider";

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
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
  const workspaceLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `workspace-link${isActive ? " workspace-link-active" : ""}`;
  const [actor, setActor] = useState<AuthActor | null>(null);
  const isWorkspaceRoute = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/settings");
  const isAuthenticated = actor !== null;

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await whoAmI();
        if (active) {
          setActor(response.actor);
        }
      } catch {
        if (active) {
          setActor(null);
        }
      }
    };

    void refresh();
    const onAuthChanged = () => void refresh();
    window.addEventListener("auth-changed", onAuthChanged);
    return () => {
      active = false;
      window.removeEventListener("auth-changed", onAuthChanged);
    };
  }, [location.pathname]);

  const actorLabel = useMemo(() => {
    if (!actor) {
      return "";
    }
    const localPart = actor.email.split("@")[0] ?? actor.email;
    return localPart.length > 18 ? `${localPart.slice(0, 18)}...` : localPart;
  }, [actor]);

  async function handleSignOut() {
    try {
      await logout();
    } finally {
      setActor(null);
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/auth");
    }
  }

  return (
    <div className={`layout${isWorkspaceRoute ? " layout-workspace" : ""}`}>
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
          <p className="app-nav-label">{t("nav.publicLabel")}</p>
          <nav className="app-nav" aria-label={t("nav.publicLabel")}>
            <NavLink className={linkClassName} to="/">
              {t("nav.home")}
            </NavLink>
            <NavLink className={linkClassName} to="/partners">
              {t("nav.partners")}
            </NavLink>
            <NavLink className={linkClassName} to="/transparency">
              {t("nav.transparency")}
            </NavLink>
            {isAuthenticated ? (
              <button className="nav-link nav-link-quiet" type="button" onClick={handleSignOut}>
                {t("nav.signout")}
              </button>
            ) : (
              <NavLink className={linkClassName} to="/auth">
                {t("nav.auth")}
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      {isAuthenticated ? (
        <section className="workspace-shell" aria-label={t("nav.workspaceLabel")}>
          <div className="workspace-head">
            <strong>
              {t("nav.workspaceTitle")} · {actorLabel}
            </strong>
            <p>{isWorkspaceRoute ? t("nav.workspaceHint") : t("nav.workspaceReturnHint")}</p>
          </div>
          <nav className="workspace-nav" aria-label={t("nav.workspaceLabel")}>
            <NavLink className={workspaceLinkClassName} to="/dashboard">
              {t("nav.dashboard")}
            </NavLink>
            <NavLink className={workspaceLinkClassName} to="/settings/security">
              {t("nav.settings")}
            </NavLink>
          </nav>
        </section>
      ) : null}
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
