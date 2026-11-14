import { ArrowRight, Globe2, Layers3, Orbit, Radar } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { OrbitalScene } from "../landing/OrbitalScene";

const systemStats = [
  { label: "Active systems", value: "97%", detail: "Nominal orbital health" },
  { label: "Tracked bodies", value: "12", detail: "Planets and waypoints" },
  { label: "Signal uptime", value: "99.2%", detail: "Across all relay paths" },
];

const destinationCards = [
  {
    name: "Earth",
    status: "Live telemetry",
    accent: "bg-cyan-400/15 text-cyan-300",
    badge: "Live",
    distance: "384,400 km",
    climate: "Temperate",
    signal: "92%",
    note: "NASA Earth observation and ISRO remote-sensing mission data track atmospheric, surface, and water-cycle conditions.",
  },
  {
    name: "Moon",
    status: "Transfer lane",
    accent: "bg-violet-400/15 text-violet-300",
    badge: "Route",
    distance: "384,400 km",
    climate: "Vacuum",
    signal: "86%",
    note: "Lunar transfer windows and surface mapping follow tracked mission profiles from NASA and ISRO deep-space planning references.",
  },
  {
    name: "Mars",
    status: "Route locked",
    accent: "bg-amber-400/15 text-amber-300",
    badge: "Locked",
    distance: "78M km",
    climate: "Arid",
    signal: "73%",
    note: "A Mars corridor is modeled with dust, radiation, and communications assumptions consistent with NASA exploration planning.",
  },
  {
    name: "Europa",
    status: "Survey scan",
    accent: "bg-emerald-400/15 text-emerald-300",
    badge: "Scan",
    distance: "628M km",
    climate: "Cryogenic",
    signal: "68%",
    note: "Ice-world survey references are aligned to outer-system mission concept studies from NASA and ISRO research priorities.",
  },
];

export default function WorldMapPage() {
  const [activeWorld, setActiveWorld] = useState("Earth");
  const selectedWorld =
    destinationCards.find((world) => world.name === activeWorld) ?? destinationCards[0];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              World map
            </p>
            <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Live orbital overview</h1>
          </div>

          <Link
            to="/missions"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-500/20"
          >
            Open mission planner
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          {systemStats.map(({ label, value, detail }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_0_25px_rgba(15,23,42,0.35)] backdrop-blur-xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm text-slate-400">{label}</span>
                <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-2 text-cyan-200">
                  {label === "Active systems" ? <Radar className="h-4 w-4" /> : label === "Tracked bodies" ? <Globe2 className="h-4 w-4" /> : <Layers3 className="h-4 w-4" />}
                </div>
              </div>

              <div className="text-3xl font-bold text-white">{value}</div>
              <p className="mt-3 text-sm text-slate-300">{detail}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-950/70 shadow-[0_0_35px_rgba(34,211,238,0.12)]">
          <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-2 text-cyan-200">
                <Orbit className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">Orbital grid</p>
                <h2 className="text-lg font-semibold text-white">Navigation map</h2>
              </div>
            </div>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.22em] text-emerald-300">
              live
            </span>
          </div>

          <div className="p-4 md:p-6">
            <OrbitalScene />
          </div>
        </section>

        <section className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Target region</h2>
              <span className="text-sm text-cyan-300">{selectedWorld.name}</span>
            </div>

            <div className="space-y-3">
              {destinationCards.map(({ name, status, accent, badge }) => {
                const isActive = name === activeWorld;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setActiveWorld(name)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-cyan-400/40 bg-cyan-500/10 shadow-[0_0_25px_rgba(34,211,238,0.12)]"
                        : "border-slate-800 bg-slate-950/60 hover:border-cyan-400/30 hover:bg-slate-900"
                    }`}
                  >
                    <div>
                      <p className="text-base font-semibold text-white">{name}</p>
                      <p className="mt-1 text-sm text-slate-400">{status}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${accent}`}>{badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{selectedWorld.name}</h2>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${selectedWorld.accent}`}>
                {selectedWorld.badge}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-400">Distance</p>
                <p className="mt-2 text-lg font-semibold text-white">{selectedWorld.distance}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-400">Climate</p>
                <p className="mt-2 text-lg font-semibold text-white">{selectedWorld.climate}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-400">Signal</p>
                <p className="mt-2 text-lg font-semibold text-white">{selectedWorld.signal}</p>
              </div>
            </div>

            <ul className="mt-6 space-y-4 text-sm text-slate-300">
              <li className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                {selectedWorld.name} is currently in the active mission corridor with stable communications and route visibility.
              </li>
              <li className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                Sensor sweep coverage is optimized for the current planning window and orbital alignment.
              </li>
              <li className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                {selectedWorld.note}
              </li>
            </ul>

            <div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-3 text-xs uppercase tracking-[0.22em] text-cyan-200">
              NASA / ISRO mission reference layer
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
