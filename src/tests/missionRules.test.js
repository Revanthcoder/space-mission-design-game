import test from "node:test";
import assert from "node:assert/strict";
import {
  applyMissionEventChoice,
  calculateMissionMetrics,
  calculateMissionResult,
  createSimulationState,
  rollMissionEvent,
  validateMissionReadiness,
  advanceSimulation,
} from "../engine/missionRules.js";
import { MISSION_EVENTS, MISSION_STAGES } from "../data/missionCatalog.js";
import { missions, spacecraftComponents, solarSystemDestinations } from "../data/spacecraftData.js";
import { calculateResources, validateMission } from "../engine/resourceCalculations.js";
import { createMissionDesignFromBuilder } from "../engine/builderHandoff.js";
import {
  createMissionReport,
  loadMissionReports,
  loadTeamSettings,
  MISSION_REPORTS_STORAGE_KEY,
  saveMissionReports,
  saveTeamSettings,
} from "../engine/missionReports.js";

const readyDesign = {
  objectiveId: "earth-observation",
  rocketId: "kestrel",
  orbitId: "polar",
  instrumentIds: ["multispectral-imager"],
  busMassKg: 120,
  powerGenerationW: 190,
  budgetCredits: 110,
};

test("Level 1 budget supports a complete educational spacecraft configuration", () => {
  const mission = missions[0];
  const selectedIds = [
    "light-frame",
    "medium-panel",
    "basic-antenna",
    "flight-computer",
    "camera",
    "thermal-control",
  ];
  const selected = selectedIds.map((id) => spacecraftComponents.find((item) => item.id === id));
  const resources = calculateResources(selected, mission);

  assert.equal(resources.totalCost, 117000);
  assert.equal(resources.remainingBudget, 1_883_000);
  assert.equal(validateMission(selected, resources, mission).valid, true);
});

test("the starter spacecraft is launch-ready for the first two missions", () => {
  const selectedIds = [
    "basic-frame",
    "medium-panel",
    "backup-battery",
    "basic-antenna",
    "flight-computer",
    "camera",
    "thermal-control",
  ];
  const selected = selectedIds.map((id) => spacecraftComponents.find((item) => item.id === id));

  for (const mission of missions.slice(0, 2)) {
    const resources = calculateResources(selected, mission);
    assert.equal(validateMission(selected, resources, mission).valid, true, mission.title);
  }
});

test("each planet only offers compatible mission levels with a launch-ready subsystem configuration", () => {
  const componentIdsByLevel = {
    1: ["light-frame", "medium-panel", "basic-antenna", "flight-computer", "camera", "thermal-control"],
    2: ["basic-frame", "medium-panel", "backup-battery", "basic-antenna", "camera", "thermal-control"],
    3: ["basic-frame", "medium-panel", "backup-battery", "basic-antenna", "flight-computer", "attitude-control", "propellant-tank", "thermal-control"],
    4: ["basic-frame", "medium-panel", "backup-battery", "basic-antenna", "camera", "spectrometer", "attitude-control", "propellant-tank", "thermal-control"],
    5: ["basic-frame", "medium-panel", "high-panel", "advanced-battery", "deep-space-antenna", "flight-computer", "camera", "attitude-control", "propellant-tank", "thermal-control"],
    7: ["basic-frame", "medium-panel", "advanced-battery", "deep-space-antenna", "flight-computer", "spectrometer", "magnetometer", "thermal-control", "rps-single", "propellant-tank"],
    8: ["basic-frame", "medium-panel", "advanced-battery", "deep-space-antenna", "flight-computer", "camera", "spectrometer", "radar", "magnetometer", "attitude-control", "thermal-control", "rps-pair", "propellant-tank"],
  };
  const destinationsByLevel = new Map();

  for (const destination of solarSystemDestinations) {
    const compatibleMissions = missions.filter((mission) => mission.destinationIds.includes(destination.id));
    assert.deepEqual(
      compatibleMissions.map((mission) => mission.level),
      destination.availableLevels,
      `${destination.name} mission-level mapping`,
    );

    for (const mission of compatibleMissions) {
      const selected = componentIdsByLevel[mission.level]
        .map((id) => spacecraftComponents.find((item) => item.id === id));
      const resources = calculateResources(selected, mission, destination);
      assert.equal(validateMission(selected, resources, mission).valid, true, `${destination.name} level ${mission.level}`);
      const destinations = destinationsByLevel.get(mission.level) || [];
      destinations.push(destination.id);
      destinationsByLevel.set(mission.level, destinations);
    }
  }

  assert.deepEqual(destinationsByLevel.get(5), ["mercury", "venus", "mars"]);
  assert.deepEqual(destinationsByLevel.get(7), ["jupiter", "saturn"]);
  assert.deepEqual(destinationsByLevel.get(8), ["uranus", "neptune"]);
});

