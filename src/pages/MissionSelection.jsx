export default function MissionSelection({ missions, selectedPath, onSelect, sectionRef }) {
  const activeIndex = missions.findIndex((mission) => mission.level === selectedPath);
  const progress = missions.length ? ((activeIndex + 1) / missions.length) * 100 : 0;

  return (
    <section id="mission-progress" ref={sectionRef} className="mission-progress" aria-labelledby="campaign-heading">
      <div className="section-heading"><div><span className="eyebrow">DESTINATION-COMPATIBLE PATHS</span><h2 id="campaign-heading">Mission paths</h2></div><span>{missions.length} AVAILABLE</span></div>
      <div className="campaign-track" role="progressbar" aria-label="Mission path progress" aria-valuemin={0} aria-valuemax={missions.length} aria-valuenow={activeIndex + 1}><i style={{ width: `${progress}%` }} /></div>
      <div className="mission-pills" role="group" aria-label="Available mission paths">
        {missions.map((mission) => (
          <button
            type="button"
            key={mission.level}
            className={`mission-pill ${mission.level === selectedPath ? "mission-pill-active" : ""}`}
            aria-pressed={mission.level === selectedPath}
            aria-label={`Path ${mission.level}: ${mission.title}${mission.level === selectedPath ? ", selected" : ""}`}
            onClick={() => onSelect(mission.level)}
          >
            PATH {mission.level}<small>{mission.level === selectedPath ? "SELECTED" : "AVAILABLE"}</small>
          </button>
        ))}
      </div>
      <p className="mission-model-note">Path 6 is an asteroid mission, not a planet destination. The eight paths are described on the About page.</p>
    </section>
  );
}
