import { MISSION_PATHS, solarSystemDestinations } from "../data/spacecraftData.js";
import "./About.css";

const missionSteps = [
  {
    number: "01",
    title: "Choose a destination",
    description: "Pick an available mission path and see which spacecraft systems it needs.",
  },
  {
    number: "02",
    title: "Build and verify",
    description: "Assemble a spacecraft, balance its resources, and clear the readiness checks.",
  },
  {
    number: "03",
    title: "Fly and learn",
    description: "Make mission decisions, review telemetry, and improve your final score.",
  },
];

export default function About({ onStart }) {
  return (
    <main className="game-about">
      <header className="about-topbar">
        <div className="about-brand">
          <span className="about-brand-mark" aria-hidden="true">✦</span>
          <span><strong>MISSION CONTROL</strong><small>SPACECRAFT DESIGN LAB</small></span>
        </div>
        <div className="about-topbar-actions">
          <a href="#destinations">DESTINATIONS</a>
          <a href="#mission-paths">MISSION PATHS</a>
          <button type="button" onClick={onStart}>START DESIGNING <span aria-hidden="true">↗</span></button>
        </div>
      </header>

      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-hero-copy">
          <p className="about-kicker"><span /> INTERACTIVE SPACE MISSION DESIGN</p>
          <h1 id="about-title">Design a mission.<br /><span>Explore the system.</span></h1>
          <p className="about-lede">
            Build a spacecraft, choose a destination, and make the engineering trade-offs that shape its mission.
            Learn how objectives, power, communications, and payload choices work together.
          </p>
          <button className="about-primary-action" type="button" onClick={onStart}>
            START YOUR MISSION <span aria-hidden="true">→</span>
          </button>
          <p className="about-simulation-note">A learning simulation with simplified estimates, not real flight-planning software.</p>
        </div>

        <div className="about-scene" role="img" aria-label="Animated spacecraft circling an illustrated planet">
          <div className="about-scene-stars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
          <div className="about-orbit about-orbit-outer" aria-hidden="true"><i className="about-satellite"><span /></i></div>
          <div className="about-orbit about-orbit-inner" aria-hidden="true"><i /></div>
          <div className="about-planet" aria-hidden="true"><span /></div>
          <div className="about-scene-label about-scene-label-top">MISSION PATH · 01—08</div>
          <div className="about-scene-label about-scene-label-bottom"><i /> SYSTEMS NOMINAL <span>·</span> DESIGN PHASE</div>
          <div className="about-scene-coordinate">03° 12′ N<br />42° 18′ E</div>
        </div>
      </section>

      <section className="about-workflow" aria-label="How the game works">
        <div className="about-section-heading">
          <p className="about-kicker">FROM BLUEPRINT TO DEBRIEF</p>
          <h2>Three steps to mission control</h2>
        </div>
        <ol className="about-step-grid">
          {missionSteps.map((step) => (
            <li className="about-step-card" key={step.number}>
              <span className="about-step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-destinations" id="destinations" aria-labelledby="destinations-title">
        <div className="about-section-heading about-destination-heading">
          <div>
            <p className="about-kicker">CHOOSE YOUR SCIENCE FRONTIER</p>
            <h2 id="destinations-title">Every destination changes the mission</h2>
          </div>
          <p>
            Explore real solar-system worlds, compare their environments, and then choose the path
            that gives your spacecraft the right objective.
          </p>
        </div>
        <div className="about-destination-grid">
          {solarSystemDestinations.map((destination) => (
            <article
              className="about-destination-card group"
              key={destination.id}
              style={{ "--destination-accent": destination.accent }}
            >
              <div className="about-destination-image-wrap">
                <img
                  src={destination.image}
                  alt={`${destination.name}, ${destination.type}`}
                  className="about-destination-image"
                  loading="lazy"
                />
                <span className="about-destination-orbit" aria-hidden="true" />
                <span className="about-destination-type">{destination.type}</span>
              </div>
              <div className="about-destination-copy">
                <div className="about-destination-title">
                  <h3>{destination.name}</h3>
                  <span>{destination.availableLevels.length} {destination.availableLevels.length === 1 ? "PATH" : "PATHS"}</span>
                </div>
                <p className="about-destination-description">{destination.description}</p>
                <p className="about-destination-highlight">{destination.highlight}</p>
                <div className="about-destination-meta">
                  <span>{destination.gravityLabel}: <b>{destination.gravity}</b></span>
                  <span>{destination.distanceLabel}: <b>{destination.averageDistance}</b></span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-paths" id="mission-paths" aria-labelledby="mission-paths-title">
        <div className="about-section-heading about-path-heading">
          <div>
            <p className="about-kicker">EIGHT ENGINEERING CHALLENGES</p>
            <h2 id="mission-paths-title">Explore Path 1 through Path 8</h2>
          </div>
          <p>Each path is listed explicitly below. In the builder, compatible paths appear after you select a destination.</p>
        </div>
        <ol className="about-path-grid">
          {MISSION_PATHS.map((path) => (
            <li className="about-path-card" key={path.number}>
              <div className="about-path-card-top">
                <span>PATH {path.number}</span>
                <span>DESTINATION: {path.destination}</span>
              </div>
              <span className="about-path-indicator">INDICATES: {path.title}</span>
              <h3>{path.title}</h3>
              <p>{path.description}</p>
            </li>
          ))}
        </ol>
        <p className="about-path-note">
          Path 6 is an asteroid mission, not a planet. The planet selector shows compatible paths only;
          transfer routes and flight estimates are illustrative.
        </p>
      </section>

      <footer className="about-footer">
        <span>MISSION CONTROL <i /> EDUCATIONAL SPACE MISSION DESIGN</span>
        <span>Curiosity, engineering, and clear assumptions.</span>
      </footer>
    </main>
  );
}
