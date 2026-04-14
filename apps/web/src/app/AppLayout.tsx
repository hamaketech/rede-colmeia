import { NavLink, Outlet } from "react-router-dom";

export function AppLayout() {
  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    `nav-link${isActive ? " nav-link-active" : ""}`;

  return (
    <div className="layout">
      <header className="app-header">
        <div className="app-header-top">
          <div>
            <h1 className="brand-title">Rede Colmeia</h1>
            <p className="brand-subtitle">People sustaining people</p>
          </div>
        </div>
        <nav className="app-nav" aria-label="Primary navigation">
          <NavLink className={linkClassName} to="/">
            Home
          </NavLink>
          <NavLink className={linkClassName} to="/partners">
            Partners
          </NavLink>
          <NavLink className={linkClassName} to="/transparency">
            Transparency
          </NavLink>
          <NavLink className={linkClassName} to="/auth">
            Auth
          </NavLink>
        </nav>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
