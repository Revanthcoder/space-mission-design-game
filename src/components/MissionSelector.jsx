export default function MissionSelector({ mission, path, destination, canPrevious, canNext, onPrevious, onNext }) {
  return (
    <section className="mission-header">
      <div className="mission-kicker">PATH {mission.level} <span>{destination.name.toUpperCase()} DESIGN BRIEF</span></div>
      <div className="mission-title-row">
        <div><h1>{mission.title}</h1><p>{mission.description}</p></div>
        <div className="level-controls">
          <button type="button" aria-label="Previous compatible mission path" disabled={!canPrevious} onClick={onPrevious}>‹</button>
          <b>PATH {path}</b>
          <button type="button" aria-label="Next compatible mission path" disabled={!canNext} onClick={onNext}>›</button>
        </div>
      </div>
      <div className="mission-objective"><strong>DESIGN OBJECTIVE</strong><span>{mission.objective}</span><em>DESTINATION: {destination.name.toUpperCase()}</em></div>
    </section>
  );
}
