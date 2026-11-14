const symbols = {
  Structure: "▣", "Solar panels": "☀", Batteries: "◉", Communication: "⌁",
  Computers: "⌘", Cameras: "◌", Spectrometers: "◇", Radar: "◎",
  Magnetometers: "✥", "Attitude control": "⟳", "Fuel systems": "⛽",
};

export default function ComponentCard({ component, installed, onAdd, onRemove, onInspect }) {
  return (
    <article className={`component-card ${installed ? "component-card-installed" : ""}`}>
      <button className="component-card-heading" onClick={() => onInspect(component)}>
        <span className="component-symbol">{symbols[component.category]}</span>
        <span><strong>{component.name}</strong><small>{component.category}</small></span>
      </button>
      <p>{component.description}</p>
      <div className="component-specs">
        <span>{component.mass} kg</span><span>${component.cost.toLocaleString()}</span>
        <span>{component.powerGeneration ? `+${component.powerGeneration} W` : `${component.powerUse} W`}</span><span>{component.reliability}% reliability</span>
      </div>
      {installed ? <button className="remove-button" onClick={() => onRemove(component.id)}>Remove from craft</button> : <button className="add-button" onClick={() => onAdd(component)}>Add to craft</button>}
    </article>
  );
}
