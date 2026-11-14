import { useEffect, useMemo, useState } from "react";
import {
  BIONUTRIENTS_TARGETS,
  INSTRUMENTS,
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
import { createMissionDesignFromBuilder } from "./engine/builderHandoff.js";
import MissionVisualization from "./components/MissionVisualization.jsx";
import "./App.css";
import Home from "./pages/Home.jsx";

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

function MissionControl({ resourceValidator, onBackToBuilder, builderDesign }) {
  const [design, setDesign] = useState(() => (
    builderDesign ? createMissionDesignFromBuilder(builderDesign) : INITIAL_DESIGN
  ));
  const [view, setView] = useState("design");
  const [countdown, setCountdown] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [pendingEvent, setPendingEvent] = useState(null);
  const [showSources, setShowSources] = useState(false);

  const metrics = useMemo(() => calculateMissionMetrics(design), [design]);
  const checks = useMemo(
    () => validateMissionReadiness(design, resourceValidator),
    [design, resourceValidator],
  );
  const ready = checks.every((check) => check.passed);
  const readinessCount = checks.filter((check) => check.passed).length;
  const selectedObjective = OBJECTIVES.find((item) => item.id === design.objectiveId);
  const selectedOrbit = ORBITS.find((item) => item.id === design.orbitId);
  const activeStage = simulation ? MISSION_STAGES[simulation.stageIndex] : null;

  useEffect(() => {
    if (countdown === null) return undefined;
    const timer = window.setTimeout(() => {
      if (countdown === 0) {
        setCountdown(null);
        setSimulation(createSimulationState());
        setPendingEvent(null);
        setView("flight");
      } else {
        setCountdown((value) => value - 1);
      }
    }, countdown === 0 ? 700 : 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

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
    setCountdown(3);
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

  function resetMission() {
    setSimulation(null);
    setPendingEvent(null);
    setCountdown(null);
    setView("design");
  }

  const result = simulation ? calculateMissionResult(simulation) : null;

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
          <span className="crew-label"><span className="crew-avatar">MC</span> Mission team</span>
          <button className="module-switch-button" type="button" onClick={onBackToBuilder}>SPACECRAFT BUILDER</button>
        </div>
      </header>

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
            <p>{builderDesign.massKg} kg · {builderDesign.powerGenerationW} W solar generation · {builderDesign.batteryWh} Wh battery</p>
          </div>
          <p>
            Your validated design is preloaded into the launch workflow. Select a matching science objective,
            review the simplified estimates, then start the countdown.
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

      {view === "report" && simulation && result && (
        <section className="report-workspace">
          <div className={`report-hero ${result.objectiveAchieved ? "report-success" : "report-incomplete"}`}>
            <div className="report-symbol" aria-hidden="true">{result.objectiveAchieved ? "✓" : "!"}</div>
            <div>
              <p className="section-kicker">MISSION DEBRIEF · {result.objectiveAchieved ? "OBJECTIVES ACHIEVED" : "OBJECTIVES PARTIALLY MET"}</p>
              <h2>{result.objectiveAchieved ? "Science delivered." : "Mission complete. Lessons learned."}</h2>
              <p>{result.objectiveAchieved
                ? "Review how your engineering choices shaped the mission outcome."
                : "Your mission reached the end of its timeline, but a resource or science target needs another design pass."}</p>
            </div>
            <div className="report-score"><strong>{result.score}</strong><span>MISSION SCORE</span></div>
          </div>
          <div className="report-grid">
            <div className="report-card report-outcome">
              <p className="section-kicker">MISSION OUTCOME</p>
              <h3>{selectedObjective?.name}</h3>
              <p>{selectedObjective?.description}</p>
              <div className="outcome-stats">
                <div><strong>{simulation.dataCollectedGb} <small>GB</small></strong><span>Data collected</span></div>
                <div><strong>{simulation.scienceScore}<small>%</small></strong><span>Science return</span></div>
                <div><strong>{simulation.powerPercent}<small>%</small></strong><span>Power remaining</span></div>
                <div><strong>{simulation.missionDays}<small>d</small></strong><span>Simulated duration</span></div>
              </div>
            </div>
            <div className="report-card">
              <p className="section-kicker">DESIGN SUMMARY</p>
              <dl className="report-design-list">
                <SummaryRow label="Launch vehicle" value={metrics.rocket?.name || "—"} />
                <SummaryRow label="Selected orbit" value={selectedOrbit?.name || "—"} />
                <SummaryRow label="Spacecraft mass" value={`${metrics.massKg} kg`} />
                <SummaryRow label="Projected cost" value={`${metrics.costCredits} credits`} />
                <SummaryRow label="Instruments" value={metrics.instruments.map((item) => item.name).join(", ") || "None"} />
              </dl>
            </div>
            <div className="report-card decision-card">
              <p className="section-kicker">MISSION DECISIONS</p>
              {simulation.decisionLog.length ? (
                <ul className="decision-list">
                  {simulation.decisionLog.map((decision, index) => (
                    <li key={`${decision.event}-${index}`}><span className="decision-check">✓</span><span><strong>{decision.event}</strong><small>{decision.choice}</small></span></li>
                  ))}
                </ul>
              ) : <p className="muted-copy">No event decisions were required this run. Try another launch for a different scenario.</p>}
            </div>
            <div className="report-card learn-card">
              <p className="section-kicker">ENGINEERING TAKEAWAY</p>
              <h3>Every subsystem trades against another.</h3>
              <p>Adding instruments can increase science and data return, but also raises spacecraft mass, power demand, and cost. Orbit choice changes coverage, communications, and the scenario timeline.</p>
              <button type="button" className="text-button" onClick={() => { setShowSources(true); setView("design"); }}>Explore the NASA references <span aria-hidden="true">↗</span></button>
            </div>
          </div>
          <div className="report-actions"><button className="secondary-button" type="button" onClick={() => setView("design")}>EDIT MISSION DESIGN</button><button className="primary-button" type="button" onClick={resetMission}>DESIGN ANOTHER MISSION <span aria-hidden="true">↗</span></button></div>
        </section>
      )}

      <footer className="app-footer">
        <span>MISSION CONTROL <i /> EDUCATIONAL SPACE MISSION DESIGN</span>
        <span>Illustrative values and paths · Not for real mission planning</span>
      </footer>

      {countdown !== null && (
        <div className="countdown-backdrop" role="dialog" aria-modal="true" aria-labelledby="countdown-title">
          <div className="countdown-card">
            <span className="countdown-orbit" aria-hidden="true"><i /></span>
            <p className="section-kicker">FLIGHT DIRECTOR · LAUNCH AUTHORIZED</p>
            <h2 id="countdown-title">{countdown === 0 ? "IGNITION" : `T − 00:00:0${countdown}`}</h2>
            <p>{countdown === 0 ? "Main engines start." : "Systems nominal. Preparing launch sequence."}</p>
            <div className="countdown-progress"><span style={{ width: `${((3 - countdown) / 3) * 100}%` }} /></div>
            <button type="button" className="countdown-cancel" onClick={() => setCountdown(null)}>CANCEL COUNTDOWN</button>
          </div>
        </div>
      )}

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
    </main>
  );
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
  const [activeModule, setActiveModule] = useState("builder");
  const [builderDesign, setBuilderDesign] = useState(null);

  function openMissionControl(design = null) {
    setBuilderDesign(design);
    setActiveModule("mission");
  }

  return (
    <>
      <div hidden={activeModule !== "builder"}>
        <Home
          onOpenMissionControl={() => openMissionControl()}
          onLaunchDesignedMission={openMissionControl}
        />
      </div>
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
