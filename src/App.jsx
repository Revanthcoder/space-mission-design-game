import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BIONUTRIENTS_TARGETS,
  INSTRUMENTS,
  MISSION_EVENTS,
  MISSION_STAGES,
  NASA_REFERENCES,
  OBJECTIVES,
  ORBITS,
  ROCKETS,
} from "./data/missionCatalog.js";
import {
  advanceSimulation,
  applyMissionEventChoice,
  calculateMissionMetrics,
  calculateMissionResult,
  createSimulationState,
  rollMissionEvent,
  validateMissionReadiness,
} from "./engine/missionRules.js";
import {
  createMissionReport,
  loadMissionReports,
  loadTeamSettings,
  saveMissionReports,
  saveTeamSettings,
} from "./engine/missionReports.js";
import { createMissionDesignFromBuilder } from "./engine/builderHandoff.js";
import { solarSystemDestinations } from "./data/spacecraftData.js";
import MissionVisualization from "./components/MissionVisualization.jsx";
import LaunchSequence from "./components/LaunchSequence.jsx";
import "./App.css";
import "./MissionControl.css";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";

const INITIAL_DESIGN = {
  objectiveId: "earth-observation",
  rocketId: "kestrel",
  orbitId: "polar",
  instrumentIds: ["multispectral-imager"],
  busMassKg: 120,
  powerGenerationW: 190,
  budgetCredits: 110,
  bioNutrients: {
    replicateSamples: 12,
    sampleVolumeMl: 30,
    containerMassG: 230,
    occupiedVolumeMl: 280,
  },
};

const RESOURCE_VALIDATOR_CONTRACT = "resourceValidator(metrics) -> [{ id, label, passed, message }]";
const TEAM_ROLES = [
  { id: "Mission Commander", responsibility: "Coordinates mission goals and team decisions." },
  { id: "Spacecraft Engineer", responsibility: "Monitors spacecraft health, power, and configuration." },
  { id: "Science Specialist", responsibility: "Prioritizes observations and scientific return." },
  { id: "Resource Manager", responsibility: "Tracks budget, data, and mission lifetime." },
];
const DEFAULT_CREW = TEAM_ROLES.map((role, index) => ({
  id: `crew-${index + 1}`,
  name: `Player ${index + 1}`,
  role: role.id,
}));

