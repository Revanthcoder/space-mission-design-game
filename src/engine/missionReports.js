export const MISSION_REPORTS_STORAGE_KEY = "space-mission-design-game:reports";
export const MISSION_TEAM_STORAGE_KEY = "space-mission-design-game:team";

function loadJson(storage, key, label, validate, fallback) {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    if (!validate(parsed)) throw new Error("Saved data has an unexpected format.");
    return parsed;
  } catch (error) {
    throw new Error(`Could not load ${label}: ${error.message}`, { cause: error });
  }
}

function saveJson(storage, key, value, label) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    throw new Error(`Could not save ${label}: ${error.message}`, { cause: error });
  }
}

function isMissionReportList(value) {
  return Array.isArray(value) && value.every((report) =>
    report
    && typeof report.id === "string"
    && typeof report.createdAt === "string"
    && typeof report.score?.total === "number",
  );
}

function isTeamSettings(value) {
  return value
    && typeof value.teamName === "string"
    && Array.isArray(value.crew)
    && value.crew.length >= 1
    && value.crew.length <= 4
    && value.crew.every((member) =>
      member
      && typeof member.id === "string"
      && typeof member.name === "string"
      && typeof member.role === "string",
    );
}

export function loadMissionReports(storage = globalThis.localStorage) {
  return loadJson(storage, MISSION_REPORTS_STORAGE_KEY, "mission history", isMissionReportList, []);
}

export function saveMissionReports(reports, storage = globalThis.localStorage) {
  if (!isMissionReportList(reports)) throw new TypeError("Mission reports must include an id, save date, and score.");
  saveJson(storage, MISSION_REPORTS_STORAGE_KEY, reports, "mission history");
}

export function loadTeamSettings(storage = globalThis.localStorage) {
  return loadJson(storage, MISSION_TEAM_STORAGE_KEY, "crew settings", isTeamSettings, null);
}

export function saveTeamSettings(settings, storage = globalThis.localStorage) {
  if (!isTeamSettings(settings)) throw new TypeError("Crew settings must include a team name and one to four named, assigned crew members.");
  saveJson(storage, MISSION_TEAM_STORAGE_KEY, settings, "crew settings");
}

export function createMissionReport({
  id,
  createdAt,
  missionName,
  objective,
  design,
  metrics,
  orbit,
  simulation,
  result,
  teamName,
  crew,
}) {
  const powerConsumedPercent = Math.max(0, 100 - simulation.powerPercent);
  return {
    id,
    createdAt,
    missionName,
    missionObjective: {
      name: objective?.name || "Mission objective",
      description: objective?.description || "",
    },
    spacecraftConfiguration: {
      massKg: metrics.massKg,
      powerGenerationW: metrics.availablePowerW,
      powerLoadW: metrics.powerLoadW,
      budgetCredits: metrics.availableBudgetCredits,
      instruments: metrics.instruments.map((instrument) => instrument.name),
    },
    rocket: metrics.rocket?.name || "Not selected",
    orbit: orbit?.name || metrics.orbit?.name || "Not selected",
    resourcesConsumed: {
      powerPercent: powerConsumedPercent,
      finalPowerReservePercent: simulation.powerPercent,
      dataCollectedGb: simulation.dataCollectedGb,
      projectedCostCredits: metrics.costCredits,
    },
    eventsEncountered: simulation.decisionLog.map((decision) => ({
      event: decision.event,
      choice: decision.choice,
    })),
    missionDurationDays: simulation.missionDays,
    score: result,
    missionOutcome: result.outcome,
    improvementSuggestions: result.improvementSuggestions,
    team: {
      name: teamName,
      crew: crew.map((member) => ({
        name: member.name.trim() || member.role,
        role: member.role,
      })),
    },
    telemetryHistory: simulation.telemetryHistory || [],
    simulation: {
      scienceScore: simulation.scienceScore,
      instrumentOperational: simulation.instrumentOperational,
      eventsSeen: simulation.eventsSeen,
    },
    design: {
      objectiveId: design.objectiveId,
      rocketId: design.rocketId,
      orbitId: design.orbitId,
      instrumentIds: [...design.instrumentIds],
    },
  };
}
