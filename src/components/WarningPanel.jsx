export default function WarningPanel({ validation }) {
  return (
    <section className={`warning-panel ${validation.valid ? "validation-success" : ""}`}>
      <h3>ENGINEERING VALIDATION</h3>
      {validation.messages.map((message) => (
        <div className="validation-row" key={message.key}>
          <span className={message.ok ? "check-icon" : "warning-icon"}>{message.ok ? "✓" : "!"}</span>
          <span>{message.label}</span>
          <strong>{message.detail}</strong>
        </div>
      ))}
      <p className="validation-result">{validation.valid ? "✓ Mission requirements satisfied." : "⚠ Resolve the warnings before unlocking the next level."}</p>
    </section>
  );
}
