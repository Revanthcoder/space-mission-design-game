export default function PlanetScene({ destination }) {
  return (
    <div className={`planet-scene planet-scene-${destination.id}`}>
      <img
        className="planet-scene-photo"
        src={destination.image}
        alt={`${destination.name}: ${destination.imageCaption}`}
        fetchPriority="high"
      />
      <div className="planet-scene-shade" aria-hidden="true" />
      <div className="planet-scene-label">
        <span>NASA PLANETARY IMAGERY</span>
        <strong>{destination.name.toUpperCase()}</strong>
        <small>{destination.imageCaption}</small>
      </div>
    </div>
  );
}
