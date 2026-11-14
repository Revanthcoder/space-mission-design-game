import { ArrowUpRight, Globe, Rocket } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-slate-800 bg-slate-950/90">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-3 lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Mission Control
            </span>
          </div>
          <p className="text-sm leading-7 text-slate-300">
            Mission planning, decision support, and spacecraft coordination for deep-space exploration.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
            Navigation
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li>Home</li>
            <li>Dashboard</li>
            <li>Missions</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
            Mission status
          </h3>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
              <span>Orbital link</span>
              <span className="inline-flex items-center gap-2 text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Stable
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
              <span>System sync</span>
              <span className="inline-flex items-center gap-2 text-cyan-300">
                <Globe className="h-3.5 w-3.5" />
                Online
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 px-6 py-4 text-center text-xs uppercase tracking-[0.2em] text-slate-500">
        Mission Control Dashboard <ArrowUpRight className="ml-2 inline h-3 w-3" />
      </div>
    </footer>
  );
}
