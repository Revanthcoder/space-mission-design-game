export default function LaunchSequence({ phase, destination, mission, onReset }) {
  if (!phase) return null;

  const copy = {
    countdown: ["LAUNCH WINDOW ARMED", "Systems are locked and flight software is ready."],
    launching: ["ASCENT SEQUENCE ACTIVE", "Spacecraft has cleared the integration bay."],
    complete: ["MISSION DEPLOYED", `Spacecraft is now assigned to ${destination.name}.`],
  }[phase];

  return (
    <div className={`launch-sequence launch-sequence-${phase}`}>
      <div>
        <span className="eyebrow">LAUNCH CONTROL // LEVEL {mission.level}</span>
        <h3>{copy[0]}</h3>
        <p>{copy[1]}</p>
      </div>
      <strong className="launch-sequence-status">
        {phase === "countdown" ? "T-00:10" : phase === "launching" ? "T+00:00" : "ORBIT"}
      </strong>
      {phase === "complete" && <button onClick={onReset}>RETURN TO HANGAR</button>}
    </div>
  );
}