test("solar-array output falls with Sun distance while RTG output remains steady", () => {
  const panel = spacecraftComponents.find((item) => item.id === "high-panel");
  const radioisotopeUnit = spacecraftComponents.find((item) => item.id === "rps-pair");
  const earth = solarSystemDestinations.find((item) => item.id === "earth");
  const mars = solarSystemDestinations.find((item) => item.id === "mars");
  const neptune = solarSystemDestinations.find((item) => item.id === "neptune");

  assert.equal(calculateResources([panel], missions[0], earth).powerGeneration, 320);
  assert.equal(calculateResources([panel], missions[4], mars).solarPowerGeneration, 138);
  const neptuneResources = calculateResources([panel, radioisotopeUnit], missions[7], neptune);
  assert.equal(neptuneResources.solarPowerGeneration, 0);
  assert.equal(neptuneResources.radioisotopePowerGeneration, 316);
  assert.equal(neptuneResources.powerGeneration, 316);
});

test("the builder hands an Earth design into a launch-ready mission plan", () => {
  const design = createMissionDesignFromBuilder({
    destinationId: "earth",
    massKg: 465,
    powerGenerationW: 180,
    totalCost: 94000,
  });
  const checks = validateMissionReadiness(design);

  assert.equal(design.busMassKg, 420);
  assert.equal(design.rocketId, "meridian");
  assert.ok(checks.every((check) => check.passed), JSON.stringify(checks));
});

test("the builder hands a Mars design to a compatible launch vehicle", () => {
  const design = createMissionDesignFromBuilder({
    destinationId: "mars",
    massKg: 465,
    powerGenerationW: 180,
    totalCost: 94000,
  });
  const checks = validateMissionReadiness(design);

  assert.equal(design.objectiveId, "mars-weather");
  assert.equal(design.rocketId, "farpoint");
  assert.ok(checks.every((check) => check.passed), JSON.stringify(checks));
});

test("the builder hands a Moon design to a compatible lunar launch vehicle", () => {
  const design = createMissionDesignFromBuilder({
    destinationId: "moon",
    destinationName: "Moon",
    massKg: 465,
    powerGenerationW: 180,
    totalCost: 94000,
  });
  const checks = validateMissionReadiness(design);

  assert.equal(design.objectiveId, "lunar-survey");
  assert.equal(design.orbitId, "lunar-transfer");
  assert.equal(design.rocketId, "meridian");
  assert.ok(checks.every((check) => check.passed), JSON.stringify(checks));
});

test("the builder preserves non-Earth planetary destinations in the handoff", () => {
  for (const [destinationId, destinationName] of [["mercury", "Mercury"], ["venus", "Venus"], ["jupiter", "Jupiter"], ["saturn", "Saturn"], ["uranus", "Uranus"], ["neptune", "Neptune"]]) {
    const design = createMissionDesignFromBuilder({
      destinationId,
      destinationName,
      massKg: 465,
      powerGenerationW: 180,
      totalCost: 94000,
    });

    assert.equal(design.destinationId, destinationId);
    assert.equal(design.destinationName, destinationName);
    assert.equal(design.objectiveId, "planetary-survey");
    assert.equal(design.orbitId, "planetary-transfer");
    assert.ok(validateMissionReadiness(design).every((check) => check.passed), destinationName);
  }
});

