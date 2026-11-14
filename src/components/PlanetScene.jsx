export default function PlanetScene({ destination }) {
  return (
    <div className={`planet-scene planet-scene-${destination.id}`} aria-label={`3D ${destination.name} model`}>
      <div className="planet-orbit planet-orbit-wide" />
      <div className="planet-orbit planet-orbit-tilted" />
      {destination.id === "earth" && (
        <>
          <div className="planet-satellite-orbit planet-satellite-orbit-one">
            <span className="planet-satellite planet-satellite-one"><i /></span>
          </div>
          <div className="planet-satellite-orbit planet-satellite-orbit-two">
            <span className="planet-satellite planet-satellite-two"><i /></span>
          </div>
          <div className="planet-satellite-orbit planet-satellite-orbit-three">
            <span className="planet-satellite planet-satellite-three"><i /></span>
          </div>
        </>
      )}
      <div className="planet-model" style={{ "--planet-accent": destination.accent }}>
        <span className="planet-terminator" />
        <span className="planet-crater planet-crater-one" />
        <span className="planet-crater planet-crater-two" />
        <span className="planet-land planet-land-one" />
        <span className="planet-land planet-land-two" />
      </div>
      <div className="planet-scene-label">
        <span>ACTIVE DESTINATION</span>
        <strong>{destination.name.toUpperCase()}</strong>
        {destination.id === "earth" && <small>LIVE EARTH / 3 SATELLITES</small>}
      </div>
    </div>
  );
}
