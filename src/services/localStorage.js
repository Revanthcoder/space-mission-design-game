import { isValidScore, validateSimulationResult } from "./missionValidation.js";

const STORAGE_KEYS = {
  drafts: "mission-control:v1:drafts",
  results: "mission-control:v1:results",
  reports: "mission-control:v1:reports",
  team: "mission-control:v1:team",
};

function storage() {
  if (typeof globalThis.localStorage === "undefined") {
    throw new Error("Local storage is unavailable in this browser.");
  }
  return globalThis.localStorage;
}

function readList(key, isValid = () => true) {
  let value;
  try {
    value = storage().getItem(key);
  } catch (error) {
    throw new Error(`Could not read saved data: ${error.message}`);
  }
  if (value === null) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed) || !parsed.every(isValid)) {
      throw new TypeError("Saved records do not match the expected format.");
    }
    return parsed;
  } catch (error) {
    throw new Error(`Saved data is invalid (${error.message}).`);
  }
}

function write(key, value) {
  try {
    storage().setItem(key, JSON.stringify(value));
  } catch (error) {
    throw new Error(`Could not save data: ${error.message}`);
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ??
    `mission-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function listMissionDrafts() {
  return readList(
    STORAGE_KEYS.drafts,
    (draft) =>
      draft &&
      typeof draft.id === "string" &&
      typeof draft.name === "string" &&
      typeof draft.objective === "string" &&
      typeof draft.spacecraft === "string" &&
      typeof draft.rocket === "string" &&
      typeof draft.orbit === "string",
  );
}

export function saveMissionDraft(draft) {
  const drafts = listMissionDrafts();
  const saved = {
    spacecraft: "",
    rocket: "",
    orbit: "",
    ...draft,
    id: draft.id || createId(),
    updatedAt: new Date().toISOString(),
  };
  const index = drafts.findIndex((item) => item.id === saved.id);
  if (index >= 0) drafts[index] = saved;
  else drafts.unshift(saved);
  write(STORAGE_KEYS.drafts, drafts);
  return saved;
}

export function deleteMissionDraft(id) {
  const drafts = listMissionDrafts();
  const remaining = drafts.filter((draft) => draft.id !== id);
  write(STORAGE_KEYS.drafts, remaining);
  return remaining.length !== drafts.length;
}

export function listMissionResults() {
  return readList(
    STORAGE_KEYS.results,
    (record) => {
      if (!record || typeof record.id !== "string" || !isValidScore(record.score)) {
        return false;
      }
      try {
        validateSimulationResult(record.result);
        return true;
      } catch {
        return false;
      }
    },
  );
}

export function saveMissionResult(result, score) {
  validateSimulationResult(result);
  if (!isValidScore(score)) {
    throw new TypeError("A valid score breakdown is required to save a result.");
  }
  const saved = { id: createId(), result, score, savedAt: new Date().toISOString() };
  const results = listMissionResults();
  results.unshift(saved);
  write(STORAGE_KEYS.results, results);

  return saved;
}

export function deleteMissionResult(id) {
  const results = listMissionResults();
  const remaining = results.filter((result) => result.id !== id);
  write(STORAGE_KEYS.results, remaining);
  return remaining.length !== results.length;
}

export function listMissionReports() {
  return readList(
    STORAGE_KEYS.reports,
    (report) =>
      report &&
      typeof report.id === "string" &&
      typeof report.recordId === "string" &&
      report.report &&
      typeof report.report.missionName === "string",
  );
}

export function saveMissionReport(recordId, report) {
  const reports = listMissionReports();
  const saved = {
    id: createId(),
    recordId,
    report,
    savedAt: new Date().toISOString(),
  };
  reports.unshift(saved);
  write(STORAGE_KEYS.reports, reports);
  return saved;
}

export function listPlayerProgress() {
  const progress = new Map();
  for (const { result, score, savedAt } of listMissionResults()) {
    const playerName = result.playerName?.trim() || "Local player";
    const current = progress.get(playerName) ?? {
      playerName,
      completedMissions: 0,
      highestScore: 0,
      updatedAt: savedAt,
    };
    current.completedMissions += 1;
    current.highestScore = Math.max(current.highestScore, score.total);
    if (savedAt > current.updatedAt) current.updatedAt = savedAt;
    progress.set(playerName, current);
  }
  return [...progress.values()];
}

export function getTeam() {
  const roles = new Set([
    "Mission Commander",
    "Spacecraft Engineer",
    "Science Specialist",
    "Resource Manager",
  ]);
  const participants = readList(
    STORAGE_KEYS.team,
    (participant) =>
      participant &&
      typeof participant.name === "string" &&
      roles.has(participant.role),
  );
  if (
    participants.length > 4 ||
    new Set(participants.map((participant) => participant.role)).size !==
      participants.length
  ) {
    throw new Error("Saved team assignments exceed the four unique mission roles.");
  }
  return participants;
}

export function saveTeam(participants) {
  const roles = new Set([
    "Mission Commander",
    "Spacecraft Engineer",
    "Science Specialist",
    "Resource Manager",
  ]);
  if (
    !Array.isArray(participants) ||
    participants.length > 4 ||
    participants.some(
      (participant) =>
        !participant ||
        typeof participant.name !== "string" ||
        !participant.name.trim() ||
        !roles.has(participant.role),
    ) ||
    new Set(participants.map((participant) => participant.role)).size !==
      participants.length
  ) {
    throw new TypeError("A team must contain at most one participant per role.");
  }
  write(STORAGE_KEYS.team, participants);
  return participants;
}

export function createLocalId() {
  return createId();
}
