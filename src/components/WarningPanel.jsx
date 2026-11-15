export default function WarningPanel({ validation }) {
  return (
    <section className={`warning-panel ${validation.valid ? "validation-success" : ""}`} aria-labelledby="engineering-validation-heading">
      <h3 id="engineering-validation-heading">ENGINEERING VALIDATION</h3>
      {validation.messages.map((message) => (
        <div className="validation-row" key={message.key}>
          <span className={message.ok ? "check-icon" : "warning-icon"} aria-hidden="true">{message.ok ? "✓" : "!"}</span>
          <span>{message.label}</span>
          <strong>{message.detail}</strong>
        </div>
      ))}
      <p className="validation-result" role="status" aria-live="polite">
        {validation.valid
          ? "Mission requirements satisfied. Continue to Mission Control."
          : "Add the missing required systems to continue to Mission Control."}
      </p>
    </section>
  );
}
