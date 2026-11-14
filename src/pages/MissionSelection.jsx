export default function MissionSelection({ missions, level, unlockedLevel, onSelect, sectionRef }) {
  return (
    <section ref={sectionRef} className="mission-progress">
      <div className="section-heading"><div><span className="eyebrow">MISSION PROGRESSION</span><h2>Engineering campaign</h2></div><span>{unlockedLevel} / {missions.length} UNLOCKED</span></div>
      <div className="campaign-track"><i style={{ width: `${unlockedLevel / missions.length * 100}%` }} /></div>
      <div className="mission-pills">
        {missions.map((mission) => <button key={mission.level} disabled={mission.level > unlockedLevel} className={mission.level === level ? "mission-pill-active" : ""} onClick={() => onSelect(mission.level)}>{String(mission.level).padStart(2, "0")}<small>{mission.level > unlockedLevel ? "LOCKED" : "READY"}</small></button>)}
      </div>
    </section>
  );
}
