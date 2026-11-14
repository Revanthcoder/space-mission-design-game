import { useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import ComponentCard from "../components/ComponentCard";
import ResourceDashboard from "../components/ResourceDashboard";
import MissionSelector from "../components/MissionSelector";
import WarningPanel from "../components/WarningPanel";
import MissionSelection from "./MissionSelection";
import PlanetSelector from "../components/PlanetSelector";
import ComponentAssemblyVisual from "../components/ComponentAssemblyVisual";
import { componentCategories, missions, solarSystemDestinations, spacecraftComponents } from "../data/spacecraftData";
import { calculateResources, validateMission } from "../engine/resourceCalculations";

export default function SpacecraftBuilder({ onOpenMissionControl }) {
  const [level, setLevel] = useState(1);
  const [selectedDestinationId, setSelectedDestinationId] = useState("earth");
  const [selectedIds, setSelectedIds] = useState(["basic-frame", "medium-panel", "basic-antenna", "flight-computer"]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [inspected, setInspected] = useState(null);
  const [buildingComponent, setBuildingComponent] = useState(null);
  const buildTimer = useRef(null);
  const missionProgressRef = useRef(null);
  const worldsRef = useRef(null);
  const hangarRef = useRef(null);
  const mission = missions[level - 1];
  const selectedDestination = solarSystemDestinations.find((destination) => destination.id === selectedDestinationId) || solarSystemDestinations[2];
  const selected = selectedIds.map((id) => spacecraftComponents.find((item) => item.id === id)).filter(Boolean);
  const resources = useMemo(() => calculateResources(selected, mission), [selectedIds, mission]);
  const validation = useMemo(() => validateMission(selected, resources, mission), [selected, resources, mission]);
  const filteredComponents = spacecraftComponents.filter((item) => (category === "All" || item.category === category) && `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase()));

  const addComponent = (component) => {
    if (component.unique && selectedIds.includes(component.id)) return;
    if (selectedIds.includes(component.id)) return;

    setSelectedIds((ids) => [...ids, component.id]);
    setBuildingComponent(component);
    window.clearTimeout(buildTimer.current);
    buildTimer.current = window.setTimeout(() => setBuildingComponent(null), 1200);
  };
  const removeComponent = (id) => setSelectedIds((ids) => ids.filter((selectedId) => selectedId !== id));
  const unlockNextLevel = () => {
    if (level < missions.length) {
      setLevel(level + 1);
    }
  };
  const scrollTo = (sectionRef) => sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const handleLaunch = () => {
    scrollTo(hangarRef);
    if (validation.valid) {
      window.alert(`Launch sequence ready for ${selectedDestination.name}.`);
    }
  };

  return (
    <div className="designer-shell">
      <Navbar
        onReset={() => setSelectedIds([])}
        onMissions={() => scrollTo(missionProgressRef)}
        onWorlds={() => scrollTo(worldsRef)}
        onHangar={() => scrollTo(hangarRef)}
        onLaunch={handleLaunch}
        onOpenMissionControl={onOpenMissionControl}
      />
      <main className="designer-main">
        <MissionSelection missions={missions} level={level} unlockedLevel={missions.length} onSelect={setLevel} sectionRef={missionProgressRef} />
        <PlanetSelector destinations={solarSystemDestinations} selectedId={selectedDestinationId} onSelect={setSelectedDestinationId} sectionRef={worldsRef} />
        <MissionSelector mission={mission} level={level} destination={selectedDestination} onPrevious={() => setLevel(level - 1)} onNext={unlockNextLevel} />
        <div className="hangar-toolbar">
          <span className="hangar-location"><i /> NASA HIGH-BAY INTEGRATION FACILITY <b>// CLEANROOM BAY 04</b></span>
          <span className="hangar-target">TARGET: <strong>{selectedDestination.name.toUpperCase()}</strong></span>
          <span className="hangar-mode">BUILD MODE / LIVE</span>
        </div>
        <ResourceDashboard resources={resources} mission={mission} />
        <div className="builder-grid hangar-layout">
          <aside className="subsystem-rail">
            <span className="subsystem-rail-title">SUBSYSTEMS</span>
            {componentCategories.filter((item) => item !== "All").map((item, index) => (
              <button
                className={category === item ? "subsystem-active" : ""}
                key={item}
                onClick={() => setCategory(item)}
              >
                <b>{String(index + 1).padStart(2, "0")}</b>
                <small>{item}</small>
              </button>
            ))}
          </aside>
          <section ref={hangarRef} className="builder-panel assembly-panel">
            <div className="section-heading"><div><span className="eyebrow">LIVE ASSEMBLY BAY // ROBOTIC JIG ACTIVE</span><h2>Spacecraft integration</h2></div><span>{selected.length} SYSTEMS / LIVE</span></div>
            <div className={`spacecraft-preview ${buildingComponent ? "spacecraft-preview-building" : ""}`}>
              <div className="hangar-scanline" />
              <div className="spacecraft-body" />
              <div className="spacecraft-window" />
              <div className="spacecraft-nozzle" />
              <div className="solar-wing solar-wing-left" />
              <div className="solar-wing solar-wing-right" />
              <div className="antenna-dot" />
              <div className="spacecraft-orbit-ring spacecraft-orbit-ring-one" />
              <div className="spacecraft-orbit-ring spacecraft-orbit-ring-two" />
              <div className="assembly-beam" />
              {buildingComponent && <ComponentAssemblyVisual component={buildingComponent} />}
              <span>CONFIGURATION PREVIEW // HANGAR CAMERA 01</span>
            </div>
            <div className="assembly-readout"><span><i /> ROBOTIC JIG: <strong>DUAL BUILDER ANIMATES ACTIVE</strong></span><span>TARGET: <strong>{selectedDestination.name.toUpperCase()}</strong></span></div>
            <h3>Installed systems</h3>
            <div className="installed-list">{selected.length === 0 && <p className="muted">Select components to begin assembly.</p>}{selected.map((component) => <div className="installed-item" key={component.id}><span>{component.name}</span><button onClick={() => removeComponent(component.id)}>Remove</button></div>)}</div>
            <WarningPanel validation={validation} />
            <button className="submit-button" disabled={!validation.valid} onClick={handleLaunch}>{validation.valid ? "SUBMIT CONFIGURATION" : "CONFIGURATION NOT READY"}</button>
            {validation.valid && level < missions.length && <button className="unlock-button" onClick={unlockNextLevel}>UNLOCK NEXT MISSION →</button>}
          </section>
          <section className="builder-panel catalogue-panel">
            <div className="section-heading"><div><span className="eyebrow">SYSTEMS INVENTORY</span><h2>Component catalogue</h2></div><span>{filteredComponents.length} ITEMS</span></div>
            <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search components..." />
            <div className="category-tabs">{componentCategories.map((item) => <button key={item} className={category === item ? "category-active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
            <div className="component-grid">{filteredComponents.map((component) => <ComponentCard key={component.id} component={component} installed={selectedIds.includes(component.id)} onAdd={addComponent} onRemove={removeComponent} onInspect={setInspected} />)}</div>
            {inspected && <div className="inspection-box"><strong>{inspected.name}</strong><p>{inspected.description}</p></div>}
          </section>
        </div>
      </main>
    </div>
  );
}
