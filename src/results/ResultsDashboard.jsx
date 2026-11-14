function MetricCard({ label, value, detail, accent = false }) {
  return (
    <article className={`metric-card ${accent ? "accent" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function formatMetric(value, unit = "") {
  return Number.isFinite(value) ? `${value}${unit ? ` ${unit}` : ""}` : "Not reported";
}

function ResultsDashboard({
  record,
  reports,
  onSaveReport,
  onExportReport,
  reportMessage,
}) {
  const { result, score } = record;
  const engineering = score.categories.find((category) => category.id === "engineering");
  const resourceUsage = result.resourceUsage ?? [];
  const validResources = resourceUsage.filter(
    (resource) =>
      Number.isFinite(resource.consumed) &&
      Number.isFinite(resource.available) &&
      resource.available > 0,
  );
  const averageUsage =
    validResources.length > 0
      ? validResources.reduce(
          (sum, resource) => sum + resource.consumed / resource.available,
          0,
        ) / validResources.length
      : null;
  const communication = result.communication;
  const communicationLabel =
    communication &&
    Number.isFinite(communication.attempted) &&
    Number.isFinite(communication.successful)
      ? `${communication.successful} / ${communication.attempted}`
      : "Not reported";
  const lifetime = result.missionLifetime;
  const lifetimeLabel =
    lifetime && Number.isFinite(lifetime.actual) && Number.isFinite(lifetime.target)
      ? `${formatMetric(lifetime.actual, lifetime.unit)} / ${formatMetric(lifetime.target, lifetime.unit)}`
      : "Not reported";

  return (
    <>
      <section className="result-hero">
        <div className="result-title">
          <span className={`outcome-pill ${result.outcome}`}>
            <i /> MISSION {result.outcome.toUpperCase()}
          </span>
          <h2>{result.missionName}</h2>
          <p>{result.objective}</p>
        </div>
        <div className="score-display">
          <span>FINAL SCORE</span>
          <strong>{score.total}<small>/100</small></strong>
          <div className="score-track"><i style={{ width: `${score.total}%` }} /></div>
        </div>
      </section>

      <div className="metric-grid">
        <MetricCard label="SCIENTIFIC VALUE" value={result.scientificValue ? `${formatMetric(result.scientificValue.earned, result.scientificValue.unit)} / ${formatMetric(result.scientificValue.maximum, result.scientificValue.unit)}` : "Not reported"} detail={result.scientificValue ? "Simulation-reported value" : "No scientific value metric supplied"} />
        <MetricCard label="ENGINEERING EFFICIENCY" value={engineering ? `${Math.round((engineering.earned / engineering.maximum) * 100)}%` : "Not reported"} detail={result.engineeringChecks?.length ? `${engineering.earned} of ${engineering.maximum} points` : "No engineering checks supplied"} />
        <MetricCard label="RESOURCE UTILIZATION" value={averageUsage === null ? "Not reported" : `${(averageUsage * 100).toFixed(1)}%`} detail={validResources.length ? `${validResources.length} measured resource${validResources.length === 1 ? "" : "s"}` : "No resource budgets supplied"} />
        <MetricCard label="COMMUNICATION" value={communicationLabel} detail={communicationLabel === "Not reported" ? "No link data supplied" : "Successful / attempted"} />
        <MetricCard label="MISSION LIFETIME" value={lifetimeLabel} detail={lifetime ? "Actual / target" : "No lifetime data supplied"} />
      </div>

      <div className="two-column dashboard-columns">
        <section className="panel scoring-panel">
          <div className="panel-heading"><div><p className="eyebrow">TRANSPARENT SCORING</p><h2>Score breakdown</h2></div><span className="text-count">OUT OF 100</span></div>
          <div className="category-list">{score.categories.map((category) => {
            const percent = category.maximum > 0 ? (category.earned / category.maximum) * 100 : 0;
            return <article className="category-row" key={category.id}><div className="category-header"><strong>{category.label}</strong><span>{category.earned}<small> / {category.maximum}</small></span></div><div className="category-track"><i style={{ width: `${percent}%` }} /></div><ul>{category.reasons.map((reason, index) => <li key={`${category.id}-${index}`}>{reason}</li>)}</ul></article>;
          })}</div>
        </section>

        <section className="panel details-panel">
          <div className="panel-heading"><div><p className="eyebrow">FLIGHT SUMMARY</p><h2>Configuration & events</h2></div></div>
          <dl className="configuration-list"><div><dt>Spacecraft</dt><dd>{result.spacecraft || "Not provided"}</dd></div><div><dt>Rocket</dt><dd>{result.rocket || "Not provided"}</dd></div><div><dt>Orbit</dt><dd>{result.orbit || "Not provided"}</dd></div></dl>
          <div className="events-section"><h3>Events / problems encountered</h3>{result.events?.length ? <ul className="event-list">{result.events.map((event, index) => <li key={`${event.name}-${index}`}><span className="event-mark">!</span><div><strong>{event.name}</strong><p>{event.description}</p></div></li>)}</ul> : <p className="empty-copy">No events or problems were reported by the simulation.</p>}</div>
          <div className="resource-list-section"><h3>Resource consumption</h3>{validResources.length ? <ul className="resource-list">{validResources.map((resource, index) => <li key={`${resource.name}-${index}`}><span>{resource.name}</span><strong>{resource.consumed} / {resource.available}{resource.unit ? ` ${resource.unit}` : ""}</strong></li>)}</ul> : <p className="empty-copy">No valid resource budgets were reported.</p>}</div>
        </section>
      </div>

      <section className="panel report-panel">
        <div><p className="eyebrow">MISSION DEBRIEF</p><h2>Mission report</h2><p className="panel-copy">Build a report with configuration, resources, events, score, outcome and data-driven improvement suggestions.</p></div>
        <div className="report-actions"><button className="button primary" onClick={() => onSaveReport(record)}>Save report</button><button className="button secondary" onClick={() => onExportReport(record)}>Export JSON <span>↓</span></button></div>
        {reportMessage && <p className="inline-message full" role="status">{reportMessage}</p>}
        {reports.some((item) => item.recordId === record.id) && <span className="report-saved"><i /> Report saved on this device</span>}
      </section>
    </>
  );
}

export default ResultsDashboard;
