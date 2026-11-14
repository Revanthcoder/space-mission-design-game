import {
  ArrowRight,
  Gauge,
  Orbit,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  Telescope,
} from "lucide-react";
import { Link } from "react-router-dom";
import { OrbitalScene } from "./OrbitalScene";

const features = [
  {
    title: "Mission planning",
    description: "Design, optimize, and evaluate every mission decision before launch.",
    icon: Rocket,
  },
  {
    title: "Real-time simulation",
    description: "Monitor mission progress with live telemetry and performance tracking.",
    icon: Gauge,
  },
  {
    title: "Deep-space exploration",
    description: "Prepare crews for lunar, Martian, and asteroid-based scientific missions.",
    icon: Telescope,
  },
];

const processSteps = [
  {
    title: "1. Select mission",
    description: "Choose a destination, crew profile, and mission objective.",
  },
  {
    title: "2. Balance strategy",
    description: "Use resources, science, and safety in the right mix for success.",
  },
  {
    title: "3. Launch and analyze",
    description: "Review the results and refine the next mission plan.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute right-[-5%] top-[15%] h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[20%] h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="starfield" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8 fade-in">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <Orbit className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Mission Control
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#features" className="transition hover:text-cyan-300">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-cyan-300">
            How It Works
          </a>
          <a href="#missions" className="transition hover:text-cyan-300">
            Missions
          </a>
        </nav>

        <Link
          to="/missions"
          className="inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.2)] transition hover:border-cyan-300 hover:bg-cyan-500/20"
        >
          Launch Portal
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-10 lg:px-8">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:pt-8">
          <div className="fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-slate-900/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-cyan-300 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Mission readiness
            </div>

            <h1 className="max-w-xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-white md:text-6xl xl:text-7xl">
              Design. Launch. Explore.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Shape the next generation of deep-space missions, balance critical
              resources, and lead crews across the final frontier.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/missions"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.4)] transition hover:bg-cyan-300"
              >
                Start Mission
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-100 backdrop-blur-sm transition hover:border-cyan-400/40 hover:text-cyan-200"
              >
                <Play className="h-4 w-4" />
                Explore Missions
              </Link>

              <Link
                to="/worlds"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-6 py-3 text-sm font-semibold text-violet-100 backdrop-blur-sm transition hover:border-violet-300 hover:bg-violet-500/20"
              >
                <Orbit className="h-4 w-4" />
                Open World Atlas
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-300">
              <div>
                <span className="block text-2xl font-bold text-white">24</span>
                <span className="text-slate-400">missions active</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-white">92%</span>
                <span className="text-slate-400">success rate</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-white">8</span>
                <span className="text-slate-400">new targets</span>
              </div>
            </div>
          </div>

          <div className="relative float-slow">
            <div className="glass-panel relative overflow-hidden rounded-[28px] border border-cyan-400/20 p-5 shadow-[0_0_40px_rgba(14,116,144,0.25)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                <span>Mission overview</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 font-medium text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Online
                </span>
              </div>

              <div className="rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 p-5">
                <div className="scene-wrap">
                  <OrbitalScene />
                </div>

                <div className="mb-5 mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Current mission
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                      Mars Surveyor
                    </h2>
                  </div>
                  <div className="rounded-full border border-cyan-400/30 bg-cyan-500/10 p-3 text-cyan-200">
                    <Rocket className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Habitat integrity</span>
                      <span className="text-cyan-300">82%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Crew
                      </p>
                      <p className="mt-3 text-xl font-semibold text-white">6</p>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Orbit
                      </p>
                      <p className="mt-3 text-xl font-semibold text-white">127K km</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-28">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
              Features
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
              Built to support every phase of mission design
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_0_24px_rgba(34,211,238,0.15)]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-200">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mt-28">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
              From concept to critical decision-making
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {processSteps.map(({ title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_0_20px_rgba(15,23,42,0.3)]"
              >
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-bold text-cyan-300">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
