import { lazy, Suspense, useCallback, useState } from "react";
import MissionVisualizationFallback from "./MissionVisualizationFallback.jsx";

const ThreeMissionScene = lazy(() => import("./ThreeMissionScene.jsx"));

export default function MissionVisualization({ orbit, progress, objective }) {
  const [useFallback, setUseFallback] = useState(false);
  const showFallback = useCallback(() => setUseFallback(true), []);

  if (useFallback) {
    return <MissionVisualizationFallback orbit={orbit} progress={progress} objective={objective} />;
  }

  const isTransfer = orbit?.path === "moon" || orbit?.path === "mars";
  const destination = orbit?.path === "mars" ? "Mars" : orbit?.path === "moon" ? "Moon" : "Earth";
  const sceneDescription = isTransfer
    ? `Illustrative Earth to ${destination} transfer`
    : `${orbit?.name || "Selected orbit"} around Earth`;

  return (
    <section className="visual-panel" aria-labelledby="visual-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">MISSION VIEW</p>
          <h2 id="visual-title">{sceneDescription}</h2>
        </div>
        <span className="live-tag"><span /> SIMULATED</span>
      </div>
      <div className="scene-wrap">
        <Suspense fallback={<div className="three-scene scene-loading" role="status">Loading interactive 3D view…</div>}>
          <ThreeMissionScene orbit={orbit} progress={progress} onUnavailable={showFallback} />
        </Suspense>
        {!useFallback && <p className="scene-hint">DRAG TO ROTATE <i /> SCROLL TO ZOOM</p>}
      </div>
      <div className="scene-caption">
        <span><i className="legend-dot spacecraft-dot" />Spacecraft</span>
        <span><i className="legend-dot orbit-dot" />Mission path</span>
        <span>Decorative bird, ball & cube · not mission hardware</span>
      </div>
    </section>
  );
}
