 import { useMemo } from "react";

function pointOnCubicPath(progress, start, controlA, controlB, end) {
  const t = Math.max(0, Math.min(1, progress / 100));
  const inverse = 1 - t;
  return {
    x: inverse ** 3 * start.x
      + 3 * inverse ** 2 * t * controlA.x
      + 3 * inverse * t ** 2 * controlB.x
      + t ** 3 * end.x,
    y: inverse ** 3 * start.y
      + 3 * inverse ** 2 * t * controlA.y
      + 3 * inverse * t ** 2 * controlB.y
      + t ** 3 * end.y,
  };
}

const destinationColors = {
  mercury: "#d68d67",
  venus: "#e5b35e",
  jupiter: "#d99c73",
  saturn: "#d8c28c",
  uranus: "#75cbd0",
  neptune: "#557ee0",
};

export default function MissionVisualizationFallback({ orbit, progress, objective }) {
  const isTransfer = orbit?.path === "moon" || orbit?.path === "mars" || orbit?.path === "planetary";
  const destination = orbit?.path === "planetary"
    ? (orbit.destinationName || "Selected planet").toUpperCase()
    : orbit?.path === "mars" ? "MARS" : orbit?.path === "moon" ? "MOON" : "EARTH";
  const destinationFill = orbit?.path === "planetary"
    ? destinationColors[orbit.destinationId] || "url(#moon-shade)"
    : destination === "MARS" ? "url(#mars-shade)" : "url(#moon-shade)";
  const spacecraft = useMemo(() => {
    if (isTransfer) {
      return pointOnCubicPath(progress, { x: 104, y: 174 }, { x: 210, y: 30 }, { x: 384, y: 306 }, { x: 506, y: 174 });
    }
    const angle = (-Math.PI / 2) + (Math.PI * 2 * progress) / 100;
    return {
      x: 306 + Math.cos(angle) * (orbit?.id === "geo" ? 205 : 144),
      y: 174 + Math.sin(angle) * (orbit?.id === "geo" ? 96 : 72),
    };
  }, [isTransfer, orbit, progress]);
  const sceneDescription = isTransfer
    ? `Illustrative Earth to ${destination.toLowerCase()} transfer`
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
        <svg
          className="mission-scene"
          viewBox="0 0 620 348"
          role="img"
          aria-label={`${sceneDescription}. The spacecraft is at ${progress}% mission progress. This is an illustrative animation, not a calculated trajectory.`}
        >
          <defs>
            <radialGradient id="earth-shade" cx="30%" cy="28%" r="75%">
              <stop offset="0%" stopColor="#73d9e8" />
              <stop offset="55%" stopColor="#237a9b" />
              <stop offset="100%" stopColor="#123450" />
            </radialGradient>
            <radialGradient id="moon-shade" cx="32%" cy="28%" r="80%">
              <stop offset="0%" stopColor="#dbe4ec" />
              <stop offset="100%" stopColor="#66798b" />
            </radialGradient>
            <radialGradient id="mars-shade" cx="32%" cy="28%" r="80%">
              <stop offset="0%" stopColor="#ffba7d" />
              <stop offset="100%" stopColor="#a84b35" />
            </radialGradient>
            <filter id="planet-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="11" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="620" height="348" fill="#071321" />
          <g className="star-field" fill="#b9d8ee">
            <circle cx="34" cy="50" r="1.3" /><circle cx="90" cy="92" r="1" />
            <circle cx="164" cy="38" r="1.2" /><circle cx="228" cy="73" r="0.9" />
            <circle cx="286" cy="29" r="1.2" /><circle cx="357" cy="87" r="1" />
            <circle cx="421" cy="42" r="1.4" /><circle cx="578" cy="55" r="1" />
            <circle cx="39" cy="263" r="1" /><circle cx="186" cy="303" r="1.2" />
            <circle cx="260" cy="281" r="0.9" /><circle cx="377" cy="318" r="1.2" />
            <circle cx="470" cy="277" r="1" /><circle cx="589" cy="235" r="1.3" />
            <circle cx="549" cy="125" r="0.8" /><circle cx="128" cy="216" r="0.9" />
          </g>
          {isTransfer ? (
            <>
              <path d="M104 174 C210 30 384 306 506 174" className="trajectory-line" />
              <path d="M104 174 C210 30 384 306 506 174" className="trajectory-glow" />
              <g className="planet-group">
                <circle cx="104" cy="174" r="41" fill="#2a98bc" opacity=".16" filter="url(#planet-glow)" />
                <circle cx="104" cy="174" r="31" fill="url(#earth-shade)" />
                <path d="M85 161l12-9 9 2 4 9-6 7 3 8-11 7-5-9-9-4zM113 188l10-4 9 7-4 10-12 1-5-8z" fill="#70c69a" opacity=".8" />
              </g>
              <g>
                <circle cx="506" cy="174" r="29" fill={destinationFill} />
                <circle cx="497" cy="164" r="5" fill="#fff" opacity=".08" />
                <circle cx="515" cy="181" r="7" fill="#071321" opacity=".13" />
              </g>
              <text x="104" y="235" className="planet-label">EARTH</text>
              <text x="506" y="226" className="planet-label">{destination}</text>
            </>
          ) : (
            <>
              <ellipse cx="306" cy="174" rx={orbit?.id === "geo" ? "205" : "144"} ry={orbit?.id === "geo" ? "96" : "72"} className="orbit-line" />
              {orbit?.id === "polar" && <ellipse cx="306" cy="174" rx="144" ry="72" className="orbit-line orbit-line-secondary" transform="rotate(-62 306 174)" />}
              <circle cx="306" cy="174" r="75" fill="#2589ac" opacity=".14" filter="url(#planet-glow)" />
              <g className="earth-group">
                <circle cx="306" cy="174" r="64" fill="url(#earth-shade)" />
                <path d="M275 147l20-13 18 4 8 15-12 11 4 15-17 13-9-15-16-9zM324 197l17-10 20 8-6 18-21 7-12-10zM291 204l8 3 2 13-8 9-7-13z" fill="#70c69a" opacity=".78" />
                <path d="M242 168c6-34 34-60 67-62" fill="none" stroke="#a8efff" strokeOpacity=".55" strokeWidth="2" />
              </g>
              <text x="306" y="263" className="planet-label">EARTH</text>
            </>
          )}
          <g
            className="spacecraft-marker"
            transform={`translate(${spacecraft.x} ${spacecraft.y})`}
            aria-hidden="true"
          >
            <path d="M-23 -7h13v14h-13zM10 -7h13v14H10z" fill="#62c6e8" stroke="#bcefff" strokeWidth="1" />
            <path d="M-9 -5L0 -10 9 -5 7 7 0 11 -7 7z" fill="#f3f6f8" stroke="#9bb6c7" strokeWidth="1" />
            <path d="M0 -10v-8M-5 10h10" stroke="#f3f6f8" strokeWidth="1.5" />
            <circle cx="0" cy="-19" r="2" fill="#76e7ff" />
          </g>
          <g className="scene-label">
            <rect x="17" y="17" width="172" height="31" rx="8" />
            <text x="30" y="37">{objective?.category || "Mission simulation"}</text>
          </g>
          <text x="603" y="329" textAnchor="end" className="scene-disclaimer">ILLUSTRATIVE PATH · NOT TO SCALE</text>
        </svg>
      </div>
      <div className="scene-caption">
        <span><i className="legend-dot spacecraft-dot" />Spacecraft</span>
        <span><i className="legend-dot orbit-dot" />Mission path</span>
        <span>Position follows simulation progress</span>
      </div>
    </section>
  );
}
