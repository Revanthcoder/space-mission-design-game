function Metric({ label, value, detail, percent, warning }) {
  return (
    <div className="resource-card">
      <span className="resource-label">{label}</span>
      <strong className={warning ? "warning-text" : ""}>{value}</strong>
      <small>{detail}</small>
      {percent !== undefined && <div className="progress-track"><i className={warning ? "progress-warning" : ""} style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} /></div>}
    </div>
  );
}

export default function ResourceDashboard({ resources, mission }) {
  return (
    <section className="resource-dashboard">
      <Metric label="TOTAL MASS" value={`${resources.mass} kg`} detail={`LIMIT ${mission.maxMass} kg`} percent={resources.mass / mission.maxMass * 100} warning={resources.mass > mission.maxMass} />
      <Metric label="TOTAL COST" value={`$${resources.totalCost.toLocaleString()}`} detail={`$${resources.remainingBudget.toLocaleString()} REMAINING`} percent={resources.totalCost / mission.maxBudget * 100} warning={resources.remainingBudget < 0} />
      <Metric label="SOLAR GENERATION" value={`${resources.powerGeneration} W`} detail={`MINIMUM ${mission.minPower} W`} percent={resources.powerGeneration / mission.minPower * 100} warning={resources.powerGeneration < mission.minPower} />
      <Metric label="POWER AVAILABLE" value={`${resources.availablePower} W`} detail={`${resources.powerUse} W consumption`} warning={resources.availablePower < 0} />
      <Metric label="BATTERY CAPACITY" value={`${resources.battery} Wh`} detail={`REQUIRED ${mission.minBattery} Wh`} percent={resources.battery / mission.minBattery * 100} warning={resources.battery < mission.minBattery} />
      <Metric label="RELIABILITY" value={`${resources.reliability}%`} detail={`REQUIRED ${mission.minReliability}%`} percent={resources.reliability} warning={resources.reliability < mission.minReliability} />
      <Metric label="FUEL ESTIMATE" value={`${resources.fuel} kg`} detail={`TARGET ${mission.fuelEstimate} kg`} warning={resources.fuel < mission.fuelEstimate} />
    </section>
  );
}