function createMissionRunId() {
  return globalThis.crypto?.randomUUID?.()
    || `mission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function MissionControl({ resourceValidator, onBackToBuilder, builderDesign }) {
  const [design, setDesign] = useState(() => (
    builderDesign ? createMissionDesignFromBuilder(builderDesign) : INITIAL_DESIGN
  ));
  const [view, setView] = useState("design");
  const [launchSequenceActive, setLaunchSequenceActive] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [pendingEvent, setPendingEvent] = useState(null);
  const [showSources, setShowSources] = useState(false);
  const [teamName, setTeamName] = useState("Mission Team");
  const [crew, setCrew] = useState(DEFAULT_CREW);
  const [activeTeamName, setActiveTeamName] = useState("Mission Team");
  const [activeCrew, setActiveCrew] = useState(DEFAULT_CREW);
  const [savedReports, setSavedReports] = useState([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [historyAvailable, setHistoryAvailable] = useState(false);
  const [historyStorageError, setHistoryStorageError] = useState("");
  const [teamStorageError, setTeamStorageError] = useState("");
  const [runId, setRunId] = useState("");
  const [archiveReturnView, setArchiveReturnView] = useState("design");

  useEffect(() => {
    try {
      setSavedReports(loadMissionReports());
      setHistoryReady(true);
      setHistoryAvailable(true);
    } catch (error) {
      console.error(error);
      setHistoryStorageError(error.message);
      setHistoryReady(true);
    }
    try {
      const savedTeam = loadTeamSettings();
      if (savedTeam) {
        setTeamName(savedTeam.teamName);
        setCrew(savedTeam.crew);
      }
    } catch (error) {
      console.error(error);
      setTeamStorageError(error.message);
    }
  }, []);

  const metrics = useMemo(() => calculateMissionMetrics(design), [design]);
  const checks = useMemo(
    () => validateMissionReadiness(design, resourceValidator),
    [design, resourceValidator],
  );
  const ready = checks.every((check) => check.passed);
  const readinessCount = checks.filter((check) => check.passed).length;
  const selectedObjective = useMemo(() => {
    const objective = OBJECTIVES.find((item) => item.id === design.objectiveId);
    if (design.objectiveId !== "planetary-survey" || !builderDesign?.destinationName) return objective;
    return {
      ...objective,
      name: `Survey ${builderDesign.destinationName}`,
      description: `Collect contextual imagery and radiation data around ${builderDesign.destinationName} in an illustrative mission scenario.`,
    };
  }, [design.objectiveId, builderDesign?.destinationName]);
  const selectedOrbit = useMemo(() => {
    const orbit = ORBITS.find((item) => item.id === design.orbitId);
    if (design.orbitId !== "planetary-transfer" || !builderDesign?.destinationName) return orbit;
    return {
      ...orbit,
      name: `Illustrative transfer to ${builderDesign.destinationName}`,
      destinationId: builderDesign.destinationId,
      destinationName: builderDesign.destinationName,
    };
  }, [design.orbitId, builderDesign?.destinationId, builderDesign?.destinationName]);
  const launchDestination = solarSystemDestinations.find(
    (destination) => destination.id === builderDesign?.destinationId,
  ) || solarSystemDestinations[0];
  const activeStage = simulation ? MISSION_STAGES[simulation.stageIndex] : null;

  function chooseObjective(objectiveId) {
    const objective = OBJECTIVES.find((item) => item.id === objectiveId);
    const orbitId = objective.orbitIds[0];
    const compatibleRocket = ROCKETS.find((rocket) =>
      rocket.orbitIds.includes(orbitId)
      && rocket.missionTypes.some((type) => objective.missionTypes.includes(type)),
    );
    setDesign((previous) => ({
      ...previous,
      objectiveId,
      orbitId,
      rocketId: compatibleRocket ? compatibleRocket.id : previous.rocketId,
      instrumentIds: objective.recommendedInstrumentIds,
    }));
  }

  function toggleInstrument(instrumentId) {
    setDesign((previous) => {
      const selected = previous.instrumentIds.includes(instrumentId);
      return {
        ...previous,
        instrumentIds: selected
          ? previous.instrumentIds.filter((id) => id !== instrumentId)
          : [...previous.instrumentIds, instrumentId],
      };
    });
  }

  function updateBioNutrients(key, value) {
    setDesign((previous) => ({
      ...previous,
      bioNutrients: { ...previous.bioNutrients, [key]: Number(value) },
    }));
  }

  function beginLaunch() {
    if (!ready) return;
    setRunId(createMissionRunId());
    setActiveTeamName(teamName);
    setActiveCrew(crew);
    setLaunchSequenceActive(true);
  }

  const cancelLaunchSequence = useCallback(() => {
    setLaunchSequenceActive(false);
  }, []);

  const completeLaunchSequence = useCallback(() => {
    setLaunchSequenceActive(false);
    const launchCompleteState = createSimulationState();
    const deployedState = advanceSimulation(advanceSimulation(launchCompleteState));
    setSimulation(deployedState);
    setPendingEvent(null);
    setView("flight");
  }, []);

  function resetMission() {
    setSimulation(null);
    setPendingEvent(null);
    setLaunchSequenceActive(false);
    setRunId("");
    setView("design");
  }

  function advanceMission() {
    if (!simulation || pendingEvent) return;
    const next = advanceSimulation(simulation);
    setSimulation(next);
    if (next.stageIndex >= 1 && next.stageIndex <= 4) {
      const event = rollMissionEvent(next);
      if (event) setPendingEvent(event);
    }
    if (next.stageIndex === MISSION_STAGES.length - 1) setView("report");
  }

  function resolveEvent(choiceId) {
    setSimulation((current) => applyMissionEventChoice(current, pendingEvent, choiceId));
    setPendingEvent(null);
  }

  const result = simulation ? calculateMissionResult(simulation, metrics, selectedObjective) : null;
  const encounteredProblemTitles = simulation
    ? simulation.eventsSeen
      .filter((eventId) => ["communications-interruption", "solar-power-reduction", "instrument-malfunction"].includes(eventId))
      .map((eventId) => MISSION_EVENTS.find((event) => event.id === eventId)?.title)
      .filter(Boolean)
    : [];
  const report = useMemo(() => {
    if (!simulation || !result) return null;
    return createMissionReport({
      id: runId,
      createdAt: new Date().toISOString(),
      missionName: builderDesign?.missionTitle || `${selectedObjective?.name || "Space"} Mission`,
      objective: selectedObjective,
      design,
      metrics,
      orbit: selectedOrbit,
      simulation,
      result,
      teamName: activeTeamName,
      crew: activeCrew,
    });
  }, [
    activeCrew,
    activeTeamName,
    builderDesign?.missionTitle,
    design,
    metrics,
    result,
    runId,
    selectedObjective,
    selectedOrbit,
    simulation,
  ]);

  function persistTeam(nextTeamName, nextCrew) {
    try {
      saveTeamSettings({ teamName: nextTeamName, crew: nextCrew });
      setTeamStorageError("");
    } catch (error) {
      console.error(error);
      setTeamStorageError(error.message);
    }
  }

  function updateTeamName(value) {
    setTeamName(value);
    persistTeam(value, crew);
  }

  function updateCrewMember(memberId, changes) {
    const nextCrew = crew.map((member) => (
      member.id === memberId ? { ...member, ...changes } : member
    ));
    setCrew(nextCrew);
    persistTeam(teamName, nextCrew);
  }

  function addCrewMember() {
    if (crew.length >= TEAM_ROLES.length) return;
    const role = TEAM_ROLES.find((item) => !crew.some((member) => member.role === item.id));
    if (!role) return;
    const nextCrew = [
      ...crew,
      { id: createMissionRunId(), name: `Player ${crew.length + 1}`, role: role.id },
    ];
    setCrew(nextCrew);
    persistTeam(teamName, nextCrew);
  }

  function removeCrewMember(memberId) {
    if (crew.length <= 1) return;
    const nextCrew = crew.filter((member) => member.id !== memberId);
    setCrew(nextCrew);
    persistTeam(teamName, nextCrew);
  }

  function saveCurrentReport() {
    if (!report || !historyReady || !historyAvailable || !runId) return;
    if (savedReports.some((savedReport) => savedReport.id === runId)) return;
    const nextReports = [{ ...report, createdAt: new Date().toISOString() }, ...savedReports];
    try {
      saveMissionReports(nextReports);
      setSavedReports(nextReports);
      setHistoryStorageError("");
    } catch (error) {
      console.error(error);
      setHistoryStorageError(error.message);
    }
  }

  function openArchive() {
    if (view === "archive") {
      setView(archiveReturnView);
      return;
    }
    setArchiveReturnView(view);
    setView("archive");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#mission-control" onClick={(event) => event.preventDefault()} aria-label="Mission Control home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>MISSION<span className="brand-light">CONTROL</span></span>
        </a>
        <div className="topbar-right">
          <span className="learning-badge"><span /> EDUCATIONAL SIMULATION</span>
          <span className="topbar-divider" />
          <span className="crew-label"><span className="crew-avatar">MC</span> {view === "flight" || view === "report" ? activeTeamName : teamName}</span>
          <button
            className="archive-button"
            type="button"
            aria-label={view === "archive" ? "Return to mission" : `Open mission archive (${savedReports.length} saved reports)`}
            onClick={openArchive}
          >
            {view === "archive" ? "BACK TO MISSION" : "MISSION ARCHIVE"} <span>{savedReports.length}</span>
          </button>
          <button className="module-switch-button" type="button" aria-label="Return to spacecraft builder" onClick={onBackToBuilder}>SPACECRAFT BUILDER</button>
        </div>
      </header>

      {[historyStorageError, teamStorageError].filter(Boolean).map((message) => (
        <div className="storage-alert" role="alert" key={message}>{message}</div>
      ))}

      <section className="page-intro">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" /> SPACE MISSION DESIGN LAB</p>
          <h1>Plan a mission.<br /><span>Make every choice count.</span></h1>
          <p className="intro-copy">
            Shape a science objective into a mission, balance the engineering trade-offs,
            and see how your decisions play out in an illustrative simulation.
          </p>
        </div>
        <div className="mission-stamp">
          <span className="stamp-icon" aria-hidden="true">✦</span>
          <span><strong>MISSION SERIES 01</strong><small>Interactive design exercise</small></span>
        </div>
      </section>

      {builderDesign && (
        <section className="builder-handoff-card" aria-label="Imported spacecraft design">
          <div>
            <p className="section-kicker">SPACECRAFT DESIGN LINKED</p>
            <h2>{builderDesign.missionTitle} · {builderDesign.destinationName}</h2>
            <p>{builderDesign.massKg} kg · {builderDesign.powerGenerationW} W total power generation · {builderDesign.batteryWh} Wh battery</p>
          </div>
          <p>
            Your validated design is preloaded into Mission Control. Review the plan and simplified estimates,
            then authorize launch when every check passes.
            {!["earth", "mars"].includes(builderDesign.destinationId)
              && ` The simulator has no dedicated ${builderDesign.destinationName} trajectory; its available paths are illustrative.`}
          </p>
          <small>Installed systems: {builderDesign.componentNames.join(", ")}</small>
        </section>
      )}

      <nav className="workflow-nav" aria-label="Mission workflow">
        <WorkflowStep number="01" label="DESIGN" active={view === "design"} onClick={() => setView("design")} />
        <span className="workflow-connector" />
        <WorkflowStep number="02" label="LAUNCH & FLIGHT" active={view === "flight"} disabled={!simulation} onClick={() => simulation && setView("flight")} />
        <span className="workflow-connector" />
        <WorkflowStep number="03" label="MISSION REPORT" active={view === "report"} disabled={!simulation || simulation.stageIndex < MISSION_STAGES.length - 1} onClick={() => simulation?.stageIndex === MISSION_STAGES.length - 1 && setView("report")} />
      </nav>

      {view === "design" && (
        <div className="workspace">
          <div className="design-column">
            <section className="section-block objective-block">
              <SectionHeading index="01" title="Define the science" subtitle="Choose the question your mission is built to answer." />
              <div className="objective-grid">
                {OBJECTIVES.map((objective) => (
                  <button
                    className={`objective-card ${design.objectiveId === objective.id ? "is-selected" : ""}`}
                    key={objective.id}
                    type="button"
                    aria-pressed={design.objectiveId === objective.id}
                    onClick={() => chooseObjective(objective.id)}
                  >
                    <span className={`objective-icon objective-icon-${objective.id}`} aria-hidden="true">{objectiveIcon(objective.id)}</span>
                    <span className="objective-category">{objective.category}</span>
                    <strong>{objective.name}</strong>
                    <span className="objective-description">{objective.description}</span>
                    <span className="card-selection" aria-hidden="true">{design.objectiveId === objective.id ? "SELECTED" : "SELECT"}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="section-block">
              <SectionHeading index="02" title="Configure the spacecraft" subtitle="Instrument choices change your mass, power demand, cost, and data return." />
              <div className="instrument-grid">
                {INSTRUMENTS.filter((instrument) => instrument.objectives.includes(design.objectiveId)).map((instrument) => {
                  const selected = design.instrumentIds.includes(instrument.id);
                  return (
                    <label className={`instrument-card ${selected ? "is-selected" : ""}`} key={instrument.id}>
                      <input type="checkbox" checked={selected} onChange={() => toggleInstrument(instrument.id)} />
                      <span className="custom-checkbox" aria-hidden="true">{selected ? "✓" : ""}</span>
                      <span className="instrument-main">
                        <strong>{instrument.name}</strong>
                        <small>{instrument.description}</small>
                        <span className="instrument-stats">
                          <span>{instrument.massKg} kg</span><span>{instrument.powerW} W</span>
                          <span>{instrument.costCredits} cr</span><span>{instrument.dataPerDayGb} GB/day</span>
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="control-grid spacecraft-controls">
                <RangeControl
                  label="Spacecraft bus mass"
                  value={design.busMassKg}
                  min={60}
                  max={600}
                  step={10}
                  unit="kg"
                  onChange={(value) => setDesign((previous) => ({ ...previous, busMassKg: Number(value) }))}
                />
                <RangeControl
                  label="Available power generation"
                  value={design.powerGenerationW}
                  min={40}
                  max={300}
                  step={10}
                  unit="W"
                  onChange={(value) => setDesign((previous) => ({ ...previous, powerGenerationW: Number(value) }))}
                />
                <RangeControl
                  label="Mission budget"
                  value={design.budgetCredits}
                  min={40}
                  max={220}
                  step={5}
                  unit="credits"
                  onChange={(value) => setDesign((previous) => ({ ...previous, budgetCredits: Number(value) }))}
                />
              </div>
              {design.objectiveId === "bionutrients" && (
                <BioNutrientsPanel values={design.bioNutrients} onChange={updateBioNutrients} />
              )}
            </section>

            <section className="section-block">
              <SectionHeading index="03" title="Select a launch vehicle" subtitle="Fictional educational vehicles; capacities and costs are configurable game values." />
              <div className="rocket-grid">
                {ROCKETS.map((rocket, index) => (
                  <button
                    className={`rocket-card ${design.rocketId === rocket.id ? "is-selected" : ""}`}
                    type="button"
                    key={rocket.id}
                    aria-pressed={design.rocketId === rocket.id}
                    onClick={() => setDesign((previous) => ({ ...previous, rocketId: rocket.id }))}
                  >
                    <span className="rocket-art" aria-hidden="true"><RocketGlyph variant={index} /></span>
                    <span className="rocket-class">{rocket.className}</span>
                    <strong>{rocket.name}</strong>
                    <span className="rocket-description">{rocket.description}</span>
                    <span className="rocket-data"><b>{rocket.payloadCapacityKg.toLocaleString()} kg</b><small>payload capacity*</small></span>
                    <span className="rocket-cost"><b>{rocket.costCredits}</b> credits</span>
                    <span className="rocket-select">{design.rocketId === rocket.id ? "SELECTED" : "SELECT VEHICLE"}</span>
                  </button>
                ))}
              </div>
              <p className="assumption-note">*Educational capacity values for this game only; not real launch-vehicle performance.</p>
            </section>

            <section className="section-block orbit-block">
              <SectionHeading index="04" title="Choose an orbit or transfer" subtitle="Each destination changes coverage, communications, and the scenario's time scale." />
              <div className="orbit-list">
                {ORBITS.map((orbit, index) => (
                  <button
                    className={`orbit-card ${design.orbitId === orbit.id ? "is-selected" : ""}`}
                    type="button"
                    key={orbit.id}
                    aria-pressed={design.orbitId === orbit.id}
                    onClick={() => setDesign((previous) => ({ ...previous, orbitId: orbit.id }))}
                  >
                    <span className={`orbit-emblem orbit-emblem-${index}`} aria-hidden="true"><i /></span>
                    <span className="orbit-card-body">
                      <strong>{orbit.name}</strong>
                      <small>{orbit.description}</small>
                      <span className="orbit-facts"><span><b>SUITABILITY</b>{orbit.suitability}</span><span><b>COVERAGE</b>{orbit.coverage}</span><span><b>COMMS</b>{orbit.communications}</span></span>
                    </span>
                    <span className="orbit-duration"><b>{orbit.duration}</b><small>SIM TIME</small></span>
                  </button>
                ))}
              </div>
              <p className="assumption-note">Orbit descriptions are simplified educational summaries. Transfer paths and time scales are illustrative, not calculated mission trajectories.</p>
            </section>
          </div>

          <aside className="readiness-column">
            <div className="readiness-card">
              <div className="readiness-heading">
                <div><p className="section-kicker">PRE-LAUNCH REVIEW</p><h2>Mission readiness</h2></div>
                <span className={`readiness-score ${ready ? "score-ready" : ""}`}>{readinessCount}<small>/{checks.length}</small></span>
              </div>
              <p className="readiness-copy">{ready ? "All required checks are green. Your mission is ready for launch." : "Resolve the items below before the launch sequence can begin."}</p>
              <div className="readiness-meter"><span style={{ width: `${checks.length ? (readinessCount / checks.length) * 100 : 0}%` }} /></div>
              <ul className="check-list">
                {checks.map((check) => (
                  <li className={check.passed ? "check-passed" : "check-failed"} key={check.id}>
                    <span className="check-icon" aria-hidden="true">{check.passed ? "✓" : "!"}</span>
                    <span><strong>{check.label}</strong><small>{check.message}</small></span>
                  </li>
                ))}
              </ul>
              <div className="readiness-divider" />
              <div className="readiness-cost">
                <span>Projected mission cost</span><strong>{metrics.costCredits} <small>credits</small></strong>
              </div>
              <button className="launch-button" type="button" disabled={!ready} onClick={beginLaunch}>
                <span className="launch-button-icon" aria-hidden="true">↗</span>
                BEGIN LAUNCH SEQUENCE
              </button>
              <p className="launch-caption"><span className="lock-icon" aria-hidden="true">⌑</span> Launch unlocks when every check passes.</p>
            </div>

            <div className="summary-card">
              <div className="summary-heading"><span className="summary-icon" aria-hidden="true">⌁</span><strong>MISSION SNAPSHOT</strong></div>
              <dl className="summary-list">
                <SummaryRow label="Objective" value={selectedObjective?.name || "Not selected"} />
                <SummaryRow label="Orbit" value={selectedOrbit?.name || "Not selected"} />
                <SummaryRow label="Spacecraft mass" value={`${metrics.massKg} kg`} />
                <SummaryRow label="Power load" value={`${metrics.powerLoadW} W`} />
                <SummaryRow label="Data potential" value={`${metrics.dataPerDayGb} GB/day`} />
              </dl>
              <p className="summary-footnote">Planning estimates update as you change the design.</p>
            </div>

            <section className="team-card" aria-labelledby="team-card-title">
              <div className="team-card-heading">
                <div><p className="section-kicker">SAME-DEVICE COLLABORATION</p><h2 id="team-card-title">Mission crew</h2></div>
                <span>{crew.length}/4</span>
              </div>
              <label className="team-name-control">
                <span>Team name</span>
                <input value={teamName} maxLength={48} onChange={(event) => updateTeamName(event.target.value)} />
              </label>
              <p className="team-mode-note">Work together on this device. Mission scores are shared with each listed participant; online synchronization is not enabled.</p>
              <div className="crew-editor-list">
                {crew.map((member) => {
                  const role = TEAM_ROLES.find((item) => item.id === member.role);
                  return (
                    <div className="crew-editor-row" key={member.id}>
                      <label>
                        <span>Participant</span>
                        <input value={member.name} maxLength={32} onChange={(event) => updateCrewMember(member.id, { name: event.target.value })} />
                      </label>
                      <label>
                        <span>Role</span>
                        <select value={member.role} onChange={(event) => updateCrewMember(member.id, { role: event.target.value })}>
                          {TEAM_ROLES.map((item) => (
                            <option
                              key={item.id}
                              value={item.id}
                              disabled={item.id !== member.role && crew.some((person) => person.id !== member.id && person.role === item.id)}
                            >
                              {item.id}
                            </option>
                          ))}
                        </select>
                      </label>
                      <small>{role?.responsibility}</small>
                      {crew.length > 1 && <button type="button" className="crew-remove-button" onClick={() => removeCrewMember(member.id)} aria-label={`Remove ${member.name || member.role}`}>REMOVE</button>}
                    </div>
                  );
                })}
              </div>
              <button className="crew-add-button" type="button" onClick={addCrewMember} disabled={crew.length >= TEAM_ROLES.length}>
                {crew.length >= TEAM_ROLES.length ? "ALL FOUR ROLES ASSIGNED" : "ADD TEAM MEMBER"}
              </button>
            </section>

            <div className="source-card">
              <div className="source-icon" aria-hidden="true">✳</div>
              <div><strong>NASA-informed learning</strong><p>Mission segments, lifecycle, and a real science-mission example inform this experience.</p></div>
              <button type="button" aria-expanded={showSources} onClick={() => setShowSources((shown) => !shown)}>
                {showSources ? "HIDE SOURCES" : "VIEW SOURCES"} <span aria-hidden="true">{showSources ? "−" : "+"}</span>
              </button>
              {showSources && <ReferenceList />}
            </div>
          </aside>
        </div>
      )}

      {view === "flight" && simulation && activeStage && (
        <section className="flight-workspace">
          <div className="flight-main">
            <MissionVisualization orbit={selectedOrbit} progress={simulation.progress} objective={selectedObjective} />
            <div className="flight-lower">
              <div className="stage-panel">
                <div className="panel-heading">
                  <div><p className="section-kicker">MISSION TIMELINE</p><h2>Flight sequence</h2></div>
                  <span className="stage-count">STAGE {String(simulation.stageIndex + 1).padStart(2, "0")} / 06</span>
                </div>
                <div className="timeline">
                  {MISSION_STAGES.map((stage, index) => (
                    <div className={`timeline-stage ${index === simulation.stageIndex ? "stage-current" : index < simulation.stageIndex ? "stage-done" : ""}`} key={stage.id}>
                      <span className="timeline-node">{index < simulation.stageIndex ? "✓" : String(index + 1).padStart(2, "0")}</span>
                      <span className="timeline-text"><strong>{stage.name}</strong><small>{stage.description}</small></span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="stage-detail-panel">
                <p className="section-kicker">CURRENT OPERATION</p>
                <h2>{activeStage.name}</h2>
                <p>{activeStage.description}</p>
                <div className="progress-label"><span>MISSION PROGRESS</span><b>{simulation.progress}%</b></div>
                <div className="progress-track"><span style={{ width: `${simulation.progress}%` }} /></div>
                {simulation.stageIndex < MISSION_STAGES.length - 1 ? (
                  <button className="primary-button" type="button" disabled={Boolean(pendingEvent)} onClick={advanceMission}>
                    {pendingEvent ? "RESOLVE EVENT TO CONTINUE" : `ADVANCE TO ${MISSION_STAGES[simulation.stageIndex + 1].name.toUpperCase()}`} <span aria-hidden="true">→</span>
                  </button>
                ) : (
                  <button className="primary-button" type="button" onClick={() => setView("report")}>VIEW MISSION REPORT <span aria-hidden="true">→</span></button>
                )}
              </div>
            </div>
          </div>
          <aside className="telemetry-column">
            <div className="telemetry-card">
              <p className="section-kicker">SPACECRAFT TELEMETRY</p>
              <h2>Live mission status</h2>
              <TelemetryMetric label="Power reserve" value={`${simulation.powerPercent}%`} percent={simulation.powerPercent} tone={simulation.powerPercent < 25 ? "warning" : ""} />
              <div className="telemetry-status"><span>Communication</span><b className={simulation.communication.includes("Interrupted") ? "status-warning" : ""}><i />{simulation.communication}</b></div>
              <TelemetryMetric label="Data collected" value={`${simulation.dataCollectedGb} GB`} percent={Math.min(100, simulation.dataCollectedGb)} />
              <TelemetryMetric label="Science return" value={`${simulation.scienceScore}%`} percent={simulation.scienceScore} />
              <div className="telemetry-foot"><span>MISSION ELAPSED</span><strong>{simulation.missionDays} <small>SIM DAYS</small></strong></div>
            </div>
            <div className="mission-brief-card">
              <p className="section-kicker">MISSION OBJECTIVE</p>
              <h3>{selectedObjective?.name}</h3>
              <p>{selectedObjective?.description}</p>
              <div className="brief-divider" />
              <span className="brief-label">SELECTED ORBIT</span>
              <strong>{selectedOrbit?.name}</strong>
              <p className="educational-tag">Illustrative educational simulation — not real flight dynamics.</p>
            </div>
          </aside>
        </section>
      )}

      {view === "archive" && (
        <MissionArchive
          reports={savedReports}
          historyReady={historyReady}
          historyAvailable={historyAvailable}
          onBack={() => setView(archiveReturnView)}
          onExport={downloadMissionReport}
        />
      )}

      {view === "report" && simulation && result && report && (
        <section className="report-workspace report-dashboard-shell">
          <div className="report-topline">
            <div><span className="report-breadcrumb">MISSION CONTROL <i /> FLIGHT ANALYTICS <i /> DEBRIEF</span><span className="report-record-id">RECORD {runId.slice(-8).toUpperCase()}</span></div>
            <nav aria-label="Report sections" className="report-section-nav">
              <a href="#flight-analytics">Analytics</a>
              <a href="#scorecard">Scorecard</a>
              <a href="#mission-record">Mission record</a>
            </nav>
          </div>
          <header className={`report-hero report-hero-v2 ${result.objectiveAchieved ? "report-success" : "report-incomplete"}`}>
            <div className="report-hero-orbit" aria-hidden="true"><i /><b /></div>
            <div className="report-hero-copy">
              <div className={`mission-status-pill ${result.objectiveAchieved ? "status-success" : "status-incomplete"}`}>
                <span /> {result.outcome.toUpperCase()} · MISSION DEBRIEF
              </div>
              <h2>{report.missionName}</h2>
              <p className="report-hero-objective">{selectedObjective?.description}</p>
              <div className="report-hero-facts">
                <span><small>DESTINATION PATH</small><strong>{selectedOrbit?.name || "Orbit not selected"}</strong></span>
                <span><small>LAUNCH VEHICLE</small><strong>{metrics.rocket?.name || "Not selected"}</strong></span>
                <span><small>SIMULATED DURATION</small><strong>{simulation.missionDays} days</strong></span>
              </div>
            </div>
            <MissionScoreRing score={result.total} outcome={result.outcome} />
          </header>

          <section className="results-dashboard" aria-label="Mission results dashboard">
            <div className="results-kpis">
              <ResultKpi accent="cyan" icon="✦" label="Science return" value={`${simulation.scienceScore}%`} detail={`${simulation.dataCollectedGb} GB of data returned`} />
              <ResultKpi accent="violet" icon="⌘" label="Engineering fit" value={`${Math.round((result.categories.find((category) => category.id === "engineering").points / 25) * 100)}%`} detail="Configuration score" />
              <ResultKpi accent="amber" icon="◌" label="Power consumed" value={`${100 - simulation.powerPercent}%`} detail={`${simulation.powerPercent}% reserve remains`} />
              <ResultKpi accent="blue" icon="⌁" label="Communication" value={`${result.categories.find((category) => category.id === "communication").points}/15`} detail={simulation.communication} />
              <ResultKpi accent="green" icon="◷" label="Mission lifetime" value={`${simulation.missionDays} d`} detail={simulation.instrumentOperational ? "Payload operational" : "Payload offline"} />
            </div>
          </section>

          <section className="dashboard-section" id="flight-analytics">
            <div className="dashboard-section-heading">
              <div><span className="section-kicker">01 / FLIGHT ANALYTICS</span><h3>Mission performance</h3></div>
              <span className="section-heading-note">Recorded simulation telemetry · not flight predictions</span>
            </div>
            <div className="primary-analytics-grid">
              <MissionTelemetryChart history={simulation.telemetryHistory} />
              <ResourceAnalysisCard metrics={metrics} simulation={simulation} />
            </div>
          </section>

          <section className="dashboard-section" id="scorecard">
            <div className="dashboard-section-heading scorecard-section-heading">
              <div><span className="section-kicker">02 / TRANSPARENT EVALUATION</span><h3>Mission scorecard</h3><p>Every point is tied to a measured simulation result or configured spacecraft value.</p></div>
              <div className="scorecard-total"><strong>{result.total}</strong><span>/ 100 POINTS</span></div>
            </div>
            <div className="score-category-grid">
              {result.categories.map((category, index) => (
                <ScoreCategoryCard category={category} index={index} key={category.id} />
              ))}
            </div>
          </section>

          <section className="dashboard-section" id="mission-record">
            <div className="dashboard-section-heading">
              <div><span className="section-kicker">03 / MISSION RECORD</span><h3>Configuration, events & next steps</h3></div>
            </div>
            <div className="report-details-grid">
              <article className="report-detail-card objective-detail-card">
                <div className="detail-card-heading"><span className="detail-card-icon">01</span><div><span className="section-kicker">OBJECTIVE OUTCOME</span><h4>{selectedObjective?.name}</h4></div></div>
                <p>{selectedObjective?.description}</p>
                <div className="objective-result-strip">
                  <span><small>DATA RETURNED</small><strong>{simulation.dataCollectedGb} GB</strong></span>
                  <span><small>SCIENCE SCORE</small><strong>{simulation.scienceScore}%</strong></span>
                  <span><small>FINAL POWER</small><strong>{simulation.powerPercent}%</strong></span>
                </div>
              </article>
              <article className="report-detail-card">
                <div className="detail-card-heading"><span className="detail-card-icon">02</span><div><span className="section-kicker">SPACECRAFT CONFIGURATION</span><h4>Engineering envelope</h4></div></div>
                <dl className="report-design-list">
                  <SummaryRow label="Launch vehicle" value={metrics.rocket?.name || "—"} />
                  <SummaryRow label="Orbit / transfer" value={selectedOrbit?.name || "—"} />
                  <SummaryRow label="Spacecraft mass" value={`${metrics.massKg} kg`} />
                  <SummaryRow label="Instruments" value={metrics.instruments.map((item) => item.name).join(", ") || "None"} />
                  <SummaryRow label="Cost / budget" value={`${metrics.costCredits} / ${metrics.availableBudgetCredits} credits`} />
                </dl>
              </article>
              <article className="report-detail-card events-detail-card">
                <div className="detail-card-heading"><span className="detail-card-icon">03</span><div><span className="section-kicker">FLIGHT LOG</span><h4>Events & decisions</h4></div></div>
                {simulation.decisionLog.length ? (
                  <ul className="decision-list">
                    {simulation.decisionLog.map((decision, index) => (
                      <li key={`${decision.event}-${index}`}><span className="decision-check">↗</span><span><strong>{decision.event}</strong><small>{decision.choice}</small></span></li>
                    ))}
                  </ul>
                ) : <p className="detail-muted">No unplanned events were recorded during this simulated mission.</p>}
                <div className="problems-callout">
                  <span className="problem-status-dot" />
                  <p><strong>Problems encountered</strong><span>{encounteredProblemTitles.length ? encounteredProblemTitles.join("; ") : "No system-critical problems recorded."}</span></p>
                </div>
              </article>
              <article className="report-detail-card suggestions-detail-card">
                <div className="detail-card-heading"><span className="detail-card-icon">04</span><div><span className="section-kicker">DESIGN ITERATION</span><h4>Recommended adjustments</h4></div></div>
                <p className="detail-muted">Suggestions below respond to the points this mission did not earn.</p>
                <ul className="suggestion-list">
                  {result.improvementSuggestions.map((suggestion, index) => <li key={suggestion}><span>{String(index + 1).padStart(2, "0")}</span>{suggestion}</li>)}
                </ul>
                <button type="button" className="report-inline-link" onClick={() => { setShowSources(true); setView("design"); }}>Review and adjust spacecraft design <span aria-hidden="true">↗</span></button>
              </article>
              <article className="report-detail-card crew-report-card">
                <div className="detail-card-heading"><span className="detail-card-icon">05</span><div><span className="section-kicker">MISSION CREW</span><h4>{activeTeamName}</h4></div></div>
                <ul className="crew-report-list">
                  {activeCrew.map((member) => <li key={member.id}><strong>{member.name.trim() || member.role}</strong><span>{member.role}</span></li>)}
                </ul>
                <p className="detail-muted">Shared score credit · local team session</p>
              </article>
            </div>
          </section>

          <div className="report-actions report-action-dock">
            <button className="secondary-button" type="button" onClick={() => window.print()}>PRINT / SAVE AS PDF</button>
            <button className="secondary-button" type="button" onClick={() => downloadMissionReport(report)}>EXPORT JSON</button>
            <button className="secondary-button" type="button" onClick={saveCurrentReport} disabled={!historyAvailable || savedReports.some((savedReport) => savedReport.id === runId)}>
              {savedReports.some((savedReport) => savedReport.id === runId) ? "REPORT SAVED" : "SAVE REPORT TO ARCHIVE"}
            </button>
            <button className="secondary-button" type="button" onClick={() => setView("design")}>EDIT MISSION DESIGN</button>
            <button className="primary-button" type="button" onClick={resetMission}>DESIGN ANOTHER MISSION <span aria-hidden="true">↗</span></button>
          </div>
        </section>
      )}

      <footer className="app-footer">
        <span>MISSION CONTROL <i /> EDUCATIONAL SPACE MISSION DESIGN</span>
        <span>Illustrative values and paths · Not for real mission planning</span>
      </footer>

      {pendingEvent && (
        <div className="event-backdrop" role="dialog" aria-modal="true" aria-labelledby="event-title">
          <div className="event-card">
            <div className="event-alert-icon" aria-hidden="true">!</div>
            <p className="section-kicker">MISSION EVENT · DECISION REQUIRED</p>
            <h2 id="event-title">{pendingEvent.title}</h2>
            <p className="event-description">{pendingEvent.description}</p>
            <div className="event-choice-list">
              {pendingEvent.choices.map((choice) => (
                <button className="event-choice" key={choice.id} type="button" onClick={() => resolveEvent(choice.id)}>
                  <span><strong>{choice.label}</strong><small>{choice.description}</small></span>
                  <span className="event-arrow" aria-hidden="true">→</span>
                </button>
              ))}
            </div>
            <p className="event-footnote">Your choice changes mission power, data, science return, communications, or duration.</p>
          </div>
        </div>
      )}

      <LaunchSequence
        active={launchSequenceActive}
        components={builderDesign?.launchComponents || []}
        destination={launchDestination}
        mission={{
          level: builderDesign?.missionLevel || 1,
          title: builderDesign?.missionTitle,
        }}
        onReset={cancelLaunchSequence}
        onContinue={completeLaunchSequence}
      />
    </main>
  );
}

function MissionScoreRing({ score, outcome }) {
  return (
    <div className="mission-score-ring" aria-label={`Mission score ${score} out of 100; ${outcome}`}>
      <svg viewBox="0 0 124 124" aria-hidden="true">
        <circle className="score-ring-track" cx="62" cy="62" r="52" pathLength="100" />
        <circle className="score-ring-value" cx="62" cy="62" r="52" pathLength="100" style={{ "--score-offset": `${100 - score}` }} />
      </svg>
      <div className="score-ring-copy"><strong>{score}</strong><span>OF 100</span></div>
      <span className="score-ring-caption">MISSION SCORE</span>
    </div>
  );
}

function ResultKpi({ accent, icon, label, value, detail }) {
  return (
    <article className={`result-kpi result-kpi-${accent}`}>
      <div className="result-kpi-label"><span aria-hidden="true">{icon}</span>{label}</div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function ResourceAnalysisCard({ metrics, simulation }) {
  const capacity = Number(metrics.rocket?.payloadCapacityKg) || 0;
  const massMargin = Math.max(0, capacity - metrics.massKg);
  const massUse = capacity > 0 ? (metrics.massKg / capacity) * 100 : 100;
  const powerHeadroom = metrics.availablePowerW - metrics.powerLoadW;
  const powerUse = metrics.availablePowerW > 0
    ? (metrics.powerLoadW / metrics.availablePowerW) * 100
    : 100;
  const budgetRemaining = metrics.availableBudgetCredits - metrics.costCredits;
  const budgetUse = metrics.availableBudgetCredits > 0
    ? (metrics.costCredits / metrics.availableBudgetCredits) * 100
    : 100;

  return (
    <section className="report-card resource-analysis-card" aria-labelledby="resource-analysis-title">
      <div className="report-card-heading">
        <div><p className="section-kicker">CONFIGURATION ESTIMATES</p><h3 id="resource-analysis-title">Engineering margins</h3></div>
        <span className="estimate-badge">GAME MODEL</span>
      </div>
      <p className="chart-description">Configured values compared with the selected vehicle, power load, and mission budget.</p>
      <ResourceGauge
        label="Payload mass"
        value={`${metrics.massKg} / ${capacity} kg`}
        detail={`${massMargin} kg capacity margin`}
        percent={massUse}
        accent="cyan"
      />
      <ResourceGauge
        label="Power systems"
        value={`${metrics.powerLoadW} / ${metrics.availablePowerW} W`}
        detail={`${powerHeadroom} W generation headroom · ${simulation.powerPercent}% remains`}
        percent={powerUse}
        accent={powerHeadroom >= 0 ? "violet" : "coral"}
      />
      <ResourceGauge
        label="Mission budget"
        value={`${metrics.costCredits} / ${metrics.availableBudgetCredits} cr`}
        detail={`${budgetRemaining} credits remaining`}
        percent={budgetUse}
        accent="amber"
      />
      <div className="estimate-footnote"><span>ⓘ</span> These are simplified educational estimates, not launch or flight-performance predictions.</div>
    </section>
  );
}

function ResourceGauge({ label, value, detail, percent, accent }) {
  return (
    <div className={`resource-gauge resource-gauge-${accent}`}>
      <div className="resource-gauge-heading"><span>{label}</span><strong>{value}</strong></div>
      <div className="resource-gauge-track" role="meter" aria-label={label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(Math.min(100, Math.max(0, percent)))}><span style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} /></div>
      <small>{detail}</small>
    </div>
  );
}

function ScoreCategoryCard({ category, index }) {
  const percentage = Math.round((category.points / category.maxPoints) * 100);
  const reasons = [...category.awards, ...category.deductions];
  return (
    <article className={`score-category-card score-category-${category.id}`} style={{ "--score-progress": `${percentage}%` }}>
      <div className="score-category-card-top">
        <span className="score-category-number">{String(index + 1).padStart(2, "0")}</span>
        <span className="score-category-weight">WEIGHT {category.maxPoints}</span>
      </div>
      <div className="score-category-card-title"><h4>{category.title}</h4><strong>{category.points}<small>/{category.maxPoints}</small></strong></div>
      <div className="score-category-track" role="meter" aria-label={`${category.title} score`} aria-valuemin="0" aria-valuemax={category.maxPoints} aria-valuenow={category.points}><span /></div>
      <p>{category.explanation}</p>
      <details className="score-reasons-details">
        <summary>{reasons.length ? "SEE POINTS & REASONS" : "VIEW SCORING RULE"} <span aria-hidden="true">⌄</span></summary>
        {category.awards.length > 0 && <ul className="score-awards">{category.awards.map((reason) => <li key={reason}>{reason}</li>)}</ul>}
        {category.deductions.length > 0 && <ul className="score-deductions">{category.deductions.map((reason) => <li key={reason}>{reason}</li>)}</ul>}
        {reasons.length === 0 && <p>No points were earned in this category during this run.</p>}
      </details>
    </article>
  );
}

function MissionTelemetryChart({ history }) {
  const series = [
    { key: "powerPercent", label: "Power reserve · %", color: "#57dded", className: "power" },
    { key: "scienceScore", label: "Science return · %", color: "#b894ff", className: "science" },
    { key: "dataCollectedGb", label: "Data returned · GB", color: "#ffbd69", className: "data" },
  ];
  const [visibleSeries, setVisibleSeries] = useState(series.map((item) => item.key));
  const points = MISSION_STAGES.map((stage, stageIndex) => {
    const stageSnapshots = (history || []).filter((point) => point.stageIndex === stageIndex);
    return stageSnapshots.at(-1) || null;
  }).filter(Boolean);
  const chartWidth = 660;
  const chartHeight = 250;
  const left = 40;
  const right = 14;
  const top = 18;
  const bottom = 38;
  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;
  const x = (index) => left + (points.length <= 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth);
  const y = (value) => {
    const normalized = Math.min(100, Math.max(0, Number(value) || 0)) / 100;
    return top + (1 - normalized) * plotHeight;
  };
  const stageLabels = ["Launch", "Deploy", "Transfer", "Science", "Downlink", "Complete"];
  const visible = series.filter((item) => visibleSeries.includes(item.key));

  function toggleSeries(key) {
    setVisibleSeries((current) => {
      if (current.includes(key)) return current.length === 1 ? current : current.filter((item) => item !== key);
      return [...current, key];
    });
  }

  return (
    <section className="report-card telemetry-chart-card" aria-labelledby="telemetry-chart-title">
      <div className="report-card-heading">
        <div><p className="section-kicker">RECORDED TELEMETRY</p><h3 id="telemetry-chart-title">Flight traversal</h3></div>
        <span className="chart-range">6 MISSION PHASES</span>
      </div>
      <div className="telemetry-chart-legend">
        {series.map((item) => (
          <button
            className={`chart-legend-toggle ${visibleSeries.includes(item.key) ? "is-visible" : ""}`}
            type="button"
            key={item.key}
            aria-pressed={visibleSeries.includes(item.key)}
            onClick={() => toggleSeries(item.key)}
          >
            <i style={{ backgroundColor: item.color }} />{item.label}
          </button>
        ))}
      </div>
      <svg className="telemetry-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Recorded line chart showing power reserve, science return, and data returned at each simulated mission phase">
        <defs>
          <linearGradient id="power-area-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#57dded" stopOpacity=".22" />
            <stop offset="100%" stopColor="#57dded" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick}>
            <line x1={left} x2={chartWidth - right} y1={y(tick)} y2={y(tick)} className="chart-grid-line" />
            <text x={left - 7} y={y(tick) + 3} textAnchor="end" className="chart-axis-label">{tick}</text>
          </g>
        ))}
        {visible.map((item, seriesIndex) => {
          const linePoints = points.map((point, index) => `${x(index)},${y(point[item.key] || 0)}`).join(" ");
          return (
            <g key={item.key} className={`chart-series chart-series-${item.className}`}>
              {item.key === "powerPercent" && points.length > 1 && <polygon className="chart-area-fill" points={`${x(0)},${top + plotHeight} ${linePoints} ${x(points.length - 1)},${top + plotHeight}`} fill="url(#power-area-fill)" />}
              {points.length > 1 && <polyline className="chart-line" points={linePoints} fill="none" stroke={item.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" style={{ animationDelay: `${seriesIndex * 170}ms` }} />}
              {points.map((point, index) => {
                const value = point[item.key] || 0;
                const stageName = MISSION_STAGES[point.stageIndex]?.name || stageLabels[index];
                const unit = item.key === "dataCollectedGb" ? "GB" : "%";
                return (
                  <circle className="chart-data-point" key={`${item.key}-${index}`} cx={x(index)} cy={y(value)} r="4" fill={item.color}>
                    <title>{`${stageName}: ${value}${unit}${point.event ? ` · event: ${point.event}` : ""}`}</title>
                  </circle>
                );
              })}
            </g>
          );
        })}
        {points.map((point, index) => point.event && (
          <g className="chart-event-mark" key={`event-${index}`}>
            <line x1={x(index)} x2={x(index)} y1={top} y2={top + plotHeight} />
            <circle cx={x(index)} cy={top + 6} r="5" />
            <title>Mission event: {point.event}</title>
          </g>
        ))}
        {points.map((point, index) => (
          <text key={`stage-${index}`} x={x(index)} y={chartHeight - 11} textAnchor="middle" className="chart-stage-label">{stageLabels[point.stageIndex] || "Phase"}</text>
        ))}
      </svg>
      <div className="chart-footer-note"><span className="chart-live-dot" /> Final recorded values · power and science in % · data on a 0–100 GB scale</div>
    </section>
  );
}

function MissionArchive({ reports, historyReady, historyAvailable, onBack, onExport }) {
  const individualScores = new Map();
  const teamScores = new Map();
  reports.forEach((report) => {
    const score = report.score.total;
    const members = report.team?.crew || [];
    members.forEach((member) => {
      const name = member.name.trim() || member.role;
      const key = name.toLocaleLowerCase();
      const entry = individualScores.get(key) || { name, missions: 0, total: 0, best: 0 };
      entry.missions += 1;
      entry.total += score;
      entry.best = Math.max(entry.best, score);
      individualScores.set(key, entry);
    });
    const teamName = report.team?.name?.trim() || "Unnamed team";
    const teamKey = teamName.toLocaleLowerCase();
    const team = teamScores.get(teamKey) || { name: teamName, missions: 0, total: 0, best: 0 };
    team.missions += 1;
    team.total += score;
    team.best = Math.max(team.best, score);
    teamScores.set(teamKey, team);
  });
  const rankedIndividuals = [...individualScores.values()].sort((first, second) =>
    (second.total / second.missions) - (first.total / first.missions) || second.best - first.best,
  );
  const rankedTeams = [...teamScores.values()].sort((first, second) =>
    (second.total / second.missions) - (first.total / first.missions) || second.best - first.best,
  );

  return (
    <section className="archive-workspace">
      <div className="archive-header">
        <div><p className="section-kicker">LOCAL MISSION RECORDS</p><h2>Mission archive & leaderboard</h2><p>Saved on this device only. Team scores are shared with each listed participant.</p></div>
        <button className="secondary-button" type="button" onClick={onBack}>BACK TO MISSION</button>
      </div>
      <div className="leaderboard-grid">
        <Leaderboard title="Individual leaderboard" rows={rankedIndividuals} shared />
        <Leaderboard title="Team leaderboard" rows={rankedTeams} />
      </div>
      <section className="archive-history">
        <div className="report-card-heading"><div><p className="section-kicker">SAVED REPORTS</p><h3>Mission history</h3></div><span className="archive-count">{reports.length} {reports.length === 1 ? "MISSION" : "MISSIONS"}</span></div>
        {!historyReady ? <p className="archive-empty">Loading saved mission records…</p>
          : !historyAvailable ? <p className="archive-error">Mission history is unavailable because its saved data could not be read. The records were left unchanged.</p>
            : reports.length === 0 ? <p className="archive-empty">No saved reports yet. Complete a mission and save its report to start your local leaderboard.</p>
              : (
                <div className="archive-report-list">
                  {reports.map((report) => (
                    <details className="archive-report" key={report.id}>
                      <summary>
                        <span><strong>{report.missionName}</strong><small>{new Date(report.createdAt).toLocaleString()} · {report.team?.name || "Mission team"}</small></span>
                        <span className={`archive-outcome ${report.score.objectiveAchieved ? "is-success" : "is-incomplete"}`}>{report.missionOutcome}</span>
                        <b>{report.score.total}<small>/100</small></b>
                      </summary>
                      <div className="archive-report-detail">
                        <span>{report.missionObjective.name}</span>
                        <span>{report.rocket} · {report.orbit}</span>
                        <span>{report.resourcesConsumed.dataCollectedGb} GB data · {report.missionDurationDays} simulated days</span>
                        <button className="text-button" type="button" onClick={() => onExport(report)}>EXPORT REPORT JSON <span aria-hidden="true">↗</span></button>
                      </div>
                    </details>
                  ))}
                </div>
              )}
      </section>
    </section>
  );
}

function Leaderboard({ title, rows, shared = false }) {
  return (
    <section className="report-card leaderboard-card">
      <div className="report-card-heading"><div><p className="section-kicker">AVERAGE MISSION SCORE</p><h3>{title}</h3></div><span>{rows.length}</span></div>
      {shared && <p className="leaderboard-note">Each participant receives shared credit for the team's completed missions.</p>}
      {rows.length ? (
        <ol className="leaderboard-list">
          {rows.map((entry, index) => (
            <li key={entry.name}>
              <span className="leaderboard-rank">{String(index + 1).padStart(2, "0")}</span>
              <strong>{entry.name}</strong>
              <small>{entry.missions} {entry.missions === 1 ? "mission" : "missions"} · best {entry.best}</small>
              <b>{Math.round(entry.total / entry.missions)}</b>
            </li>
          ))}
        </ol>
      ) : <p className="archive-empty">Complete and save a mission to appear here.</p>}
    </section>
  );
}

function downloadMissionReport(report) {
  const safeName = (report.missionName || "mission-report").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeName || "mission-report"}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
}

function WorkflowStep({ number, label, active, disabled, onClick }) {
  return (
    <button className={`workflow-step ${active ? "workflow-active" : ""} ${disabled ? "workflow-disabled" : ""}`} type="button" disabled={disabled} onClick={onClick}>
      <span>{number}</span><strong>{label}</strong>
    </button>
  );
}

function SectionHeading({ index, title, subtitle }) {
  return (
    <div className="section-heading">
      <span className="section-index">{index}</span>
      <div><h2>{title}</h2><p>{subtitle}</p></div>
    </div>
  );
}

function RangeControl({ label, value, min, max, step, unit, onChange }) {
  return (
    <label className="range-control">
      <span className="range-label">{label}<strong>{value} <small>{unit}</small></strong></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(event.target.value)} />
      <span className="range-bounds"><small>{min} {unit}</small><small>{max} {unit}</small></span>
    </label>
  );
}

function BioNutrientsPanel({ values, onChange }) {
  return (
    <div className="bio-panel">
      <div className="bio-panel-heading">
        <span className="bio-icon" aria-hidden="true">✳</span>
        <div><p className="section-kicker">NASA EXAMPLE SCENARIO</p><h3>BioNutrients-2 sample targets</h3></div>
      </div>
      <p className="bio-source-note">{BIONUTRIENTS_TARGETS.sourceNote}</p>
      <div className="bio-controls">
        <BioNumberControl label="Replicate samples" value={values.replicateSamples} min={6} max={24} unit="samples" onChange={(value) => onChange("replicateSamples", value)} />
        <BioNumberControl label="Sample volume" value={values.sampleVolumeMl} min={10} max={60} unit="mL" onChange={(value) => onChange("sampleVolumeMl", value)} />
        <BioNumberControl label="Container mass" value={values.containerMassG} min={100} max={350} unit="g" onChange={(value) => onChange("containerMassG", value)} />
        <BioNumberControl label="Occupied volume" value={values.occupiedVolumeMl} min={100} max={400} unit="mL" onChange={(value) => onChange("occupiedVolumeMl", value)} />
      </div>
      <div className="bio-target-note">
        <span>REFERENCE TARGETS</span>
        <p>≥{BIONUTRIENTS_TARGETS.replicateSamples} samples · ≥{BIONUTRIENTS_TARGETS.sampleVolumeMl} mL/sample · ≥{BIONUTRIENTS_TARGETS.betaCaroteneUgPerMl} µg/mL beta carotene · ≥{BIONUTRIENTS_TARGETS.dryCellWeightMg} mg dry-cell weight · container &lt;{BIONUTRIENTS_TARGETS.maxContainerMassG} g · occupied volume &lt;{BIONUTRIENTS_TARGETS.maxOccupiedVolumeMl} mL</p>
        <small>Yield and contamination are not simulated; these are reference goals from the NASA example, not guaranteed game outcomes.</small>
      </div>
    </div>
  );
}

function BioNumberControl({ label, value, min, max, unit, onChange }) {
  return (
    <label className="bio-number-control"><span>{label}</span><span className="bio-number-input"><input type="number" value={value} min={min} max={max} onChange={(event) => onChange(event.target.value)} /><small>{unit}</small></span></label>
  );
}

function SummaryRow({ label, value }) {
  return <div className="summary-row"><dt>{label}</dt><dd>{value}</dd></div>;
}

function TelemetryMetric({ label, value, percent, tone = "" }) {
  return (
    <div className="telemetry-metric">
      <div><span>{label}</span><strong className={tone}>{value}</strong></div>
      <div className={`telemetry-meter ${tone}`}><span style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} /></div>
    </div>
  );
}

function ReferenceList() {
  return (
    <ul className="reference-list">
      {NASA_REFERENCES.map((reference) => (
        <li key={reference.name}>
          <a href={reference.url} target="_blank" rel="noreferrer">{reference.name} <span aria-hidden="true">↗</span></a>
          <small>{reference.organization} · {reference.use}</small>
        </li>
      ))}
      <li><span className="reference-label">Data note</span><small>BioNutrients-2 targets are scenario-specific values from the NASA webinar. Rocket, orbit, budget, power, and simulation values are clearly labeled educational assumptions.</small></li>
      <li><span className="reference-label">Resource validation</span><small>The spacecraft builder uses the shared component-resource validator. This mission flow accepts an adapter using <code>{RESOURCE_VALIDATOR_CONTRACT}</code> when its metrics are available.</small></li>
    </ul>
  );
}

function RocketGlyph({ variant }) {
  return (
    <svg viewBox="0 0 64 92" role="presentation" focusable="false">
      <path d="M32 6C21 19 18 32 19 58h26c1-26-2-39-13-52Z" fill={variant === 2 ? "#dae5ee" : "#f1f4f6"} />
      <path d="M22 44h20v12H22z" fill={variant === 1 ? "#35b7d0" : "#4999bd"} />
      <path d="M19 54 9 68h14l4-10M45 54l10 14H41l-4-10" fill="#d87955" />
      <path d="M26 58 22 78l10-7 10 7-4-20" fill="#df7853" />
      <path d="M29 79h6l-3 9z" fill="#ffc47b" />
      <circle cx="32" cy="31" r="5" fill="#8bcce1" />
      <path d="M27 17h10" stroke="#c7d4dd" strokeWidth="2" />
    </svg>
  );
}

function objectiveIcon(id) {
  const icons = {
    "earth-observation": "◉",
    "solar-weather": "☼",
    "lunar-survey": "◐",
    "mars-weather": "◍",
    bionutrients: "✳",
  };
  return icons[id] || "✦";
}

export default function App({ resourceValidator }) {
  const [activeModule, setActiveModule] = useState("about");
  const [builderDesign, setBuilderDesign] = useState(null);
  const [builderMounted, setBuilderMounted] = useState(false);

  function openBuilder() {
    setBuilderMounted(true);
    setActiveModule("builder");
  }

  function openMissionControl(design = null) {
    setBuilderDesign(design);
    setActiveModule("mission");
  }

  return (
    <>
      {activeModule === "about" && <About onStart={openBuilder} />}
      {builderMounted && (
        <div hidden={activeModule !== "builder"}>
          <Home
            onOpenMissionControl={() => openMissionControl()}
            onLaunchDesignedMission={openMissionControl}
            onAbout={() => setActiveModule("about")}
          />
        </div>
      )}
      {activeModule === "mission" && (
      <MissionControl
        resourceValidator={resourceValidator}
        builderDesign={builderDesign}
        onBackToBuilder={() => setActiveModule("builder")}
      />
      )}
    </>
  );
}
