import { scoreMission } from "../engine/scoring.js";
import { saveMissionResult } from "./localStorage.js";
import { validateSimulationResult } from "./missionValidation.js";

/** @typedef {import("../types/mission").MissionSimulationResult} MissionSimulationResult */

/**
 * Persist a completed engine result and its deterministic score breakdown.
 * The simulation engine may call this directly instead of using the JSON handoff.
 * @param {MissionSimulationResult} result
 */
export function recordSimulationResult(result) {
  const validatedResult = validateSimulationResult(result);
  const score = scoreMission(validatedResult);
  return saveMissionResult(validatedResult, score);
}
