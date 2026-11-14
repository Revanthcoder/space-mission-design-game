import { ArrowLeft, CheckCircle2, Gauge, Rocket, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const resultStats = [
  { label: "Mission score", value: "91%", icon: TrendingUp },
  { label: "Crew safety", value: "98%", icon: CheckCircle2 },
  { label: "Resource efficiency", value: "86%", icon: Gauge },
];

const findings = [
  "The trajectory stayed within the predicted mission corridor for 94% of the route.",
  "Crew systems remained stable during the thermal stress window.",
  "Autonomous scanning identified a high-value surface zone for the next mission stage.",
];

const benchmarkBars = [
  { label: "Trajectory efficiency", value: 94 },
  { label: "Habitat resilience", value: 88 },
  { label: "Resource recovery", value: 81 },
  { label: "Scientific output", value: 96 },
];

const summaryPanel = {
  headline: "Mission objective exceeded expectations",
  description:
    "The mission produced a strong operational outcome, achieved a high safety margin, and generated multiple novel findings suitable for the next mission design cycle.",
};

function MissionResultsPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/missions"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400/30 hover:text-cyan-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to missions
        </Link>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_0_24px_rgba(15,23,42,0.38)] backdrop-blur-xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Mission results</p>
              <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">
                Mars Surveyor complete
              </h1>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-300">
              <Rocket className="h-4 w-4" />
              Successful mission
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {resultStats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-3 text-3xl font-bold text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <h2 className="text-xl font-semibold text-white">Key findings</h2>
              <ul className="mt-5 space-y-4">
                {findings.map((finding) => (
                  <li key={finding} className="flex items-start gap-3 text-sm leading-7 text-slate-300">
                    <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-300" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <h2 className="text-xl font-semibold text-white">Mission summary</h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
                <p>
                  The mission stayed within expected constraints and reached a strong operational outcome.
                </p>
                <p>
                  The crew completed all planned sampling tasks while maximizing energy efficiency during the final transfer window.
                </p>
              </div>

              <Link
                to="/dashboard"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.3)] transition hover:bg-cyan-300"
              >
                Return to dashboard
              </Link>
            </section>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Mission performance profile</h2>
                <span className="text-xs uppercase tracking-[0.2em] text-cyan-300">Benchmark</span>
              </div>

              <div className="space-y-5">
                {benchmarkBars.map(({ label, value }) => (
                  <div key={label}>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                      <span>{label}</span>
                      <span className="text-cyan-300">{value}%</span>
                    </div>
                    <div className="chart-track">
                      <div className="chart-fill" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Outcome
              </div>
              <h3 className="text-2xl font-bold text-white">{summaryPanel.headline}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{summaryPanel.description}</p>
              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Mission score</div>
                <div className="mt-3 text-4xl font-black text-white">91%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MissionResultsPage;
