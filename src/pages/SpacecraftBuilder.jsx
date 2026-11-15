import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import ComponentCard from "../components/ComponentCard";
import ResourceDashboard from "../components/ResourceDashboard";
import MissionSelector from "../components/MissionSelector";
import WarningPanel from "../components/WarningPanel";
import MissionSelection from "./MissionSelection";
import PlanetSelector from "../components/PlanetSelector";
import EarthOrbitShowcase from "../components/EarthOrbitShowcase";
import { componentCategories, missions, solarSystemDestinations, spacecraftComponents } from "../data/spacecraftData";
import { calculateResources, validateMission } from "../engine/resourceCalculations";

const HOME_DESTINATION_ID = "earth";
const SpacecraftIntegrationScene = lazy(() => import("../components/SpacecraftIntegrationScene"));

export default function SpacecraftBuilder({ onOpenMissionControl, onLaunchDesignedMission, onAbout }) {
  const [level, setLevel] = useState(1);
  const [selectedDestinationId, setSelectedDestinationId] = useState(HOME_DESTINATION_ID);
  const [selectedIds, setSelectedIds] = useState(["basic-frame", "medium-panel", "basic-antenna", "flight-computer"]);
  const [category, setCategory] = useState("All");
  const [activeSection, setActiveSection] = useState("mission-progress");
  const [search, setSearch] = useState("");
  const [inspected, setInspected] = useState(null);
  const [integrationEvent, setIntegrationEvent] = useState(null);
  const integrationSequenceRef = useRef(0);
  const missionProgressRef = useRef(null);
  const worldsRef = useRef(null);
  const hangarRef = useRef(null);
  const selectedDestination = solarSystemDestinations.find((destination) => destination.id === selectedDestinationId) || solarSystemDestinations[0];
  const availableMissions = missions.filter((item) => item.destinationIds.includes(selectedDestination.id));
  const missionIndex = Math.max(0, availableMissions.findIndex((item) => item.level === level));
  const mission = availableMissions[missionIndex];
  const selected = selectedIds.map((id) => spacecraftComponents.find((item) => item.id === id)).filter(Boolean);
  const resources = useMemo(() => calculateResources(selected, mission, selectedDestination), [selectedIds, mission, selectedDestination]);
  const validation = useMemo(() => validateMission(selected, resources, mission), [selected, resources, mission]);
  const filteredComponents = spacecraftComponents.filter((item) => (category === "All" || item.category === category) && `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase()));
  const activeSectionLabel = {
    "mission-progress": "MISSION CAMPAIGN",
    worlds: "DESTINATION",
    hangar: "SPACECRAFT BUILD",
  }[activeSection];

  useEffect(() => {
    if (!integrationEvent) return undefined;

    const sequenceTimer = window.setTimeout(() => {
      setIntegrationEvent((current) => current?.eventId === integrationEvent.eventId ? null : current);
    }, 1900);

    return () => window.clearTimeout(sequenceTimer);
  }, [integrationEvent]);

  useEffect(() => {
    const sections = [
      { id: "mission-progress", ref: missionProgressRef },
      { id: "worlds", ref: worldsRef },
      { id: "hangar", ref: hangarRef },
    ];
    let frame = 0;
    const updateActiveSection = () => {
      frame = 0;
      const activationLine = Math.min(180, window.innerHeight * 0.25);
      const currentSection = sections
        .filter(({ ref }) => ref.current?.getBoundingClientRect().top <= activationLine)
        .sort((left, right) => right.ref.current.getBoundingClientRect().top - left.ref.current.getBoundingClientRect().top)[0];
      setActiveSection(currentSection?.id || sections[0].id);
    };
    const handleScroll = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActiveSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateActiveSection();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const addComponent = (component) => {
    if (component.unique && selectedIds.includes(component.id)) return;
    if (selectedIds.includes(component.id)) return;

    setSelectedIds((ids) => [...ids, component.id]);
    setIntegrationEvent({
      eventId: integrationSequenceRef.current++,
      action: "add",
      component,
    });
  };
  const removeComponent = (id) => {
    const component = selected.find((item) => item.id === id);
    if (!component) return;

    setSelectedIds((ids) => ids.filter((selectedId) => selectedId !== id));
    setIntegrationEvent({
      eventId: integrationSequenceRef.current++,
      action: "remove",
      component,
    });
  };
  const changeLevel = (nextLevel) => {
    if (!availableMissions.some((item) => item.level === nextLevel)) return;
    setLevel(nextLevel);
  };
  const changeDestination = (destinationId) => {
    const destination = solarSystemDestinations.find((item) => item.id === destinationId);
    if (!destination) return;

    const nextAvailableMissions = missions.filter((item) => item.destinationIds.includes(destination.id));
    if (nextAvailableMissions.length === 0) return;

    setSelectedDestinationId(destination.id);
    if (!nextAvailableMissions.some((item) => item.level === level)) {
      setLevel(nextAvailableMissions[0].level);
    }
  };
  const moveMission = (offset) => {
    const nextMission = availableMissions[missionIndex + offset];
    if (nextMission) changeLevel(nextMission.level);
  };
  const scrollTo = (sectionRef, sectionId) => {
    setActiveSection(sectionId);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sectionRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };
  const openMissionControl = () => {
    if (!validation.valid) return;

    onLaunchDesignedMission?.({
      missionTitle: mission.title,
      missionLevel: mission.level,
      destinationId: selectedDestination.id,
      destinationName: selectedDestination.name,
      destinationAccent: selectedDestination.accent,
      massKg: resources.mass,
      powerGenerationW: resources.powerGeneration,
      totalCost: resources.totalCost,
      batteryWh: resources.battery,
      componentNames: selected.map((component) => component.name),
      launchComponents: selected.map(({ id, name, category: componentCategory }) => ({
        id,
        name,
        category: componentCategory,
      })),
    });
  };

  return (
    <div className="designer-shell">
      <a className="skip-link" href="#mission-progress">Skip to mission builder</a>
      <Navbar
        activeSection={activeSection}
        launchReady={validation.valid}
        onReset={() => { setSelectedIds([]); setIntegrationEvent(null); }}
        onMissions={() => scrollTo(missionProgressRef, "mission-progress")}
        onWorlds={() => scrollTo(worldsRef, "worlds")}
        onHangar={() => scrollTo(hangarRef, "hangar")}
        onLaunch={openMissionControl}
        onOpenMissionControl={onOpenMissionControl}
        onAbout={onAbout}
      />
      <nav className="builder-breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>MISSION CONTROL</li>
          <li>SPACECRAFT BUILDER</li>
          <li aria-current="page">{activeSectionLabel}</li>
        </ol>
      </nav>
      <main id="main-content" className="designer-main">
        <PlanetSelector destinations={solarSystemDestinations} selectedId={selectedDestinationId} onSelect={changeDestination} sectionRef={worldsRef} />
        <MissionSelection missions={availableMissions} selectedPath={mission.level} onSelect={changeLevel} sectionRef={missionProgressRef} />
        <EarthOrbitShowcase />
        <MissionSelector
          mission={mission}
          path={mission.level}
          destination={selectedDestination}
          canPrevious={missionIndex > 0}
          canNext={missionIndex < availableMissions.length - 1}
          onPrevious={() => moveMission(-1)}
          onNext={() => moveMission(1)}
        />
        <div className="hangar-toolbar">
          <span className="hangar-location"><i /> NASA HIGH-BAY INTEGRATION FACILITY <b>// CLEANROOM BAY 04</b></span>
          <span className="hangar-target">TARGET: <strong>{selectedDestination.name.toUpperCase()}</strong></span>
          <span className="hangar-mode">BUILD MODE / LIVE</span>
        </div>
        <ResourceDashboard resources={resources} mission={mission} />
        <div id="hangar" ref={hangarRef} className="builder-grid hangar-layout">
          <nav className="subsystem-rail" aria-label="Filter by subsystem">
            <span className="subsystem-rail-title">SUBSYSTEMS</span>
            {componentCategories.filter((item) => item !== "All").map((item, index) => (
              <button
                type="button"
                className={category === item ? "subsystem-active" : ""}
                key={item}
                aria-label={item}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                <b>{String(index + 1).padStart(2, "0")}</b>
                <small>{item}</small>
              </button>
            ))}
          </nav>
          <section className="builder-panel assembly-panel" aria-labelledby="assembly-heading">
            <div className="section-heading"><div><span className="eyebrow">LIVE ASSEMBLY BAY // ROBOTIC JIG ACTIVE</span><h2 id="assembly-heading">Spacecraft integration</h2></div><span>{selected.length} SYSTEMS / LIVE</span></div>
            <div className={`spacecraft-preview integration-preview ${integrationEvent ? "integration-preview-active" : ""}`} role="group" aria-label="Interactive three-dimensional spacecraft integration preview">
              <Suspense fallback={<div className="integration-scene-fallback">Loading the 3D integration bay...</div>}>
                <SpacecraftIntegrationScene
                  components={selected}
                  event={integrationEvent}
                  onComplete={(eventId) => {
                    setIntegrationEvent((current) => current?.eventId === eventId ? null : current);
                  }}
                />
              </Suspense>
              <div className="integration-hud" aria-live="polite">
                <span>{integrationEvent ? (integrationEvent.action === "add" ? "COMPONENT INTEGRATION" : "COMPONENT REMOVAL") : "LIVE 3D CONFIGURATION"}</span>
                <strong>{integrationEvent ? integrationEvent.component.name : `${selected.length} systems installed`}</strong>
                <small>{integrationEvent ? (integrationEvent.action === "add" ? "Robotic arm positioning and locking component" : "Release locks and retracting component") : "Drag to orbit · arrows to look · +/− to zoom"}</small>
              </div>
              <span className="integration-preview-caption">3D CLEANROOM // ADD TO ATTACH · REMOVE TO DETACH</span>
            </div>
            <div className="assembly-readout"><span><i /> ROBOTIC JIG: <strong>DUAL BUILDER ANIMATES ACTIVE</strong></span><span>TARGET: <strong>{selectedDestination.name.toUpperCase()}</strong></span></div>
            <h3>Installed systems</h3>
            <ul className="installed-list" aria-label="Installed spacecraft systems">
              {selected.length === 0 && <li className="muted">Select components to begin assembly.</li>}
              {selected.map((component) => (
                <li className="installed-item" key={component.id}>
                  <span>{component.name}</span>
                  <button type="button" aria-label={`Remove ${component.name}`} onClick={() => removeComponent(component.id)}>Remove</button>
                </li>
              ))}
            </ul>
            <WarningPanel validation={validation} />
            <p id="builder-launch-guidance" className={`builder-launch-guidance ${validation.valid ? "builder-launch-guidance-ready" : ""}`} role="status" aria-live="polite">
              {validation.valid
                ? `${mission.title} for ${selectedDestination.name} is ready for Mission Control.`
                : `${validation.messages.filter((message) => !message.ok).length} readiness checks need attention. Review the requirements above.`}
            </p>
            <button className="submit-button" type="button" disabled={!validation.valid} onClick={openMissionControl}>
              {validation.valid ? "CONTINUE TO MISSION CONTROL" : "ADD REQUIRED SYSTEMS TO CONTINUE"}
            </button>
            {validation.valid && missionIndex < availableMissions.length - 1 && <button className="unlock-button" type="button" onClick={() => moveMission(1)}>NEXT COMPATIBLE PATH →</button>}
          </section>
          <section className="builder-panel catalogue-panel">
            <div className="section-heading"><div><span className="eyebrow">SYSTEMS INVENTORY</span><h2>Component catalogue</h2></div><span>{filteredComponents.length} ITEMS</span></div>
            <label className="search-label" htmlFor="component-search">Search components</label>
            <input id="component-search" className="search-input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or subsystem" />
            <div className="category-tabs" role="group" aria-label="Filter components by subsystem">{componentCategories.map((item) => <button type="button" key={item} className={category === item ? "category-active" : ""} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
            <div className="component-grid">{filteredComponents.map((component) => <ComponentCard key={component.id} component={component} installed={selectedIds.includes(component.id)} onAdd={addComponent} onRemove={removeComponent} onInspect={setInspected} />)}</div>
            {inspected && <div className="inspection-box"><strong>{inspected.name}</strong><p>{inspected.description}</p></div>}
          </section>
        </div>
      </main>
    </div>
  );
}
