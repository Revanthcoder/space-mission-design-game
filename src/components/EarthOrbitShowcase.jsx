const orbit = {
  semimajorAxis: "10,434.162 km",
  eccentricity: "0.2918967",
  inclination: 85.69613,
  argumentOfPeriapsis: "170.10651°",
  periapsisPassage: "1990 DOY 222 19:54 UTC ERT",
  longitudeAscendingNode: -61.41017,
};

const solarSystemUrl = "https://eyes.nasa.gov/apps/solar-system/#/home";

export default function EarthOrbitShowcase() {
  return (
    <section className="earth-orbit-showcase builder-panel" aria-label="Earth orbital operations">
      <div className="earth-orbit-visual" aria-label="NASA Eyes on the Solar System interactive 3D visualization">
        <iframe
          title="NASA Eyes on the Solar System"
          src={solarSystemUrl}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="fullscreen"
        />
        <a
          className="earth-orbit-open-link"
          href={solarSystemUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          OPEN NASA EYES ↗
        </a>
      </div>
      <div className="orbit-telemetry">
        <span><b>SEMIMAJOR AXIS</b>{orbit.semimajorAxis}</span>
        <span><b>ECCENTRICITY</b>{orbit.eccentricity}</span>
        <span><b>INCLINATION</b>{orbit.inclination}°</span>
        <span><b>ARG. OF PERIAPSIS</b>{orbit.argumentOfPeriapsis}</span>
        <span><b>ASCENDING NODE</b>{orbit.longitudeAscendingNode}°</span>
        <a href="/data/earth-orbit.csv" target="_blank" rel="noreferrer">OPEN ORBIT CSV ↗</a>
      </div>
    </section>
  );
}
