import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  FolderOpen,
  Gauge,
  Rocket,
  Star,
  Zap,
} from "lucide-react";
import type { ActivityItem, DashboardMetric } from "../../types/mission";

const metrics: DashboardMetric[] = [
  { label: "Total missions", value: "24", trend: "+2 this week" },
  { label: "Successful missions", value: "18", trend: "+6.2%" },
  { label: "Average score", value: "87%", trend: "+3.1%" },
];

const activities: ActivityItem[] = [
  {
    id: "a1",
    title: "Lunar base simulation completed",
    detail: "Crew systems remained stable for 94% of flight time.",
    time: "2h ago",
    status: "success",
  },
  {
    id: "a2",
    title: "Mars habitat review raised",
    detail: "Resource allocation needs one more optimization pass.",
    time: "5h ago",
    status: "warning",
  },
  {
    id: "a3",
    title: "Asteroid research data synced",
    detail: "Spectral analysis updated from the latest probe return.",
    time: "Yesterday",
    status: "info",
  },
];

const savedMissions = [
  "Aurora Base Deployment",
  "Polar Ice Survey",
  "Deep Drift Analysis",
];

const quickActions = [
  "Launch New Mission",
  "Review Crew Logs",
  "Open Strategy Brief",
  "Export Mission Data",
];

const readiness = [
  { label: "Power systems", value: 84 },
  { label: "Life support", value: 76 },
  { label: "Signal integrity", value: 92 },
  { label: "Cargo flow", value: 68 },
];

const resourceAllocation = [
  { label: "Fuel", value: 72, color: "bg-cyan-400" },
  { label: "Water", value: 61, color: "bg-emerald-400" },
  { label: "Oxygen", value: 89, color: "bg-violet-400" },
  { label: "Data", value: 94, color: "bg-amber-400" },
];

function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">
              Mission overview
            </h1>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-500/20">
            <Rocket className="h-4 w-4" />
            New mission
          </button>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          {metrics.map(({ label, value, trend }) => (
            <div
              key={label}
              className="float-medium rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_0_25px_rgba(15,23,42,0.35)] backdrop-blur-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm text-slate-400">{label}</span>
                <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-2 text-cyan-200">
                  {label === "Total missions" ? <FolderOpen className="h-4 w-4" /> : label === "Successful missions" ? <CheckCircle2 className="h-4 w-4" /> : <Gauge className="h-4 w-4" />}
                </div>
              </div>

              <div className="text-3xl font-bold text-white">{value}</div>
              <div className="mt-4 flex items-center gap-2 text-sm text-emerald-300">
                <ArrowUpRight className="h-4 w-4" />
                {trend}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Mission readiness</h2>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                  Nominal
                </span>
              </div>

              <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
                <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="radial-gauge">
                    <div className="radial-gauge__inner">
                      <span>84%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {readiness.map(({ label, value }) => (
                    <div key={label}>
                      <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                        <span>{label}</span>
                        <span className="text-cyan-300">{value}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Recent activities</h2>
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-300">
                  <Activity className="h-3.5 w-3.5" />
                  Live feed
                </span>
              </div>

              <div className="space-y-4">
                {activities.map(({ id, title, detail, time, status }) => (
                  <div key={id} className="flex gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <div
                      className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${
                        status === "success"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : status === "warning"
                            ? "bg-amber-500/15 text-amber-300"
                            : "bg-cyan-500/15 text-cyan-300"
                      }`}
                    >
                      <Star className="h-4 w-4" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-white">{title}</p>
                          <p className="mt-1 text-sm text-slate-300">{detail}</p>
                        </div>
                        <span className="text-xs text-slate-400">{time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-white">Resource allocation</h2>
              <div className="mt-6 space-y-5">
                {resourceAllocation.map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                      <span>{label}</span>
                      <span className="text-white">{value}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-white">Saved missions</h2>
              <ul className="mt-5 space-y-3">
                {savedMissions.map((mission) => (
                  <li key={mission} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-3 text-sm text-slate-200">
                    <span>{mission}</span>
                    <button className="text-cyan-300 transition hover:text-cyan-200">Open</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-white">Quick actions</h2>
              <div className="mt-5 grid gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-400/30 hover:text-cyan-200"
                  >
                    <span>{action}</span>
                    <Zap className="h-4 w-4 text-cyan-300" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
