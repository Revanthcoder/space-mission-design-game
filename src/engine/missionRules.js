import {
  BIONUTRIENTS_TARGETS,
  EVENT_TRIGGER_CHANCE,
  INSTRUMENTS,
  MISSION_EVENTS,
  MISSION_STAGES,
  OBJECTIVES,
  ORBITS,
  ROCKETS,
} from "../data/missionCatalog.js";
import { calculateMissionScore } from "./scoring.js";

const BUS_COST_CREDITS = 18;
const BUS_POWER_LOAD_W = 32;

const STAGE_EFFECTS = [
  { missionDays: 0, power: 0, data: 0, science: 0 },
  { missionDays: 0.25, power: -2, data: 0, science: 0 },
  { missionDays: 1, power: -4, data: 0, science: 0 },
  { missionDays: 3, power: -10, data: 20, science: 35 },
  { missionDays: 0.5, power: -4, data: 25, science: 0 },
  { missionDays: 0, power: 0, data: 0, science: 0 },
];

export function calculateMissionMetrics(design) {
  const objective = OBJECTIVES.find((item) => item.id === design.objectiveId);
  const orbit = ORBITS.find((item) => item.id === design.orbitId);
  const rocket = ROCKETS.find((item) => item.id === design.rocketId);
  const instruments = (design.instrumentIds || [])
    .map((id) => INSTRUMENTS.find((instrument) => instrument.id === id))
    .filter(Boolean);

  return {
    objective,
    orbit,
    rocket,
    instruments,
    massKg: Number(design.busMassKg || 0) + instruments.reduce((sum, item) => sum + item.massKg, 0),
    powerLoadW: BUS_POWER_LOAD_W + instruments.reduce((sum, item) => sum + item.powerW, 0),
    availablePowerW: Number(design.powerGenerationW || 0),
    costCredits: BUS_COST_CREDITS
      + instruments.reduce((sum, item) => sum + item.costCredits, 0)
      + (rocket ? rocket.costCredits : 0),
    availableBudgetCredits: Number(design.budgetCredits || 0),
    dataPerDayGb: instruments.reduce((sum, item) => sum + item.dataPerDayGb, 0),
  };
}

export function validateMissionReadiness(design, resourceValidator) {
  const metrics = calculateMissionMetrics(design);
  const objective = metrics.objective;
  const rocket = metrics.rocket;
  const orbit = metrics.orbit;
  const selectedIds = design.instrumentIds || [];
  const compatibleInstruments = metrics.instruments.filter((instrument) =>
    instrument.objectives.includes(design.objectiveId),
  );
  const checks = [
    {
      id: "objective",
      label: "Mission objective",
      passed: Boolean(objective),
      message: objective ? objective.name : "Choose a mission objective.",
    },
    {
      id: "spacecraft",
      label: "Spacecraft configuration",
      passed: selectedIds.length > 0 && compatibleInstruments.length === selectedIds.length,
      message: selectedIds.length === 0
        ? "Select at least one instrument."
        : compatibleInstruments.length === selectedIds.length
          ? `${selectedIds.length} compatible instrument${selectedIds.length === 1 ? "" : "s"} selected.`
          : "Remove instruments that do not support this objective.",
    },
    {
      id: "mass",
      label: "Mass capacity",
      passed: Boolean(rocket) && metrics.massKg <= rocket.payloadCapacityKg,
      message: rocket
        ? `${metrics.massKg} kg of ${rocket.payloadCapacityKg} kg capacity.`
        : "Select a launch vehicle to check payload capacity.",
    },
    {
      id: "budget",
      label: "Budget",
      passed: metrics.availableBudgetCredits >= metrics.costCredits,
      message: `${metrics.costCredits} credits required; ${metrics.availableBudgetCredits} available.`,
    },
    {
      id: "power",
      label: "Power",
      passed: metrics.availablePowerW >= metrics.powerLoadW,
      message: `${metrics.powerLoadW} W required; ${metrics.availablePowerW} W available.`,
    },
    {
      id: "rocket",
      label: "Rocket selection",
      passed: Boolean(rocket) && Boolean(objective)
        && rocket.missionTypes.some((type) => objective.missionTypes.includes(type)),
      message: !rocket
        ? "Choose a launch vehicle."
        : !objective
          ? "Choose an objective to check rocket compatibility."
          : rocket.missionTypes.some((type) => objective.missionTypes.includes(type))
            ? `${rocket.name} supports this mission type.`
            : `${rocket.name} is not listed for this mission type.`,
    },
    {
      id: "orbit",
      label: "Orbit selection",
      passed: Boolean(orbit) && Boolean(objective) && Boolean(rocket)
        && objective.orbitIds.includes(orbit.id)
        && rocket.orbitIds.includes(orbit.id),
      message: !orbit
        ? "Choose an orbit."
        : !objective || !rocket
          ? "Choose an objective and rocket to check orbit compatibility."
          : !objective.orbitIds.includes(orbit.id)
            ? `${orbit.name} is not a recommended match for this objective.`
            : !rocket.orbitIds.includes(orbit.id)
              ? `${rocket.name} is not configured for ${orbit.name}.`
              : `${orbit.name} is compatible with this design.`,
    },
  ];

  if (design.objectiveId === "bionutrients") {
    const bio = design.bioNutrients || {};
    const replicateSamples = Number(bio.replicateSamples);
    const sampleVolumeMl = Number(bio.sampleVolumeMl);
    const containerMassG = Number(bio.containerMassG);
    const occupiedVolumeMl = Number(bio.occupiedVolumeMl);
    const bioPassed = Number.isFinite(replicateSamples)
      && replicateSamples >= BIONUTRIENTS_TARGETS.replicateSamples
      && Number.isFinite(sampleVolumeMl)
      && sampleVolumeMl >= BIONUTRIENTS_TARGETS.sampleVolumeMl
      && Number.isFinite(containerMassG)
      && containerMassG > 0
      && containerMassG < BIONUTRIENTS_TARGETS.maxContainerMassG
      && Number.isFinite(occupiedVolumeMl)
      && occupiedVolumeMl > 0
      && occupiedVolumeMl < BIONUTRIENTS_TARGETS.maxOccupiedVolumeMl;
    checks.push({
      id: "science-requirements",
      label: "BioNutrients scenario targets",
      passed: bioPassed,
      message: bioPassed
        ? "Sample count, volume, container mass, and occupied volume meet the example targets."
        : "Adjust the BioNutrients sample settings to meet the NASA example targets.",
    });
  }

  if (resourceValidator !== undefined) {
    if (typeof resourceValidator !== "function") {
      checks.push({
        id: "shared-resource-validation",
        label: "Shared resource validation",
        passed: false,
        message: "The injected shared resource validator must be a function.",
      });
    } else {
      const sharedChecks = resourceValidator(metrics);
      if (!Array.isArray(sharedChecks)) {
        checks.push({
          id: "shared-resource-validation",
          label: "Shared resource validation",
          passed: false,
          message: "The shared validator must return an array of readiness checks.",
        });
      } else if (!sharedChecks.every((check) => check
        && typeof check.id === "string"
        && typeof check.label === "string"
        && typeof check.passed === "boolean"
        && typeof check.message === "string")) {
        checks.push({
          id: "shared-resource-validation",
          label: "Shared resource validation",
          passed: false,
          message: "Each shared check must include a string id, label, message, and boolean passed value.",
        });
      } else {
        checks.push(...sharedChecks.map((check) => ({
          ...check,
          id: `shared-${check.id}`,
        })));
      }
    }
  }

  return checks;
}

