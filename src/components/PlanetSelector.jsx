import PlanetScene from "./PlanetScene";

export default function PlanetSelector({ destinations, selectedId, onSelect, sectionRef, disabled = false }) {
  const selectedDestination = destinations.find((destination) => destination.id === selectedId) || destinations[0];

  return (
    <section ref={sectionRef} className={`planet-selector planet-selector-${selectedDestination.id} ${disabled ? "planet-selector-disabled" : ""} builder-panel`}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">TRAJECTORY PLANNING</span>
          <h2>Select destination {disabled && <small className="disabled-label">AVAILABLE AT LEVEL 5</small>}</h2>
        </div>
        <span>{destinations.length} DESTINATIONS</span>
      </div>
      <div className="planet-selector-layout">
        <PlanetScene destination={selectedDestination} />
        <div>
          <p className="planet-selector-intro">Choose the celestial body where this spacecraft will operate.</p>
      <div className="planet-grid">
        {destinations.map((destination) => (
          <button
            className={`planet-card ${selectedId === destination.id ? "planet-card-active" : ""}`}
            key={destination.id}
            onClick={() => onSelect(destination.id)}
            disabled={disabled}
          >
            <span className="planet-orb" style={{ background: destination.accent }} />
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