test("every selectable destination maps to a launch-ready Mission Control handoff", () => {
  for (const destination of solarSystemDestinations) {
    const design = createMissionDesignFromBuilder({
      destinationId: destination.id,
      destinationName: destination.name,
      massKg: 465,
      powerGenerationW: 180,
      totalCost: 94000,
    });

    assert.equal(design.destinationId, destination.id);
    assert.equal(design.destinationName, destination.name);
    assert.ok(
      validateMissionReadiness(design).every((check) => check.passed),
      `${destination.name} level ${destination.availableLevels.join("/")} should be launch-ready`,
    );
  }
});

test("the default educational design passes all Member 3 readiness checks", () => {
  const checks = validateMissionReadiness(readyDesign);
  assert.ok(checks.every((check) => check.passed));
  assert.equal(calculateMissionMetrics(readyDesign).massKg, 144);
});

test("launch is blocked when payload mass exceeds the selected vehicle capacity", () => {
  const checks = validateMissionReadiness({ ...readyDesign, busMassKg: 240 });
  assert.equal(checks.find((check) => check.id === "mass").passed, false);
});

test("orbit and instrument compatibility are checked against the selected objective", () => {
  const checks = validateMissionReadiness({
    ...readyDesign,
    orbitId: "mars-transfer",
    instrumentIds: ["mars-camera"],
  });
  assert.equal(checks.find((check) => check.id === "orbit").passed, false);
  assert.equal(checks.find((check) => check.id === "spacecraft").passed, false);
});

test("BioNutrients readiness uses the scenario-specific NASA sample constraints", () => {
  const bioDesign = {
    ...readyDesign,
    objectiveId: "bionutrients",
    rocketId: "kestrel",
    orbitId: "leo",
    instrumentIds: ["bio-lab"],
    bioNutrients: {
      replicateSamples: 12,
      sampleVolumeMl: 30,
      containerMassG: 230,
      occupiedVolumeMl: 280,
    },
  };
  assert.equal(validateMissionReadiness(bioDesign).find((check) => check.id === "science-requirements").passed, true);
  assert.equal(validateMissionReadiness({
    ...bioDesign,
    bioNutrients: { ...bioDesign.bioNutrients, containerMassG: 250 },
  }).find((check) => check.id === "science-requirements").passed, false);
  assert.equal(validateMissionReadiness({
    ...bioDesign,
    bioNutrients: { ...bioDesign.bioNutrients, occupiedVolumeMl: -1 },
  }).find((check) => check.id === "science-requirements").passed, false);
});

test("the injected shared resource validator contributes readiness checks", () => {
  const checks = validateMissionReadiness(readyDesign, (metrics) => [{
    id: "shared-budget",
    label: "Member 2 budget rule",
    passed: metrics.availableBudgetCredits > metrics.costCredits,
    message: "Validated by the shared resource system.",
  }]);
  assert.equal(checks.find((check) => check.id === "shared-shared-budget").passed, true);
});

test("malformed shared resource validation output blocks launch with a visible check", () => {
  const checks = validateMissionReadiness(readyDesign, () => [{
    id: "budget",
    label: "Budget",
    passed: "yes",
    message: "Invalid boolean.",
  }]);
  const sharedCheck = checks.find((check) => check.id === "shared-resource-validation");
  assert.equal(sharedCheck.passed, false);
});

test("mission event decisions apply measurable effects without mutating prior state", () => {
  const initial = createSimulationState();
  const event = MISSION_EVENTS.find((item) => item.id === "communications-interruption");
  const updated = applyMissionEventChoice(initial, event, "use-backup-link");
  assert.equal(updated.powerPercent, 94);
  assert.equal(updated.dataCollectedGb, 6);
  assert.equal(updated.missionDays, 0.5);
  assert.equal(updated.communication, "Backup link active");
  assert.equal(updated.telemetryHistory.length, initial.telemetryHistory.length + 1);
  assert.equal(updated.telemetryHistory.at(-1).event, event.title);
  assert.equal(initial.powerPercent, 100);
});

test("random events respect the trigger probability and exclude resolved events", () => {
  const initial = createSimulationState();
  assert.equal(rollMissionEvent(initial, () => 0.99), null);
  const event = rollMissionEvent(initial, () => 0);
  assert.ok(event);
  const resolvedState = { ...initial, eventsSeen: [event.id] };
  const nextEvent = rollMissionEvent(resolvedState, () => 0);
  assert.notEqual(nextEvent?.id, event.id);
});

