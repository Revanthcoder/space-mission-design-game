import { Menu, Orbit, Rocket, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "../ui/Button";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Missions", to: "/missions" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-20 mx-auto max-w-7xl px-6 py-6 lg:px-8">
      <div className="flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <Orbit className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Mission Control
            </p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          {navItems.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `transition ${isActive ? "text-cyan-300" : "hover:text-cyan-300"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild variant="ghost" size="sm" className="inline-flex">
            <NavLink to="/missions">
              <span className="inline-flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                Launch Portal
              </span>
            </NavLink>
          </Button>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-100 md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <nav className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 shadow-[0_0_22px_rgba(15,23,42,0.4)] backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-300"
                      : "text-slate-300 hover:bg-slate-800 hover:text-cyan-200"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            <Button asChild variant="ghost" size="sm" className="mt-2 justify-center">
              <NavLink to="/missions" onClick={() => setMenuOpen(false)}>
                <span className="inline-flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  Launch Portal
                </span>
              </NavLink>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
