import { ArrowRight, Compass, Rocket, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { missions } from "../../data/missions";

function MissionSelectionPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Mission selection
          </p>
          <h1 className="mt-4 text-3xl font-bold text-white md:text-5xl">
            Choose your next exploration objective
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {missions.map(({ id, title, objective, difficulty, description, category }) => (
            <article
              key={id}
              className="float-medium group rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_0_22px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_0_28px_rgba(34,211,238,0.18)]"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-2 text-cyan-200">
                  {category === "Mars" ? <Rocket className="h-5 w-5" /> : category === "Moon" ? <Compass className="h-5 w-5" /> : category === "Earth" ? <ShieldCheck className="h-5 w-5" /> : <Rocket className="h-5 w-5" />}
                </div>
                <span className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  {difficulty}
                </span>
              </div>

              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{category}</p>
              <h2 className="mt-3 text-2xl font-bold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-cyan-300">{objective}</p>
              <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>

              <Link
                to={`/missions/${id}`}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Select mission
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MissionSelectionPage;
