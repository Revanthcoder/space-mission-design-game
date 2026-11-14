export default function MissionSelector({ mission, level, missionCount, destination, onPrevious, onNext }) {
  return (
    <section className="mission-header">
      <div className="mission-kicker">MISSION {String(mission.level).padStart(2, "0")} / {missionCount} <span>ACTIVE DESIGN BRIEF</span></div>
      <div className="mission-title-row">
        <div><h1>{mission.title}</h1><p>{mission.description}</p></div>
        <div className="level-controls"><button disabled={level === 1} onClick={onPrevious}>‹</button><b>LEVEL {level}</b><button disabled={level === missionCount} onClick={onNext}>›</button></div>
      </div>
      <div className="mission-objective"><strong>DESIGN OBJECTIVE</strong><span>{mission.objective}</span><em>DESTINATION: {destination.name.toUpperCase()}</em></div>
    </section>
  );
}
