import { ArrowRight, CheckCircle2, Gauge, Rocket, ShieldCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getMissionById } from "../../data/missions";

const launchChecklist = [
  "Crew readiness verified",
  "Environment simulations green",
  "Launch trajectory aligned",
  "Fuel reserve above threshold",
];

const launchSequence = [
  { label: "Ignition pulse", value: 96 },
  { label: "Orbital insertion", value: 82 },
  { label: "Navigation lock", value: 91 },
  { label: "Sample deployment", value: 67 },
];

function MissionLaunchPage() {
  const { id } = useParams();
  const mission = getMissionById(id);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/missions"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400/30 hover:text-cyan-200"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Back to missions
        </Link>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_0_24px_rgba(15,23,42,0.38)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Launch configuration</p>
            <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">
              Mission Control launch setup
            </h1>

            <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                  <span>Launch clock</span>
                  <span className="text-cyan-300">T-02:40</span>
                </div>

                <div className="countdown-ring">
                  <div className="countdown-ring__inner">
                    <span>02:40</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">
                    Mission name
                  </label>
                  <input
                    value={mission.title}
                    readOnly
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-slate-100 outline-none"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">
                      Crew size
                    </label>
                    <input
                      value="6 astronauts"
                      readOnly
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-slate-100 outline-none"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">
                      Mission window
                    </label>
                    <input
                      value="02:40 UTC"
                      readOnly
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-slate-100 outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">
                    Briefing summary
                  </label>
                  <textarea
                    readOnly
                    value="Prioritize habitat integrity, optimize transfer timing, and maintain autonomous asteroid detection coverage during the first orbital phase."
                    className="min-h-[120px] w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-slate-100 outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Launch readiness</h2>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-300">
                  Ready
                </span>
              </div>

              <div className="space-y-3">
                {launchChecklist.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <div className="mb-4 flex items-center gap-2 text-cyan-300">
                <Gauge className="h-4 w-4" />
                <h2 className="text-xl font-semibold text-white">System metrics</h2>
              </div>

              <div className="space-y-4">
                {launchSequence.map(({ label, value }) => (
                  <div key={label}>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                      <span>{label}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="chart-track">
                      <div className="chart-fill" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to={`/missions/${mission.id}/results`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.3)] transition hover:bg-cyan-300"
            >
              <Rocket className="h-4 w-4" />
              Confirm launch
            </Link>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
                <span>All mission protocols have been validated for a safe launch window.</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default MissionLaunchPage;
