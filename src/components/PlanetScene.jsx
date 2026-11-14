export default function PlanetScene({ destination, orbit }) {
  const orbitStyle = {
    "--orbit-inclination": `${orbit?.inclination ?? 85.69613}deg`,
    "--orbit-node": `${orbit?.longitudeAscendingNode ?? -61.41017}deg`,
  };

  return (
    <div className={`planet-scene planet-scene-${destination.id}`} aria-label={`3D ${destination.name} model`}>
      <div className="planet-orbit planet-orbit-wide" />
      <div className="planet-orbit planet-orbit-tilted" />
      {destination.id === "earth" && (
        <>
          <div className="planet-satellite-orbit planet-satellite-orbit-one" style={orbitStyle}>
            <span className="planet-satellite planet-satellite-one"><i /></span>
          </div>
          <div className="planet-satellite-orbit planet-satellite-orbit-two" style={orbitStyle}>
            <span className="planet-satellite planet-satellite-two"><i /></span>
          </div>
          <div className="planet-satellite-orbit planet-satellite-orbit-three" style={orbitStyle}>
            <span className="planet-satellite planet-satellite-three"><i /></span>
          </div>
        </>
      )}
      <div className="planet-model" style={{ "--planet-accent": destination.accent }}>
        {destination.id === "earth" && (
          <>
            <span className="planet-earth-clouds" />
            <span className="planet-earth-lights" />
            <span className="planet-earth-specular" />
          </>
        )}
        <span className="planet-terminator" />
        <span className="planet-crater planet-crater-one" />
        <span className="planet-crater planet-crater-two" />
        <span className="planet-land planet-land-one" />
        <span className="planet-land planet-land-two" />
      </div>
      {destination.id === "earth" && <span className="planet-earth-atmosphere" />}
      <div className="planet-scene-label">
        <span>ACTIVE DESTINATION</span>
        <strong>{destination.name.toUpperCase()}</strong>
        {destination.id === "earth" && <small>LIVE EARTH / 3 SATELLITES</small>}
      </div>
    </div>
  );
}
