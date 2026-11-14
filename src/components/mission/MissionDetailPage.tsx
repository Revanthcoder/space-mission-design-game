import { ArrowLeft, Gauge, Rocket, ShieldCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getMissionById } from "../../data/missions";

const missionPhases = [
  { phase: "Launch window", detail: "Trajectory locked and fuel burn optimized." },
  { phase: "Cruise phase", detail: "Autonomous navigation and communication checks." },
  { phase: "Surface scan", detail: "Rover network mapping key terrain zones." },
  { phase: "Recovery", detail: "Crew support and sample return coordination." },
];

const systemHealth = [
  { label: "Thermal shell", value: 86 },
  { label: "Navigation mesh", value: 92 },
  { label: "Remote sensors", value: 78 },
  { label: "Habitat loop", value: 90 },
];

function MissionDetailPage() {
  const { id } = useParams();
  const mission = getMissionById(id);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 md:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/missions"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400/30 hover:text-cyan-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to missions
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_0_24px_rgba(15,23,42,0.38)] backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">
                  {mission.category}
                </p>
                <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">
                  {mission.title}
                </h1>
              </div>

              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                {mission.difficulty}
              </span>
            </div>

            <p className="text-lg leading-8 text-slate-200">{mission.objective}</p>
            <p className="mt-5 text-base leading-8 text-slate-300">{mission.description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Crew</p>
                <p className="mt-3 text-2xl font-bold text-white">6</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fuel</p>
                <p className="mt-3 text-2xl font-bold text-white">82%</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Risk</p>
                <p className="mt-3 text-2xl font-bold text-white">Low</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Mission timeline</h2>
                <span className="text-xs uppercase tracking-[0.2em] text-cyan-300">Live plan</span>
              </div>

              <div className="space-y-4">
                {missionPhases.map((item, index) => (
                  <div key={item.phase} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="timeline-dot" />
                      {index < missionPhases.length - 1 && <span className="timeline-line" />}
                    </div>
                    <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <div className="mb-1 text-sm font-medium text-cyan-300">{item.phase}</div>
                      <div className="text-sm text-slate-300">{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to={`/missions/${mission.id}/launch`}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.3)] transition hover:bg-cyan-300"
            >
              Launch mission
              <Rocket className="h-4 w-4" />
            </Link>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="text-xl font-semibold text-white">Mission status</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>Trajectory</span>
                    <span className="text-cyan-300">Stable</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="mb-3 flex items-center gap-2 text-cyan-300">
                    <Gauge className="h-4 w-4" />
                    <span className="text-sm font-medium">Telemetry</span>
                  </div>
                  <p className="text-sm leading-7 text-slate-300">
                    Sensor arrays synced successfully. Resource balance remains within safe thresholds.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="text-xl font-semibold text-white">System health</h2>
              <div className="mt-5 space-y-4">
                {systemHealth.map(({ label, value }) => (
                  <div key={label}>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                      <span>{label}</span>
                      <span className="text-cyan-300">{value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="text-xl font-semibold text-white">Launch prep</h2>
              <ul className="mt-5 space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
                  Crew systems check complete
                </li>
                <li className="flex items-start gap-3">
                  <Rocket className="mt-0.5 h-4 w-4 text-cyan-300" />
                  Launch schedule aligned with orbital window
                </li>
                <li className="flex items-start gap-3">
                  <Gauge className="mt-0.5 h-4 w-4 text-cyan-300" />
                  Resource simulations verified for mission length
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default MissionDetailPage;
