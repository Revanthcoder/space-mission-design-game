export default function Navbar({ onReset, onMissions, onWorlds, onHangar, onLaunch }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">✦</span>
        <span><strong>MISSION CONTROL</strong><small>SPACECRAFT DESIGN LAB</small></span>
      </div>
      <nav className="hangar-nav" aria-label="Module sections">
        <button type="button" onClick={onMissions}>MISSIONS</button>
        <button type="button" onClick={onWorlds}>WORLDS</button>
        <button type="button" className="hangar-nav-active" onClick={onHangar}>HANGAR</button>
        <button type="button" onClick={onLaunch}>LAUNCH</button>
      </nav>
      <div className="system-status"><span className="online-dot" /> SYSTEMS ONLINE <button className="secondary-button" onClick={onReset}>Reset craft</button></div>
    </header>
  );
}
