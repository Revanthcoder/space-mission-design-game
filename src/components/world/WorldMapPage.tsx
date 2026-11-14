import { ArrowRight, Globe2, Orbit, Radar, Rocket, Telescope } from "lucide-react";
import { Link } from "react-router-dom";
import { OrbitalScene } from "../landing/OrbitalScene";

const systemStats = [
  { label: "Active systems", value: "97%", detail: "Nominal orbital health" },
  { label: "Tracked bodies", value: "12+", detail: "Planets, moons, and waypoints" },
  { label: "Signal uptime", value: "99.2%", detail: "Across all relay paths" },
  { label: "Galaxy range", value: "Milky Way", detail: "Deep-space survey corridor" },
];

const atlasCards = [
  { name: "Mercury", type: "Inner orbit", accent: "text-slate-200" },
  { name: "Venus", type: "Cloud shield", accent: "text-amber-200" },
  { name: "Earth", type: "Live telemetry", accent: "text-cyan-200" },
  { name: "Mars", type: "Route locked", accent: "text-orange-200" },
  { name: "Jupiter", type: "Gas giant", accent: "text-yellow-200" },
  { name: "Saturn", type: "Ring system", accent: "text-amber-100" },
  { name: "Neptune", type: "Outer system", accent: "text-blue-200" },
  { name: "Milky Way", type: "Galaxy view", accent: "text-violet-200" },
];

const routeNotes = [
  "Solar-system relay network active",
  "Satellite cluster monitoring all orbits",
  "Milky Way corridor mapped for deep-space launch",
];

export default function WorldMapPage() {
  return (
    <main className="world-page-shell">
      <div className="world-page-inner">
        <header className="world-page-header">
          <div>
            <p className="world-page-kicker">Deep-space atlas</p>
            <h1 className="world-page-title">Milky Way galaxy live view</h1>
          </div>

          <div className="world-page-actions">
            <Link to="/missions" className="world-page-button world-page-button--primary">
              Mission planner
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/dashboard" className="world-page-button world-page-button--secondary">
              Mission dashboard
            </Link>
          </div>
        </header>

        <section className="world-overview-grid">
          {systemStats.map(({ label, value, detail }) => (
            <div key={label} className="world-stat-card">
              <div className="world-stat-head">
                <span>{label}</span>
                <div className="world-stat-icon">
                  {label === "Active systems" ? <Radar className="h-4 w-4" /> : label === "Tracked bodies" ? <Globe2 className="h-4 w-4" /> : label === "Galaxy range" ? <Telescope className="h-4 w-4" /> : <Orbit className="h-4 w-4" />}
                </div>
              </div>
              <div className="world-stat-value">{value}</div>
              <p>{detail}</p>
            </div>
          ))}
        </section>

        <section className="world-hero-panel">
          <div className="world-hero-scene-wrap">
            <OrbitalScene className="world-map-scene" />
          </div>

          <aside className="world-side-panel">
            <div className="world-side-card">
              <div className="world-card-label">Live mission corridor</div>
              <h2>Solar system to Milky Way</h2>
              <ul className="world-note-list">
                {routeNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>

            <div className="world-side-card world-side-card--compact">
              <div className="world-card-label">Orbital status</div>
              <div className="world-status-row">
                <span className="dot" />
                <span>All planets and relay satellites online</span>
              </div>
              <div className="world-status-row">
                <span className="dot dot--secondary" />
                <span>Milky Way route vector stable</span>
              </div>
            </div>
          </aside>
        </section>

        <section className="world-targets-section">
          <div className="world-section-heading">
            <div>
              <p className="world-page-kicker">Mission network</p>
              <h2>Transit routes and targets</h2>
            </div>
            <div className="world-section-pill">
              <Rocket className="h-4 w-4" />
              Full galaxy map
            </div>
          </div>

          <div className="world-planet-grid">
            {atlasCards.map(({ name, type, accent }) => (
              <div key={name} className="world-planet-card">
                <div className="world-planet-head">
                  <span>{type}</span>
                  <span className="world-planet-dot" />
                </div>
                <p className={`world-planet-name ${accent}`}>{name}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