test("the simulation progresses through all six stages to 100 percent", () => {
  let state = createSimulationState();
  for (let index = 1; index < MISSION_STAGES.length; index += 1) {
    state = advanceSimulation(state);
  }
  assert.equal(state.stageIndex, MISSION_STAGES.length - 1);
  assert.equal(state.progress, 100);
  assert.ok(state.dataCollectedGb > 0);
  assert.equal(state.telemetryHistory.at(-1).stageIndex, MISSION_STAGES.length - 1);
});

test("the scoring engine awards the requested 100 points transparently", () => {
  const design = {
    ...readyDesign,
    instrumentIds: ["multispectral-imager", "thermal-mapper"],
  };
  const metrics = calculateMissionMetrics(design);
  const result = calculateMissionResult({
    stageIndex: MISSION_STAGES.length - 1,
    powerPercent: 100,
    communication: "Nominal",
    dataCollectedGb: 25,
    scienceScore: 30,
    missionDays: 4.75,
    instrumentOperational: true,
  }, metrics);

  assert.equal(result.total, 100);
  assert.equal(result.maxPoints, 100);
  assert.equal(result.objectiveAchieved, true);
  assert.deepEqual(result.categories.map((category) => category.maxPoints), [30, 25, 20, 15, 10]);
  assert.equal(result.categories.reduce((total, category) => total + category.points, 0), 100);
  assert.ok(result.categories.every((category) => category.awards.length > 0));
});

test("mission scoring reflects failed objectives, degraded systems, and communication state", () => {
  const metrics = calculateMissionMetrics(readyDesign);
  const result = calculateMissionResult({
    powerPercent: 0,
    communication: "Interrupted",
    dataCollectedGb: 0,
    scienceScore: 12,
    missionDays: 2,
    instrumentOperational: false,
  }, metrics);

  assert.equal(result.objectiveAchieved, false);
  assert.equal(result.outcome, "Partially successful");
  assert.ok(result.total < 100);
  assert.equal(result.categories[0].points < 30, true);
  assert.equal(result.categories.find((category) => category.id === "communication").points, 0);
  assert.equal(result.categories.find((category) => category.id === "lifetime").points, 0);
  assert.ok(result.categories.every((category) => category.points >= 0 && category.points <= category.maxPoints));
  assert.ok(result.categories.some((category) => category.deductions.length > 0));
  assert.ok(result.improvementSuggestions.length > 0);
});

test("mission reporting and same-device history persist complete outcome data", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const metrics = calculateMissionMetrics(readyDesign);
  let simulation = createSimulationState();
  for (let index = 1; index < MISSION_STAGES.length; index += 1) {
    simulation = advanceSimulation(simulation);
  }
  const score = calculateMissionResult(simulation, metrics);
  const report = createMissionReport({
    id: "run-1",
    createdAt: "2025-01-01T00:00:00.000Z",
    missionName: "Earth Survey",
    objective: metrics.objective,
    design: readyDesign,
    metrics,
    orbit: metrics.orbit,
    simulation,
    result: score,
    teamName: "Local Crew",
    crew: [{ id: "commander", name: "Alex", role: "Mission Commander" }],
  });
  const reports = [report];
  saveMissionReports(reports, storage);
  saveTeamSettings({
    teamName: "Local Crew",
    crew: [{ id: "commander", name: "Alex", role: "Mission Commander" }],
  }, storage);

  assert.equal(loadMissionReports(storage)[0].score.total, score.total);
  assert.equal(loadMissionReports(storage)[0].resourcesConsumed.dataCollectedGb, simulation.dataCollectedGb);
  assert.equal(loadMissionReports(storage)[0].telemetryHistory.length, simulation.telemetryHistory.length);
  assert.equal(loadTeamSettings(storage).crew[0].name, "Alex");
  assert.ok(values.has(MISSION_REPORTS_STORAGE_KEY));
});

test("malformed saved mission data is reported instead of silently overwritten", () => {
  const storage = {
    getItem: () => "{broken json",
    setItem: () => assert.fail("Malformed history must not be overwritten during load."),
  };
  assert.throws(() => loadMissionReports(storage), /Could not load mission history/);
});
