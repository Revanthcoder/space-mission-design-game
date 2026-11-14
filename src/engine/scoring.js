/** @typedef {import("../types/mission").MissionSimulationResult} MissionSimulationResult */
/** @typedef {import("../types/mission").ScoreBreakdown} ScoreBreakdown */

const CATEGORY_LIMITS = [
  ["objective", "Mission objective achievement", 30],
  ["engineering", "Engineering decisions", 25],
  ["resources", "Resource efficiency", 20],
  ["communication", "Communication performance", 15],
  ["lifetime", "Mission lifetime management", 10],
];

function isFiniteNonNegative(value) {
  return Number.isFinite(value) && value >= 0;
}

function weightedCheckScore(checks, passKey, label, maximum) {
  if (!Array.isArray(checks) || checks.length === 0) {
    return {
      earned: 0,
      reasons: [`No ${label.toLowerCase()} data was provided; no points awarded.`],
    };
  }

  const validChecks = checks.filter(
    (check) =>
      check &&
      typeof check[passKey] === "boolean" &&
      (check.weight === undefined ||
        (isFiniteNonNegative(check.weight) && check.weight > 0)),
  );
  const totalWeight = validChecks.reduce(
    (sum, check) => sum + (check.weight ?? 1),
    0,
  );

  if (totalWeight === 0) {
    return {
      earned: 0,
      reasons: [`No valid ${label.toLowerCase()} checks were provided.`],
    };
  }

  const achievedWeight = validChecks.reduce(
    (sum, check) =>
      sum + (check[passKey] ? (check.weight ?? 1) : 0),
    0,
  );
  const earned = (maximum * achievedWeight) / totalWeight;
  const reasons = validChecks.map((check) => {
    const points = (maximum * (check.weight ?? 1)) / totalWeight;
    const outcome = check[passKey]
      ? `+${points.toFixed(2)} points`
      : `0 of ${points.toFixed(2)} possible points (deducted)`;
    const detail = check.explanation ? ` ${check.explanation}` : "";
    return `${check.label ?? check.id}: ${outcome}.${detail}`;
  });

  if (validChecks.length !== checks.length) {
    reasons.push("Invalid checks were excluded from this category.");
  }

  return { earned, reasons };
}

function scoreResources(resources) {
  if (!Array.isArray(resources) || resources.length === 0) {
    return {
      earned: 0,
      reasons: ["No resource consumption data was provided; no points awarded."],
    };
  }

  const validResources = resources.filter(
    (resource) =>
      resource &&
      typeof resource.name === "string" &&
      isFiniteNonNegative(resource.consumed) &&
      isFiniteNonNegative(resource.available) &&
      resource.available > 0,
  );

  if (validResources.length === 0) {
    return {
      earned: 0,
      reasons: ["No valid resource budgets were provided; no points awarded."],
    };
  }

  const utilization =
    validResources.reduce(
      (sum, resource) => sum + resource.consumed / resource.available,
      0,
    ) / validResources.length;
  const earned = 20 * Math.max(0, 1 - utilization);
  const pointsPerResource = 20 / validResources.length;
  const reasons = validResources.map((resource) => {
    const percent =
      (resource.consumed / resource.available) * 100;
    const credit =
      pointsPerResource *
      Math.max(0, 1 - resource.consumed / resource.available);
    const overBudget =
      resource.consumed > resource.available
        ? ` Over budget; 0 of ${pointsPerResource.toFixed(2)} possible points.`
        : "";
    return `${resource.name}: ${percent.toFixed(1)}% used; +${credit.toFixed(2)} points.${overBudget}`;
  });

  if (validResources.length !== resources.length) {
    reasons.push("Invalid resource entries were excluded from this category.");
  }

  reasons.push(
    `Mean per-resource utilization: ${(utilization * 100).toFixed(1)}%; score is based on unused available resources.`,
  );
  return { earned, reasons };
}

function scoreCommunication(communication) {
  if (
    !communication ||
    !isFiniteNonNegative(communication.attempted) ||
    !isFiniteNonNegative(communication.successful) ||
    communication.successful > communication.attempted ||
    communication.attempted === 0
  ) {
    return {
      earned: 0,
      reasons: [
        "No valid attempted/successful communication counts were provided; no points awarded.",
      ],
    };
  }

  const reliability = communication.successful / communication.attempted;
  const earned = 15 * reliability;
  return {
    earned,
    reasons: [
      `${communication.successful} of ${communication.attempted} communication attempts succeeded (${(reliability * 100).toFixed(1)}%); +${earned.toFixed(2)} of 15 points.`,
    ],
  };
}

function scoreLifetime(lifetime) {
  if (
    !lifetime ||
    !isFiniteNonNegative(lifetime.actual) ||
    !isFiniteNonNegative(lifetime.target) ||
    lifetime.target === 0
  ) {
    return {
      earned: 0,
      reasons: [
        "No valid actual/target mission lifetime was provided; no points awarded.",
      ],
    };
  }

  const targetRatio = Math.min(1, lifetime.actual / lifetime.target);
  const earned = 10 * targetRatio;
  const unit = lifetime.unit ? ` ${lifetime.unit}` : "";
  return {
    earned,
    reasons: [
      `Mission lasted ${lifetime.actual}${unit} of a ${lifetime.target}${unit} target (${(targetRatio * 100).toFixed(1)}%); +${earned.toFixed(2)} of 10 points.`,
    ],
  };
}

function roundScore(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Score only measured simulation output; absent measurements earn no credit.
 * @param {MissionSimulationResult} result
 * @returns {ScoreBreakdown}
 */
export function scoreMission(result) {
  if (!result || typeof result !== "object") {
    throw new TypeError("A mission simulation result is required to score it.");
  }

  const objective = weightedCheckScore(
    result.objectiveChecks,
    "achieved",
    "Objective",
    30,
  );
  const engineering = weightedCheckScore(
    result.engineeringChecks,
    "passed",
    "Engineering",
    25,
  );
  const resources = scoreResources(result.resourceUsage);
  const communication = scoreCommunication(result.communication);
  const lifetime = scoreLifetime(result.missionLifetime);
  const values = [objective, engineering, resources, communication, lifetime];
  const categories = CATEGORY_LIMITS.map(([id, label, maximum], index) => ({
    id,
    label,
    maximum,
    earned: roundScore(Math.min(maximum, Math.max(0, values[index].earned))),
    reasons: values[index].reasons,
  }));
  const total = roundScore(
    Math.min(
      100,
      Math.max(0, categories.reduce((sum, category) => sum + category.earned, 0)),
    ),
  );

  return { total, categories };
}
