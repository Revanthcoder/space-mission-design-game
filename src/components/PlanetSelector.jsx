import PlanetScene from "./PlanetScene";
import { planetaryEngineeringSources } from "../data/spacecraftData";

export default function PlanetSelector({ destinations, selectedId, onSelect, sectionRef }) {
  const selectedDestination = destinations.find((destination) => destination.id === selectedId) || destinations[0];
  const facts = [
    [selectedDestination.distanceLabel, selectedDestination.averageDistance],
    ["DIAMETER", selectedDestination.diameter],
    ["ORBITAL YEAR", selectedDestination.yearLength],
    [
      selectedDestination.alignmentLabel || "APPROX. EARTH-PLANET ALIGNMENT",
      selectedDestination.alignmentPeriodDays
        ? `about ${selectedDestination.alignmentPeriodDays} days`
        : "Earth orbit · no planetary transfer",
    ],
    [selectedDestination.gravityLabel, selectedDestination.gravity],
    ["ATMOSPHERE", selectedDestination.atmosphere],
    ["SUNLIGHT", `${(100 / (selectedDestination.solarDistanceAu ** 2)).toPrecision(3)}% of Earth's at 1 AU`],
  ];
  const compatiblePaths = selectedDestination.availableLevels.map((availableLevel) => `Path ${availableLevel}`).join(", ");

  return (
    <section id="worlds" ref={sectionRef} className="planet-selector builder-panel" aria-labelledby="destination-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">TRAJECTORY PLANNING</span>
          <h2 id="destination-heading">Select destination</h2>
        </div>
        <span>{destinations.length} DESTINATIONS</span>
      </div>
      <div className="planet-selector-layout">
        <div className="planet-explorer">
          <PlanetScene destination={selectedDestination} />
          <div className="planet-fact-panel">
            <p className="planet-highlight">{selectedDestination.highlight}</p>
            <p className="planet-mission-limit">{selectedDestination.missionLimit}</p>
            <p className="planet-model-note">
              Compatible builder paths: <strong>{compatiblePaths}</strong>. Missions depart from Earth; destination gravity and atmosphere affect real arrival designs but are not calculated by this model.
              Alignment cycles are approximate, not launch dates. Solar output uses inverse-square scaling; RTG output is held at nominal power, and propellant is a game reserve. Ephemerides, trajectories, landing, and delta-v are not calculated.
            </p>
            <dl className="planet-fact-grid" aria-label={`${selectedDestination.name} key facts`}>
              {facts.map(([label, value]) => (
                <div className="planet-fact" key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="planet-source-row">
              <a href={selectedDestination.imageSource} target="_blank" rel="noopener noreferrer">
                IMAGE: {selectedDestination.imageCredit} ↗
              </a>
              <a href={selectedDestination.factsSource} target="_blank" rel="noopener noreferrer">
                PLANET FACTS ↗
              </a>
              {planetaryEngineeringSources.map((source) => (
                <a key={source.name} href={source.url} target="_blank" rel="noopener noreferrer" title={`${source.name} — ${source.organization}`}>
                  {source.name.toUpperCase()} ↗
                </a>
              ))}
            </div>
            <a
              className="planet-tour-link"
              href="https://eyes.nasa.gov/apps/solar-system/#/home"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open NASA Eyes interactive solar-system tour"
            >
              <span>VIRTUAL EXPLORATION</span>
              <strong>Explore in NASA Eyes <span aria-hidden="true">↗</span></strong>
            </a>
          </div>
        </div>
        <div className="planet-choice-panel">
          <p className="planet-selector-intro">Choose a destination to see compatible mission paths and environment constraints.</p>
          <div className="planet-grid" role="group" aria-label="Choose a mission destination">
            {destinations.map((destination) => (
              <button
                className={`planet-card ${selectedId === destination.id ? "planet-card-active" : ""}`}
                key={destination.id}
                type="button"
                aria-pressed={selectedId === destination.id}
                onClick={() => onSelect(destination.id)}
              >
                <img
                  className="planet-card-image"
                  src={destination.image}
                  alt=""
                  loading="lazy"
                  aria-hidden="true"
                />
                <span className="planet-card-copy">
                  <strong>{destination.name}</strong>
                  <small>{destination.type}</small>
                  <em>{destination.description}</em>
                </span>
                {selectedId === destination.id && <span className="planet-selected">SELECTED</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
