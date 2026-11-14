export function calculateResources(selectedComponents, mission) {
  const count = selectedComponents.length || 1;
  const totalCost = selectedComponents.reduce((sum, item) => sum + item.cost, 0);
  const totalPowerUse = selectedComponents.reduce((sum, item) => sum + item.powerUse, 0);
  const totalPowerGeneration = selectedComponents.reduce((sum, item) => sum + item.powerGeneration, 0);

  return {
    mass: selectedComponents.reduce((sum, item) => sum + item.mass, 0),
    totalCost,
    remainingBudget: mission.maxBudget - totalCost,
    battery: selectedComponents.reduce((sum, item) => sum + (item.battery || 0), 0),
    powerGeneration: totalPowerGeneration,
    powerUse: totalPowerUse,
    availablePower: totalPowerGeneration - totalPowerUse,
    fuel: selectedComponents.reduce((sum, item) => sum + (item.fuel || 0), 0),
    reliability: Math.round(
      selectedComponents.reduce((sum, item) => sum + item.reliability, 0) / count,
    ),
  };
}

export function validateMission(selectedComponents, resources, mission) {
  const selectedCategories = new Set(selectedComponents.map((item) => item.category));
  const missingCategories = mission.requiredCategories.filter(
    (category) => !selectedCategories.has(category),
  );
  const messages = [
    { key: "mass", label: "Mass limit", ok: resources.mass <= mission.maxMass, detail: `${resources.mass} / ${mission.maxMass} kg` },
    { key: "budget", label: "Budget limit", ok: resources.totalCost <= mission.maxBudget, detail: `$${Math.max(0, resources.remainingBudget).toLocaleString()} remaining` },
    { key: "power", label: "Power generation", ok: resources.powerGeneration >= mission.minPower && resources.availablePower >= 0, detail: `${resources.availablePower} W available` },
    { key: "battery", label: "Battery capacity", ok: resources.battery >= mission.minBattery, detail: `${resources.battery} / ${mission.minBattery} Wh` },
    { key: "fuel", label: "Propulsion fuel", ok: resources.fuel >= mission.fuelEstimate, detail: `${resources.fuel} / ${mission.fuelEstimate} kg` },
    { key: "reliability", label: "Reliability target", ok: resources.reliability >= mission.minReliability, detail: `${resources.reliability}% / ${mission.minReliability}%` },
    { key: "components", label: "Required systems", ok: missingCategories.length === 0, detail: missingCategories.length ? `${missingCategories.length} category missing` : "Complete" },
  ];

  return {
    valid: messages.every((message) => message.ok) && selectedComponents.length > 0,
    messages,
  };
}
