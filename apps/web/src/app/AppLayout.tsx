import { Link, Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div className="layout">
      <header>
        <h1>Rede Colmeia</h1>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/partners">Partners</Link>
          <Link to="/transparency">Transparency</Link>
          <Link to="/auth">Auth</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
