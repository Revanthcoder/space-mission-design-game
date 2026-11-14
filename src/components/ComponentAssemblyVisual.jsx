import { componentAssets } from "../data/spacecraftData";

const componentSymbols = {
  Structure: "▣",
  "Solar panels": "☀",
  Batteries: "◉",
  Communication: "⌁",
  Computers: "⌘",
  Cameras: "◌",
  Spectrometers: "◇",
  Radar: "◎",
  Magnetometers: "✥",
  "Attitude control": "⟳",
};

function getVisualClass(category) {
  return `assembly-visual-${category.toLowerCase().replaceAll(" ", "-")}`;
}

export default function ComponentAssemblyVisual({ component }) {
  const asset = componentAssets[component.category];

  return (
    <div className={`component-assembly-visual ${getVisualClass(component.category)}`}>
      <div className="component-image">
        {asset && (
          <img
            className="component-asset-image"
            src={asset.image}
            alt={`${asset.source} preview`}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}
        <span className="component-image-shape" />
        <strong>{componentSymbols[component.category]}</strong>
      </div>
      <div className="component-image-copy">
        <span>NASA OPEN ASSET / COMPONENT LOCKED</span>
        <strong>{component.name}</strong>
        <small>{component.mass} kg <i /> {component.powerGeneration ? `+${component.powerGeneration} W` : `${component.powerUse} W`}</small>
        {asset && (
          <a className="component-model-link" href={asset.model} target="_blank" rel="noreferrer">
            OPEN 3D MODEL ↗
          </a>
        )}
      </div>
    </div>
  );
}
