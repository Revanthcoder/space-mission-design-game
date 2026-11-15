export default function Navbar({
  activeSection,
  launchReady,
  onReset,
  onMissions,
  onWorlds,
  onHangar,
  onLaunch,
  onOpenMissionControl,
  onAbout,
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">✦</span>
        <span><strong>MISSION CONTROL</strong><small>SPACECRAFT DESIGN LAB</small></span>
      </div>
      <nav className="hangar-nav" aria-label="Builder sections">
        <button type="button" onClick={onAbout}>ABOUT</button>
        <button type="button" aria-current={activeSection === "mission-progress" ? "location" : undefined} onClick={onMissions}>MISSIONS</button>
        <button type="button" aria-current={activeSection === "worlds" ? "location" : undefined} onClick={onWorlds}>WORLDS</button>
        <button type="button" aria-current={activeSection === "hangar" ? "location" : undefined} onClick={onHangar}>BUILD</button>
        <button
          type="button"
          className="hangar-nav-cta"
          disabled={!launchReady}
          aria-describedby={!launchReady ? "builder-launch-guidance" : undefined}
          onClick={onLaunch}
        >
          {launchReady ? "MISSION CONTROL" : "COMPLETE BUILD"}
          <span aria-hidden="true">↗</span>
        </button>
      </nav>
      <div className={`system-status ${launchReady ? "system-status-ready" : ""}`}>
        <span
          className="builder-status"
          role="status"
          aria-live="polite"
          aria-label={launchReady ? "Spacecraft build ready for Mission Control" : "Spacecraft build in progress; complete requirements to continue"}
        >
          <i className="online-dot" aria-hidden="true" />
          <span className="builder-status-full">{launchReady ? "CRAFT READY" : "BUILD IN PROGRESS"}</span>
          <span className="builder-status-compact" aria-hidden="true">{launchReady ? "READY" : "BUILD"}</span>
        </span>
        <button className="secondary-button" type="button" aria-label="Reset spacecraft" onClick={onReset}>
          <span className="utility-label-full">Reset craft</span>
          <span className="utility-label-compact" aria-hidden="true">RESET</span>
        </button>
        <button className="secondary-button simulator-link" type="button" aria-label="Open Mission Control simulator without a builder design" onClick={onOpenMissionControl}>
          <span className="utility-label-full">Open simulator</span>
          <span className="utility-label-compact" aria-hidden="true">SIM</span>
        </button>
      </div>
    </header>
  );
}
