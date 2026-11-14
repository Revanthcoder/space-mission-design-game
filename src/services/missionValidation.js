/** @typedef {import("../types/mission").MissionSimulationResult} MissionSimulationResult */

const TEAM_ROLES = new Set([
  "Mission Commander",
  "Spacecraft Engineer",
  "Science Specialist",
  "Resource Manager",
]);

/**
 * Validate fields consumed by result views and scoring before storing engine output.
 * Metric values themselves are left to the scorer, which records unavailable values.
 * @param {MissionSimulationResult} result
 * @returns {MissionSimulationResult}
 */
export function validateSimulationResult(result) {
  if (
    !result ||
    typeof result !== "object" ||
    typeof result.missionId !== "string" ||
    !result.missionId.trim() ||
    typeof result.missionName !== "string" ||
    !result.missionName.trim() ||
    typeof result.objective !== "string" ||
    !result.objective.trim() ||
    !["success", "failure"].includes(result.outcome)
  ) {
    throw new TypeError(
      "A completed result must include a missionId, missionName, objective, and success or failure outcome.",
    );
  }

  for (const key of ["objectiveChecks", "engineeringChecks"]) {
    if (
      result[key] !== undefined &&
      (!Array.isArray(result[key]) ||
        result[key].some((check) => !check || typeof check !== "object"))
    ) {
      throw new TypeError(`${key} must be an array of check objects.`);
    }
  }

  if (
    result.resourceUsage !== undefined &&
    (!Array.isArray(result.resourceUsage) ||
      result.resourceUsage.some(
        (resource) =>
          !resource ||
          typeof resource !== "object" ||
          typeof resource.name !== "string",
      ))
  ) {
    throw new TypeError("resourceUsage must be an array of named resource objects.");
  }

  if (
    result.events !== undefined &&
    (!Array.isArray(result.events) ||
      result.events.some(
        (event) =>
          !event ||
          typeof event.name !== "string" ||
          typeof event.description !== "string",
      ))
  ) {
    throw new TypeError("events must be an array of named event descriptions.");
  }

  if (
    result.participants !== undefined &&
    (!Array.isArray(result.participants) ||
      result.participants.length > 4 ||
      result.participants.some(
        (participant) =>
          !participant ||
          typeof participant.name !== "string" ||
          !participant.name.trim() ||
          !TEAM_ROLES.has(participant.role),
      ) ||
      new Set(result.participants.map((participant) => participant.role)).size !==
        result.participants.length)
  ) {
    throw new TypeError(
      "participants must contain at most four named members with unique mission roles.",
    );
  }

  return result;
}

export function isValidScore(score) {
  return Boolean(
    score &&
      Number.isFinite(score.total) &&
      score.total >= 0 &&
      score.total <= 100 &&
      Array.isArray(score.categories) &&
      score.categories.every(
        (category) =>
          category &&
          typeof category.id === "string" &&
          typeof category.label === "string" &&
          Number.isFinite(category.earned) &&
          Number.isFinite(category.maximum) &&
          Array.isArray(category.reasons) &&
          category.reasons.every((reason) => typeof reason === "string"),
      ),
  );
}
