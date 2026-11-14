import { useEffect, useState } from "react";

const ROLES = [
  {
    role: "Mission Commander",
    responsibility: "Coordinates mission decisions, priorities, and overall objectives.",
    initials: "MC",
  },
  {
    role: "Spacecraft Engineer",
    responsibility: "Owns spacecraft configuration, systems readiness, and engineering checks.",
    initials: "SE",
  },
  {
    role: "Science Specialist",
    responsibility: "Defines scientific objectives, measurements, and payload priorities.",
    initials: "SS",
  },
  {
    role: "Resource Manager",
    responsibility: "Tracks fuel, power, supplies, and mission resource budgets.",
    initials: "RM",
  },
];

function TeamPage({ team, onChange }) {
  const [message, setMessage] = useState("");
  const assignments = new Map(team.map((participant) => [participant.role, participant]));
  const [names, setNames] = useState(() =>
    Object.fromEntries(team.map((participant) => [participant.role, participant.name])),
  );

  useEffect(() => {
    setNames(
      Object.fromEntries(team.map((participant) => [participant.role, participant.name])),
    );
  }, [team]);

  function updateParticipant(role, name) {
    const next = team.filter((participant) => participant.role !== role);
    if (name.trim()) next.push({ role, name: name.trim() });
    onChange(next);
    setMessage("Team assignments saved on this device.");
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div><p className="eyebrow">CREW OPERATIONS / 04</p><h1>Mission team</h1><p className="subtitle">Assign up to four participants to role-based responsibilities on this device.</p></div>
        <span className="team-capacity">{team.length} / 4 ASSIGNED</span>
      </div>
      <div className="team-notice"><span>◎</span><p><strong>Same-device team mode</strong> Team assignments are stored locally and will be included in scored results unless the simulation result provides its own participants. Online collaboration is not enabled without a configured Supabase project.</p></div>
      <div className="team-grid">
        {ROLES.map(({ role, responsibility, initials }, index) => {
          const participant = assignments.get(role);
          return (
            <article className={`panel role-card ${participant ? "assigned" : ""}`} key={role}>
              <div className="role-card-top"><span className="role-avatar">{initials}</span><span className="role-index">ROLE 0{index + 1}</span></div>
              <h2>{role}</h2><p>{responsibility}</p>
              <label className="field">Participant name<input value={names[role] ?? ""} maxLength="40" onChange={(event) => setNames({ ...names, [role]: event.target.value })} onBlur={(event) => updateParticipant(role, event.target.value)} placeholder="Assign a teammate" /></label>
              <span className={`assignment-state ${names[role]?.trim() ? "assigned" : ""}`}><i />{names[role]?.trim() ? "ASSIGNED" : "OPEN ROLE"}</span>
            </article>
          );
        })}
      </div>
      {message && <p className="inline-message" role="status">{message}</p>}
      <section className="panel team-summary"><div className="panel-heading"><div><p className="eyebrow">CREW MANIFEST</p><h2>Current assignments</h2></div></div>{team.length === 0 ? <p className="empty-copy">Assign a participant to a role to build your mission team.</p> : <div className="manifest-list">{team.map((participant) => <div className="manifest-row" key={participant.role}><span className="status-dot" /><strong>{participant.name}</strong><span>{participant.role}</span></div>)}</div>}</section>
    </div>
  );
}

export default TeamPage;
