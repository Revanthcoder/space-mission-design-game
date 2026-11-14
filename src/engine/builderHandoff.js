import { INSTRUMENTS, OBJECTIVES, ROCKETS } from "../data/missionCatalog.js";

export function createMissionDesignFromBuilder(builderDesign) {
  const objectiveId = builderDesign.destinationId === "mars"
    ? "mars-weather"
    : "earth-observation";
  const objective = OBJECTIVES.find((item) => item.id === objectiveId);
  const instrumentIds = objective.recommendedInstrumentIds;
  const instrumentMassKg = instrumentIds.reduce((total, id) => {
    const instrument = INSTRUMENTS.find((item) => item.id === id);
    return total + (instrument?.massKg || 0);
  }, 0);
  const busMassKg = Math.min(
    600,
    Math.max(60, Math.round((builderDesign.massKg - instrumentMassKg) / 10) * 10),
  );
  const rocket = ROCKETS
    .filter((item) =>
      item.orbitIds.includes(objective.orbitIds[0])
      && item.missionTypes.some((type) => objective.missionTypes.includes(type))
      && item.payloadCapacityKg >= busMassKg + instrumentMassKg,
    )
    .sort((left, right) => left.costCredits - right.costCredits)[0];

  return {
    objectiveId,
    rocketId: rocket?.id || "farpoint",
    orbitId: objective.orbitIds[0],
    instrumentIds,
    busMassKg,
    powerGenerationW: Math.min(300, Math.max(40, builderDesign.powerGenerationW)),
    budgetCredits: Math.min(220, Math.max(40, Math.ceil(builderDesign.totalCost / 500))),
  };
}
