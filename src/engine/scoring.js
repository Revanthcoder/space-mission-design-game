import { INSTRUMENTS } from "../data/missionCatalog.js";

const CATEGORY_MAXIMA = {
  objective: 30,
  engineering: 25,
  resources: 20,
  communication: 15,
  lifetime: 10,
};

const COMMUNICATION_POINTS = {
  Nominal: 15,
  "Priority link active": 15,
  "Backup link active": 13,
  "Nominal after delay": 12,
  "Downlink in progress": 10,
  Interrupted: 0,
};

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function roundedPoints(maximum, ratio) {
  return Math.round(maximum * clamp(Number.isFinite(ratio) ? ratio : 0, 0, 1));
}

function pointsEarned(label, points, maximum) {
  return `${label}: +${points}/${maximum} points.`;
}

function pointsMissed(label, points, maximum) {
  return points < maximum ? `${label}: ${maximum - points} point${maximum - points === 1 ? "" : "s"} not earned.` : "";
}

function makeCategory(id, title, points, explanation, awards, deductions) {
  return {
    id,
    title,
    points,
    maxPoints: CATEGORY_MAXIMA[id],
    explanation,
    awards,
    deductions,
  };
}

export function calculateMissionScore({ state, metrics, objective = metrics.objective }) {
  const science = clamp(Number(state.scienceScore) || 0, 0, 100);
  const data = Math.max(0, Number(state.dataCollectedGb) || 0);
  const power = clamp(Number(state.powerPercent) || 0, 0, 100);
  const objectiveAchieved = power > 0 && data > 0 && science >= 30;

  const sciencePoints = objectiveAchieved ? 18 : roundedPoints(18, science / 30);
  const dataPoints = objectiveAchieved ? 8 : roundedPoints(8, data / 25);
  const objectiveReservePoints = objectiveAchieved ? 4 : power > 0 ? 4 : 0;
  const objectivePoints = objectiveAchieved
    ? CATEGORY_MAXIMA.objective
    : Math.min(CATEGORY_MAXIMA.objective - 1, sciencePoints + dataPoints + objectiveReservePoints);
  const objectiveAwards = [
    sciencePoints > 0 ? pointsEarned("Science return", sciencePoints, 18) : "",
    dataPoints > 0 ? pointsEarned("Data return", dataPoints, 8) : "",
    objectiveReservePoints > 0 ? pointsEarned("Power remaining", objectiveReservePoints, 4) : "",
  ].filter(Boolean);
  const objectiveDeductions = [
    pointsMissed("Science return", sciencePoints, 18),
    pointsMissed("Data return", dataPoints, 8),
    pointsMissed("Power remaining", objectiveReservePoints, 4),
  ].filter(Boolean);
  if (science < 30) objectiveDeductions.push(`Science return was ${science}%; the scenario threshold is 30%.`);
  if (data === 0) objectiveDeductions.push("No mission data was returned.");
  const objectiveCategory = makeCategory(
    "objective",
    "Mission objective achievement",
    objectivePoints,
    objectiveAchieved
      ? "The science, data, and power conditions for objective completion were all met."
      : "Partial credit reflects science return, data returned, and whether the spacecraft retained power.",
    objectiveAwards,
    objectiveDeductions,
  );

  const instruments = metrics.instruments || [];
  const compatibleCount = instruments.filter((instrument) =>
    instrument.objectives.includes(objective?.id),
  ).length;
  const recommendedIds = objective?.recommendedInstrumentIds || [];
  const recommendedCount = recommendedIds.filter((id) =>
    instruments.some((instrument) => instrument.id === id),
  ).length;
  const compatibilityPoints = roundedPoints(12, instruments.length ? compatibleCount / instruments.length : 0);
  const recommendationPoints = roundedPoints(5, recommendedIds.length
    ? recommendedCount / recommendedIds.length
    : 0);
  const payloadCapacity = Number(metrics.rocket?.payloadCapacityKg) || 0;
  const payloadMargin = payloadCapacity > 0
    ? (payloadCapacity - Number(metrics.massKg || 0)) / payloadCapacity
    : 0;
  const payloadPoints = roundedPoints(4, payloadMargin / 0.15);
  const budget = Number(metrics.availableBudgetCredits) || 0;
  const budgetMargin = budget > 0
    ? (budget - Number(metrics.costCredits || 0)) / budget
    : 0;
  const budgetPoints = roundedPoints(4, budgetMargin / 0.2);
  const engineeringPoints = compatibilityPoints
    + recommendationPoints
    + payloadPoints
    + budgetPoints;
  const engineeringAwards = [];
  const engineeringDeductions = [];
  const engineeringReasons = [
    [compatibilityPoints, 12, "Objective-compatible instruments"],
    [recommendationPoints, 5, "Recommended instruments"],
    [payloadPoints, 4, "Payload margin"],
    [budgetPoints, 4, "Budget margin"],
  ];
  engineeringReasons.forEach(([points, maximum, label]) => {
    if (points > 0) engineeringAwards.push(pointsEarned(label, points, maximum));
    const deduction = pointsMissed(label, points, maximum);
    if (deduction) engineeringDeductions.push(deduction);
  });
  const engineeringCategory = makeCategory(
    "engineering",
    "Engineering decisions",
    engineeringPoints,
    `Points reflect objective-compatible instruments (${compatibleCount}/${instruments.length}), recommended instruments (${recommendedCount}/${recommendedIds.length}), launch-vehicle mass margin, and remaining budget.`,
    engineeringAwards,
    engineeringDeductions,
  );

  const availablePower = Number(metrics.availablePowerW) || 0;
  const powerLoad = Number(metrics.powerLoadW) || 0;
  const powerReservePoints = roundedPoints(10, power / 100);
  const generationMarginRatio = powerLoad > 0
    ? (availablePower - powerLoad) / (powerLoad * 0.25)
    : 0;
  const generationPoints = roundedPoints(10, generationMarginRatio);
  const resourcePoints = powerReservePoints + generationPoints;
  const resourceAwards = [
    powerReservePoints > 0 ? pointsEarned("End-of-mission power reserve", powerReservePoints, 10) : "",
    generationPoints > 0 ? pointsEarned("Power-generation headroom", generationPoints, 10) : "",
  ].filter(Boolean);
  const resourceDeductions = [
    pointsMissed("End-of-mission power reserve", powerReservePoints, 10),
    pointsMissed("Power-generation headroom", generationPoints, 10),
  ].filter(Boolean);
  if (generationPoints < 10) resourceDeductions.push(`Power generation is ${availablePower} W for a ${powerLoad} W system load; at least 25% headroom earns full points.`);
  const resourceCategory = makeCategory(
    "resources",
    "Resource efficiency",
    resourcePoints,
    "Points reflect both the final simulated power reserve and configured power-generation headroom.",
    resourceAwards,
    resourceDeductions,
  );

  const communication = state.communication || "Unknown";
  const communicationPoints = Object.hasOwn(COMMUNICATION_POINTS, communication)
    ? COMMUNICATION_POINTS[communication]
    : 8;
  const communicationAwards = communicationPoints > 0
    ? [pointsEarned(`Final state "${communication}"`, communicationPoints, 15)]
    : [];
  const communicationDeductions = communicationPoints < 15
    ? [pointsMissed("Communication performance", communicationPoints, 15), `Communication ended in the "${communication}" state.`]
    : [];
  const communicationCategory = makeCategory(
    "communication",
    "Communication performance",
    communicationPoints,
    "The final simulated communications state determines this category score.",
    communicationAwards,
    communicationDeductions,
  );

  const instrumentOperational = Boolean(state.instrumentOperational);
  const operationalPoints = instrumentOperational ? 6 : 0;
  const lifetimeReservePoints = roundedPoints(4, power / 50);
  const lifetimePoints = operationalPoints + lifetimeReservePoints;
  const lifetimeAwards = [
    instrumentOperational ? pointsEarned("Instrument uptime", operationalPoints, 6) : "",
    lifetimeReservePoints > 0 ? pointsEarned("End-of-mission reserve", lifetimeReservePoints, 4) : "",
    `${Number(state.missionDays) || 0} simulated days were completed.`,
  ].filter(Boolean);
  const lifetimeDeductions = [
    pointsMissed("Instrument uptime", operationalPoints, 6),
    pointsMissed("End-of-mission reserve", lifetimeReservePoints, 4),
  ].filter(Boolean);
  if (!instrumentOperational) lifetimeDeductions.push("The science instrument was not operational at mission completion.");
  const lifetimeCategory = makeCategory(
    "lifetime",
    "Mission lifetime management",
    lifetimePoints,
    "Points reflect instrument uptime and the power reserve available to sustain operations at the end of the simulated mission.",
    lifetimeAwards,
    lifetimeDeductions,
  );

  const categories = [
    objectiveCategory,
    engineeringCategory,
    resourceCategory,
    communicationCategory,
    lifetimeCategory,
  ];
  const total = categories.reduce((sum, category) => sum + category.points, 0);
  const improvementSuggestions = [];
  if (!objectiveAchieved) {
    improvementSuggestions.push(
      `Reach at least 30% science return (currently ${science}%), return mission data, and retain power above 0% to meet the simulated objective gate.`,
    );
  }
  if (compatibleCount < instruments.length) {
    improvementSuggestions.push("Remove or replace instruments that do not support the selected mission objective.");
  }
  if (recommendedCount < recommendedIds.length) {
    const missingInstrumentIds = recommendedIds.filter((id) =>
      !instruments.some((instrument) => instrument.id === id),
    );
    const missingInstruments = missingInstrumentIds
      .map((id) => INSTRUMENTS.find((instrument) => instrument.id === id))
      .filter(Boolean);
    const addedMass = missingInstruments.reduce((sum, instrument) => sum + instrument.massKg, 0);
    const addedPower = missingInstruments.reduce((sum, instrument) => sum + instrument.powerW, 0);
    const addedCost = missingInstruments.reduce((sum, instrument) => sum + instrument.costCredits, 0);
    const fitsPayload = payloadCapacity > 0 && Number(metrics.massKg || 0) + addedMass <= payloadCapacity;
    const fitsPower = availablePower >= powerLoad + addedPower;
    const fitsBudget = budget >= Number(metrics.costCredits || 0) + addedCost;
    const names = missingInstruments.map((instrument) => instrument.name).join(", ");
    if (fitsPayload && fitsPower && fitsBudget) {
      improvementSuggestions.push(
        `Add ${names} (+${addedMass} kg, +${addedPower} W, +${addedCost} credits); the current design margins can support the recommended science payload.`,
      );
    } else {
      improvementSuggestions.push(
        `The recommended payload includes ${names} (+${addedMass} kg, +${addedPower} W, +${addedCost} credits). Adjust the vehicle, power generation, or budget before adding it.`,
      );
    }
  }
  if (payloadPoints < 4 && payloadCapacity > 0) {
    const targetMass = Math.floor(payloadCapacity * 0.85);
    improvementSuggestions.push(
      `Reduce spacecraft mass to ${targetMass} kg or less to preserve the 15% payload-capacity margin used by the score.`,
    );
  }
  if (budgetPoints < 4) {
    const targetBudget = Math.ceil(Number(metrics.costCredits || 0) / 0.8);
    improvementSuggestions.push(
      `Keep at least 20% of the budget unspent; with ${metrics.costCredits} credits projected, the score's target allocation is at least ${targetBudget} credits.`,
    );
  }
  if (generationPoints < 10) {
    const targetGeneration = Math.ceil(powerLoad * 1.25);
    improvementSuggestions.push(
      `Raise power generation to at least ${targetGeneration} W for the ${powerLoad} W systems load, or reduce the load to create the 25% headroom target.`,
    );
  }
  if (powerReservePoints < 10) {
    const powerDrainingChoices = (state.decisionLog || [])
      .filter((decision) => Number(decision.effect?.powerDelta) < 0)
      .map((decision) => decision.choice);
    const drainDetail = powerDrainingChoices.length
      ? ` Review power-consuming choices such as ${powerDrainingChoices.join(", ")}.`
      : "";
    improvementSuggestions.push(
      `Finish with at least 95% power reserve to earn all reserve-efficiency points (current reserve: ${power}%).${drainDetail}`,
    );
  }
  if (communicationPoints < 15) {
    improvementSuggestions.push(
      `Communication finished as "${communication}" (${communicationPoints}/15). Prefer backup or priority transmission decisions when a contact window is at risk.`,
    );
  }
  if (!instrumentOperational) {
    improvementSuggestions.push("Restore instrument operation before mission completion; the offline payload reduced lifetime-management credit.");
  }
  if (lifetimeReservePoints < 4) {
    improvementSuggestions.push(`Retain at least 50% end-of-mission power to earn all lifetime reserve points (current reserve: ${power}%).`);
  }
  if (improvementSuggestions.length === 0) {
    improvementSuggestions.push("The simulated mission met its key targets; compare alternative configurations to explore different engineering trade-offs.");
  }

  return {
    total,
    maxPoints: 100,
    objectiveAchieved,
    outcome: objectiveAchieved ? "Successful" : science > 0 || data > 0 ? "Partially successful" : "Unsuccessful",
    categories,
    improvementSuggestions,
  };
}
