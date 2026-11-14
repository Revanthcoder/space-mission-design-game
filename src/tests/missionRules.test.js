import test from "node:test";
import assert from "node:assert/strict";
import {
  applyMissionEventChoice,
  calculateMissionMetrics,
  createSimulationState,
  rollMissionEvent,
  validateMissionReadiness,
  advanceSimulation,
} from "../engine/missionRules.js";
import { MISSION_EVENTS, MISSION_STAGES } from "../data/missionCatalog.js";

const readyDesign = {
  objectiveId: "earth-observation",
  rocketId: "kestrel",
  orbitId: "polar",
  instrumentIds: ["multispectral-imager"],
  busMassKg: 120,
  powerGenerationW: 190,
  budgetCredits: 110,
};

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
});