export function createSimulationState() {
  const state = {
    stageIndex: 0,
    progress: 0,
    powerPercent: 100,
    communication: "Nominal",
    dataCollectedGb: 0,
    scienceScore: 0,
    missionDays: 0,
    instrumentOperational: true,
    eventsSeen: [],
    decisionLog: [],
    telemetryHistory: [],
  };
  return { ...state, telemetryHistory: [createTelemetryPoint(state)] };
}

export function advanceSimulation(state) {
  if (state.stageIndex >= MISSION_STAGES.length - 1) return state;
  const nextStageIndex = state.stageIndex + 1;
  const effect = STAGE_EFFECTS[nextStageIndex];

  const nextState = {
    ...state,
    stageIndex: nextStageIndex,
    progress: Math.round((nextStageIndex / (MISSION_STAGES.length - 1)) * 100),
    powerPercent: clamp(state.powerPercent + effect.power, 0, 100),
    dataCollectedGb: Math.max(0, state.dataCollectedGb + effect.data),
    scienceScore: clamp(state.scienceScore + effect.science, 0, 100),
    missionDays: Math.round((state.missionDays + effect.missionDays) * 10) / 10,
    communication: nextStageIndex === 4 ? "Downlink in progress" : state.communication,
  };
  return {
    ...nextState,
    telemetryHistory: [...(state.telemetryHistory || []), createTelemetryPoint(nextState)],
  };
}

export function rollMissionEvent(state, random = Math.random) {
  if (random() >= EVENT_TRIGGER_CHANCE) return null;
  const unseenEvents = MISSION_EVENTS.filter((event) => !state.eventsSeen.includes(event.id));
  if (unseenEvents.length === 0) return null;
  return unseenEvents[Math.floor(random() * unseenEvents.length)];
}

export function applyMissionEventChoice(state, event, choiceId) {
  const choice = event.choices.find((item) => item.id === choiceId);
  if (!choice) {
    throw new Error(`Unknown choice "${choiceId}" for mission event "${event.id}".`);
  }

  const effect = choice.effect;
  const nextState = {
    ...state,
    powerPercent: clamp(state.powerPercent + (effect.powerDelta || 0), 0, 100),
    dataCollectedGb: Math.max(0, state.dataCollectedGb + (effect.dataDelta || 0)),
    scienceScore: clamp(state.scienceScore + (effect.scienceDelta || 0), 0, 100),
    missionDays: Math.round((state.missionDays + (effect.missionDaysDelta || 0)) * 10) / 10,
    communication: effect.communication || state.communication,
    instrumentOperational: effect.instrumentOperational ?? state.instrumentOperational,
    eventsSeen: state.eventsSeen.includes(event.id) ? state.eventsSeen : [...state.eventsSeen, event.id],
    decisionLog: [...state.decisionLog, { event: event.title, choice: choice.label, effect }],
  };
  return {
    ...nextState,
    telemetryHistory: [
      ...(state.telemetryHistory || []),
      createTelemetryPoint(nextState, event.title),
    ],
  };
}

export function calculateMissionResult(state, metrics, objective) {
  if (!state || !metrics) {
    throw new TypeError("Mission state and calculated design metrics are required to score a mission.");
  }
  return calculateMissionScore({ state, metrics, objective });
}

function createTelemetryPoint(state, event = "") {
  return {
    stageIndex: state.stageIndex,
    progress: state.progress,
    missionDays: state.missionDays,
    powerPercent: state.powerPercent,
    dataCollectedGb: state.dataCollectedGb,
    scienceScore: state.scienceScore,
    communication: state.communication,
    event,
  };
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}
