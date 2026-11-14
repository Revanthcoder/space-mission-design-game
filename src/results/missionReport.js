/** @typedef {import("../types/mission").MissionSimulationResult} MissionSimulationResult */
/** @typedef {import("../types/mission").ScoreBreakdown} ScoreBreakdown */
/** @typedef {import("../types/mission").MissionReport} MissionReport */

/**
 * @param {MissionSimulationResult} result
 * @param {ScoreBreakdown} score
 * @returns {MissionReport}
 */
export function buildMissionReport(result, score) {
  const suggestions = score.categories
    .filter((category) => category.earned < category.maximum)
    .map((category) => {
      const gap = category.maximum - category.earned;
      const reason = category.reasons.find((item) =>
        /deducted|invalid|over budget|no .* data|no valid/i.test(item),
      );
      return `${category.label}: ${reason ?? `up to ${gap.toFixed(1)} points were left unearned; review the associated simulation checks and configuration.`}`;
    });

  if (suggestions.length === 0) {
    suggestions.push("All scored categories reached their maximum; review mission objectives for further challenge.");
  }

  return {
    missionName: result.missionName,
    objective: result.objective,
    spacecraft: result.spacecraft ?? "Not provided",
    rocket: result.rocket ?? "Not provided",
    orbit: result.orbit ?? "Not provided",
    resourcesConsumed: result.resourceUsage ?? [],
    events: result.events ?? [],
    score,
    outcome: result.outcome,
    improvementSuggestions: suggestions,
    generatedAt: new Date().toISOString(),
  };
}

export function downloadMissionReport(report) {
  if (typeof document === "undefined" || typeof URL === "undefined") {
    throw new Error("Report downloads are unavailable in this environment.");
  }
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${report.missionName.trim().replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "mission"}-report.json`;
  link.click();
  URL.revokeObjectURL(url);
}
