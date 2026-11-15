import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

const FLIGHT_SEQUENCE = [
  { id: "countdown", duration: 0 },
  { id: "ignition", duration: 2600 },
  { id: "liftoff", duration: 5000 },
  { id: "separation", duration: 2500 },
  { id: "second-stage", duration: 3800 },
  { id: "orbit", duration: 4500 },
  { id: "complete", duration: 0 },
];

const DESTINATION_FLIGHT_SEQUENCE = [
  ...FLIGHT_SEQUENCE.slice(0, -1),
  { id: "transfer", duration: 5200 },
  FLIGHT_SEQUENCE[FLIGHT_SEQUENCE.length - 1],
];

const TRANSFER_LABELS = {
  moon: "LUNAR TRANSFER",
  mercury: "INNER-PLANET TRANSFER",
  venus: "INNER-PLANET TRANSFER",
  mars: "INNER-PLANET TRANSFER",
  jupiter: "OUTER-PLANET TRANSFER",
  saturn: "OUTER-PLANET TRANSFER",
  uranus: "ICE-GIANT TRANSFER",
  neptune: "ICE-GIANT TRANSFER",
};

const PHASE_DETAILS = {
  countdown: {
    name: "Terminal countdown",
    title: "LAUNCH SEQUENCE ARMED",
    description: "Flight computer checks are complete. Terminal count is underway.",
    vehicleStage: "PAD HOLD",
    altitude: "0 km",
    speed: "0 km/s",
  },
  ignition: {
    name: "Engine ignition",
    title: "MAIN ENGINE START",
    description: "Engines are lighting. Hold-down clamps remain engaged for final checks.",
    vehicleStage: "IGNITION",
    altitude: "0 km",
    speed: "0 km/s",
  },
  liftoff: {
    name: "Liftoff",
    title: "VEHICLE RELEASE",
    description: "The launch vehicle clears the pad as the camera tracks its ascent.",
    vehicleStage: "FIRST-STAGE ASCENT",
    altitude: "0–80 km",
    speed: "0–2.4 km/s",
  },
  separation: {
    name: "Stage separation",
    title: "STAGE 1 SEPARATION",
    description: "The spent first stage falls away; the upper stage takes over.",
    vehicleStage: "STAGING",
    altitude: "~80 km",
    speed: "~2.4 km/s",
  },
  "second-stage": {
    name: "Upper-stage burn",
    title: "UPPER-STAGE ASCENT",
    description: "The upper stage accelerates the payload toward an Earth parking orbit.",
    vehicleStage: "UPPER STAGE",
    altitude: "80–400 km",
    speed: "2.4–7.7 km/s",
  },
  orbit: {
    name: "Orbit insertion",
    title: "ORBIT INSERTION",
    description: "The spacecraft separates from the launch vehicle into its reference orbit.",
    vehicleStage: "PAYLOAD DEPLOYMENT",
    altitude: "~400 km",
    speed: "~7.7 km/s",
  },
  transfer: {
    name: "Destination transfer",
    title: "DESTINATION TRANSFER",
    description: "The spacecraft follows a schematic transfer path from Earth toward its selected destination.",
    vehicleStage: "TRANSFER COAST",
    altitude: "Not to scale",
    speed: "Not modeled",
  },
  complete: {
    name: "Orbit established",
    title: "PARKING ORBIT ESTABLISHED",
    description: "Spacecraft deployment is complete; the destination transfer is schematic.",
    vehicleStage: "SPACECRAFT DEPLOYED",
    altitude: "~400 km",
    speed: "~7.7 km/s",
  },
};

function SpacecraftPayload({ components }) {
  const hasSolarPanels = components.some((component) => component.category === "Solar panels");
  const hasCommunication = components.some((component) => component.category === "Communication");

  return (
    <g className="launch-spacecraft-payload">
      {hasSolarPanels && (
        <g className="launch-payload-arrays">
          <path d="M-59 -16h38v25h-38zM21 -16h38v25H21z" />
          <path d="M-55 -13v19m10-19V6m10-19V6m10-19V6M25-13V6m10-19V6m10-19V6m10-19V6" />
        </g>
      )}
      <rect x="-20" y="-25" width="40" height="42" rx="4" className="launch-payload-bus" />
      <path d="M-15 -19h30v8h-30z" className="launch-payload-gold" />
      <circle cx="0" cy="-2" r="5" className="launch-payload-window" />
      {hasCommunication && (
        <g className="launch-payload-dish">
          <path d="M20 -23q22 0 22 17H20z" />
          <path d="M22 -23l8 18" />
        </g>
      )}
      <path d="M-8 17v11m16-11v11" className="launch-payload-boom" />
    </g>
  );
}

function LaunchVisual({ components, destination, stage }) {
  const isDestinationOrbit = stage === "complete" && destination.id !== "earth";
  const isTransfer = stage === "transfer" && destination.id !== "earth";
  const transferTargetRadius = destination.id === "moon"
    ? 38
    : ["jupiter", "saturn"].includes(destination.id)
      ? 64
      : ["uranus", "neptune"].includes(destination.id)
        ? 54
        : 46;

  return (
    <svg
      className="launch-scene"
      viewBox="0 0 1100 600"
      role="img"
      aria-label={`Earth launch and ${destination.name} mission sequence`}
    >
      <defs>
        <linearGradient id="launch-day-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d2947" />
          <stop offset="0.62" stopColor="#4f91b2" />
          <stop offset="1" stopColor="#b6c8c0" />
        </linearGradient>
        <linearGradient id="launch-night-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#030813" />
          <stop offset="0.7" stopColor="#091d37" />
          <stop offset="1" stopColor="#235778" />
        </linearGradient>
        <linearGradient id="launch-twilight-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#07101f" />
          <stop offset="0.65" stopColor="#244d70" />
          <stop offset="1" stopColor="#cf805b" />
        </linearGradient>
        <linearGradient id="launch-earth-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#62c6e8" />
          <stop offset="0.12" stopColor="#1c699b" />
          <stop offset="0.52" stopColor="#0c315d" />
          <stop offset="1" stopColor="#06162d" />
        </linearGradient>
        <linearGradient id="launch-flame-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff7c5" />
          <stop offset="0.38" stopColor="#ffd25d" />
          <stop offset="1" stopColor="#f15c35" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="launch-plume-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3c2" stopOpacity="0.96" />
          <stop offset="0.28" stopColor="#ffb448" stopOpacity="0.82" />
          <stop offset="0.72" stopColor="#ed5736" stopOpacity="0.4" />
          <stop offset="1" stopColor="#d84935" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="launch-vehicle-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#697781" />
          <stop offset="0.18" stopColor="#e4e9e7" />
          <stop offset="0.48" stopColor="#fbfcf8" />
          <stop offset="0.76" stopColor="#c3ccce" />
          <stop offset="1" stopColor="#73818a" />
        </linearGradient>
        <linearGradient id="launch-fairing-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#75828a" />
          <stop offset="0.45" stopColor="#f1f3ef" />
          <stop offset="0.78" stopColor="#cbd2d2" />
          <stop offset="1" stopColor="#717e86" />
        </linearGradient>
        <radialGradient id="launch-engine-glow">
          <stop offset="0" stopColor="#fff1a6" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#ff8b38" stopOpacity="0.46" />
          <stop offset="1" stopColor="#ff6738" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="launch-pad-glow">
          <stop offset="0" stopColor="#ffd780" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ff8348" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="launch-smoke-fill">
          <stop offset="0" stopColor="#eef3ef" stopOpacity="0.94" />
          <stop offset="0.56" stopColor="#b9c5c8" stopOpacity="0.78" />
          <stop offset="1" stopColor="#77858c" stopOpacity="0" />
        </radialGradient>
        <filter id="launch-smoke-blur">
          <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="8" result="smoke-noise" />
          <feDisplacementMap in="SourceGraphic" in2="smoke-noise" scale="9" xChannelSelector="R" yChannelSelector="G" result="smoke-shape" />
          <feGaussianBlur in="smoke-shape" stdDeviation="5" />
        </filter>
        <filter id="launch-glow">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect className="launch-sky" width="1100" height="600" />
      <g className="launch-stars" aria-hidden="true">
        <circle cx="100" cy="72" r="1.5" />
        <circle cx="208" cy="119" r="1" />
        <circle cx="343" cy="52" r="1.4" />
        <circle cx="448" cy="112" r="1" />
        <circle cx="712" cy="59" r="1.4" />
        <circle cx="854" cy="121" r="1" />
        <circle cx="1001" cy="72" r="1.5" />
        <circle cx="944" cy="198" r="1" />
        <circle cx="139" cy="205" r="1" />
      </g>
      <g className="launch-clouds" aria-hidden="true">
        <path d="M0 400q120-70 240 0t240 0 240 0 240 0 140 0v80H0z" />
      </g>

      {isTransfer && (
        <g className="launch-transfer-scene" aria-label={`${TRANSFER_LABELS[destination.id] || "DESTINATION TRANSFER"} to ${destination.name}; schematic and not to scale`}>
          <text x="550" y="58" className="launch-transfer-heading" textAnchor="middle">
            {TRANSFER_LABELS[destination.id] || "DESTINATION TRANSFER"} // SCHEMATIC
          </text>
          <circle cx="158" cy="362" r="96" className="launch-transfer-earth" />
          <path d="M79 336q28-45 63-21 25-42 61-13 30-22 49 17-39 25-77 11-43 29-96 6z" className="launch-transfer-earth-land" />
          <text x="158" y="478" className="launch-transfer-label" textAnchor="middle">EARTH DEPARTURE</text>
          <path d="M251 330C405 116 675 126 847 248" className="launch-transfer-path" />
          <ellipse cx="924" cy="250" rx={transferTargetRadius * 1.65} ry={transferTargetRadius * 0.5} className="launch-transfer-target-orbit" />
          {destination.id === "saturn" && (
            <ellipse cx="924" cy="250" rx={transferTargetRadius * 1.65} ry={transferTargetRadius * 0.5} className="launch-transfer-saturn-rings" />
          )}
          <circle
            cx="924"
            cy="250"
            r={transferTargetRadius}
            className="launch-transfer-target"
            style={{ fill: destination.accent }}
          />
          {["jupiter", "saturn", "uranus", "neptune"].includes(destination.id) && (
            <g className="launch-transfer-bands">
              <path d={`M${924 - transferTargetRadius} 238 Q924 248 ${924 + transferTargetRadius} 238`} />
              <path d={`M${924 - transferTargetRadius} 260 Q924 250 ${924 + transferTargetRadius} 260`} />
            </g>
          )}
          <text x="924" y={250 + transferTargetRadius + 28} className="launch-transfer-label" textAnchor="middle">
            {destination.name.toUpperCase()} TARGET
          </text>
          <g className="launch-transfer-craft">
            <animateMotion
              dur="5.2s"
              fill="freeze"
              path="M 251 330 C 405 116 675 126 847 248"
            />
            <g transform="scale(0.42)">
              <SpacecraftPayload components={components} />
            </g>
          </g>
          <text x="550" y="548" className="launch-transfer-caveat" textAnchor="middle">
            ILLUSTRATIVE PATH · TRANSFER TIME AND ARRIVAL ORBIT NOT CALCULATED
          </text>
        </g>
      )}

      <g className={`launch-orbit-earth ${isDestinationOrbit ? "launch-orbit-earth-hidden" : ""}`}>
        <circle cx="550" cy="725" r="438" className="launch-earth-disc" />
        <path d="M244 514q52-82 124-40 50-67 103-12 36-32 89 9 62-24 109 40-68 54-142 32-76 40-149 2-59 31-134-31z" className="launch-continent launch-continent-one" />
        <path d="M664 483q41-58 94-24 48-38 103 13 47-8 92 44-86 48-153 15-85 30-136-48z" className="launch-continent launch-continent-two" />
        <ellipse cx="550" cy="392" rx="350" ry="116" className="launch-orbit-ring launch-orbit-ring-far" />
        <ellipse cx="550" cy="407" rx="286" ry="83" className="launch-orbit-ring launch-orbit-ring-near" />
        <path
          id="launch-orbit-path"
          d="M200 392a350 116 0 1 0 700 0a350 116 0 1 0-700 0"
          className="launch-orbit-track"
        />
        <g className="launch-orbiting-spacecraft">
          <animateMotion
            dur="7s"
            repeatCount="indefinite"
            rotate="auto"
            path="M 200 392 a 350 116 0 1 0 700 0 a 350 116 0 1 0 -700 0"
          />
          <path d="M-10-4h20v8h-20zM-25-3h13v6h-13zM12-3h13v6H12z" />
          <circle r="2" />
        </g>
        <path d="M550 276v-42m-8 8 8-8 8 8" className="launch-orbit-insertion-vector" />
      </g>

      <g className="launch-launchpad">
        <path d="M0 452h1100v148H0z" className="launch-ground" />
        <ellipse cx="550" cy="462" rx="150" ry="38" className="launch-pad-glow" />
        <path d="M508 462h84l46 46H462z" className="launch-flame-deflector" />
        <path d="M410 452V238h44v214m-44-167h44m-44 51h44m-44 51h44m-44 51h44" className="launch-service-tower" />
        <path d="M454 260h58m-58 28h48m-48 28h58m-58 28h48m-48 28h58" className="launch-service-arm" />
        <path d="M475 452h151v13H475zM495 465v14m111-14v14" className="launch-pad-platform" />
        <path d="M490 452v-38h11v38m99 0v-38h11v38" className="launch-hold-down" />
        <path d="M95 487h915m-855 14h795" className="launch-ground-marking" />
        <rect x="510" y="455" width="80" height="12" rx="2" className="launch-pad-light" />
      </g>

      <g className="launch-camera-track">
        <g transform="translate(550 448)">
          <g className="launch-vehicle-motion">
            <g className="launch-vehicle-body">
              <g className="launch-upper-stage">
                <path d="M-29-315 0-365l29 50v91h-58z" className="launch-fairing" />
                <path d="M-24-217h48v120h-48z" className="launch-upper-body" />
                <path d="M-24-204h48m-24 0v119" className="launch-body-stripe" />
                <circle cx="0" cy="-184" r="8" className="launch-window" />
                <path d="M-32-275h-18v51l18 13m32-64h18v51l-18 13" className="launch-fairing-seams" />
                <g transform="translate(0 -264)">
                  <SpacecraftPayload components={components} />
                </g>
              </g>
              <g className="launch-first-stage">
                <path d="M-25-96h50v91h-50z" className="launch-lower-body" />
                <path d="M-25-84h50m-25 0v79" className="launch-body-stripe" />
                <path d="M-25-20-43 0h18m50-20L43 0H25" className="launch-fins" />
                <path d="M-14-4h28l-5 24H-9z" className="launch-engine-bell" />
              </g>
              <g className="launch-engine-flames">
                <ellipse cx="0" cy="37" rx="27" ry="48" className="launch-engine-halo" />
                <path d="M-15 13C-42 70-32 128 0 166 32 128 42 70 15 13 10 34 6 46 0 54-6 46-10 34-15 13Z" className="launch-flame-plume" />
                <path d="M-10 14 0 101 10 14 4 25 0 12-4 25z" className="launch-flame-outer" />
                <path d="M-5 17 0 71 5 17 1 25 0 16-1 25z" className="launch-flame-inner" />
              </g>
              <g className="launch-upper-flames">
                <ellipse cx="0" cy="-91" rx="21" ry="34" className="launch-engine-halo" />
                <path d="M-7-84 0-28 7-84 2-75 0-88-2-75z" className="launch-flame-outer" />
              </g>
            </g>
          </g>
        </g>
        <g transform="translate(550 355)" className="launch-detached-stage">
          <g className="launch-detached-stage-motion">
            <path d="M-25-43h50v80h-50z" className="launch-lower-body" />
            <path d="M-25-30h50m-25 0v67" className="launch-body-stripe" />
            <path d="M-25 18-43 38h18m50-20 18 20H25" className="launch-fins" />
            <path d="M-14 37h28l-5 24H-9z" className="launch-engine-bell" />
          </g>
        </g>
      </g>

      <g className="launch-smoke" filter="url(#launch-smoke-blur)" aria-hidden="true">
        <circle cx="498" cy="451" r="24" />
        <circle cx="538" cy="449" r="30" />
        <circle cx="588" cy="452" r="25" />
        <circle cx="463" cy="455" r="18" />
        <circle cx="624" cy="457" r="19" />
        <circle cx="482" cy="430" r="15" />
        <circle cx="610" cy="427" r="17" />
        <circle cx="550" cy="422" r="22" />
        <circle cx="425" cy="450" r="25" />
        <circle cx="675" cy="452" r="28" />
        <circle cx="458" cy="416" r="20" />
        <circle cx="645" cy="414" r="21" />
      </g>

      <g className="launch-fairing-debris">
        <path d="M518 172q-36 37-22 100l21-10z" />
        <path d="M582 172q36 37 22 100l-21-10z" />
      </g>

      <g
        transform="translate(550 285)"
        className={`launch-deployed-spacecraft ${isDestinationOrbit ? "launch-deployed-spacecraft-hidden" : ""}`}
      >
        <g className="launch-deployed-motion">
          <SpacecraftPayload components={components} />
        </g>
      </g>
      <g className={`launch-deployment-pulse ${isDestinationOrbit ? "launch-deployment-pulse-hidden" : ""}`} aria-hidden="true">
        <circle cx="550" cy="285" r="33" />
        <circle cx="550" cy="285" r="52" />
      </g>
      {destination.id !== "earth" && (
        <g className={`launch-destination-orbit launch-destination-${destination.id}`}>
          <circle cx="550" cy="390" r="145" className="launch-destination-body" style={{ fill: destination.accent }} />
          <path d="M412 354q38-45 82-20 27-43 64-14 40-28 77 17-44 27-88 12-61 34-135 5z" className="launch-destination-surface" />
          <ellipse cx="550" cy="390" rx="226" ry="76" className="launch-destination-orbit-ring" />
          <g className="launch-destination-orbiting-spacecraft">
            <animateMotion
              dur="8s"
              repeatCount="indefinite"
              rotate="auto"
              path="M 324 390 a 226 76 0 1 0 452 0 a 226 76 0 1 0 -452 0"
            />
            <path d="M-10-4h20v8h-20zM-25-3h13v6h-13zM12-3h13v6H12z" />
            <circle r="2" />
          </g>
          <text x="550" y="214" className="launch-destination-label" textAnchor="middle">
            {destination.name.toUpperCase()} // SCHEMATIC ORBIT
          </text>
        </g>
      )}
    </svg>
  );
}

function OrbitRoute({ destination, stage }) {
  const isEarth = destination.id === "earth";
  const targetOrbitEstablished = stage === "complete" && !isEarth;

  return (
    <div className={`launch-route-card ${isEarth ? "launch-route-card-earth" : ""}`}>
      <div className="launch-route-heading">
        <span>MISSION ROUTE</span>
        <small>SCHEMATIC · NOT TO SCALE</small>
      </div>
      <svg viewBox="0 0 220 92" role="img" aria-label={`${isEarth ? "Earth orbit" : `Schematic route from Earth to ${destination.name}`}`}>
        <ellipse cx="42" cy="46" rx="25" ry="12" />
        <ellipse cx="42" cy="46" rx="38" ry="20" />
        {!isEarth && <path className="launch-route-arc" d="M51 46C86 4 139 5 177 45" />}
        <circle cx="42" cy="46" r="6" className="launch-route-earth" />
        {!isEarth && <circle cx="178" cy="45" r="5" className="launch-route-target" />}
        {!isEarth && <circle cx="120" cy="24" r="2.5" className="launch-route-craft" />}
      </svg>
      <div className="launch-route-labels">
        <span>EARTH</span>
        <strong>{isEarth ? "REFERENCE ORBIT" : targetOrbitEstablished ? `${destination.name.toUpperCase()} ORBIT` : destination.name.toUpperCase()}</strong>
      </div>
    </div>
  );
}

export default function LaunchSequence({
  active,
  components = [],
  destination,
  mission,
  onContinue,
  onReset,
}) {
  const [stage, setStage] = useState("countdown");
  const [countdown, setCountdown] = useState(10);
  const countdownTimerRef = useRef(null);
  const flightSequence = destination.id === "earth" ? FLIGHT_SEQUENCE : DESTINATION_FLIGHT_SEQUENCE;

  useEffect(() => {
    if (!active) return undefined;

    setStage("countdown");
    setCountdown(10);
    let remaining = 10;
    countdownTimerRef.current = window.setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining === 0) {
        window.clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    }, 1000);

    return () => {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    };
  }, [active]);

  useEffect(() => {
    if (!active) return undefined;

    if (stage === "countdown") {
      if (countdown !== 0) return undefined;
      const timer = window.setTimeout(() => setStage("ignition"), 850);
      return () => window.clearTimeout(timer);
    }

    const currentIndex = flightSequence.findIndex((step) => step.id === stage);
    const nextStep = flightSequence[currentIndex + 1];
    if (!nextStep || stage === "complete") return undefined;

    const timer = window.setTimeout(() => setStage(nextStep.id), flightSequence[currentIndex].duration);
    return () => window.clearTimeout(timer);
  }, [active, countdown, flightSequence, stage]);

  useEffect(() => {
    if (!active) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onReset();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, onReset]);

  if (!active) return null;

  const transferLabel = TRANSFER_LABELS[destination.id] || `${destination.name.toUpperCase()} TRANSFER`;
  const details = stage === "transfer"
    ? {
      ...PHASE_DETAILS.transfer,
      title: `${transferLabel} TO ${destination.name.toUpperCase()}`,
    }
    : stage === "complete" && destination.id !== "earth"
      ? {
        ...PHASE_DETAILS.complete,
        title: `${destination.name.toUpperCase()} ORBIT // SCHEMATIC`,
        description: `The destination-orbit view is illustrative; arrival conditions and orbit insertion are not calculated.`,
        vehicleStage: "TARGET ORBIT SCHEMATIC",
        altitude: "Not modeled",
        speed: "Not modeled",
      }
      : PHASE_DETAILS[stage];
  const stageIndex = flightSequence.findIndex((step) => step.id === stage);
  const progress = stage === "countdown"
    ? ((10 - countdown) / 10) * 18
    : 18 + (stageIndex / (flightSequence.length - 1)) * 82;
  const routeDescription = destination.id === "earth"
    ? "Earth reference orbit · circular · about 400 km"
    : stage === "complete"
      ? `Schematic ${destination.name} orbit · arrival not modeled`
      : stage === "transfer"
        ? `${transferLabel} · schematic · not to scale`
      : `Earth parking orbit · schematic transfer to ${destination.name}`;
  const skipToOrbit = () => {
    window.clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = null;
    setCountdown(0);
    setStage("complete");
  };

  return createPortal(
    <div
      className={`launch-sequence launch-sequence-phase-${stage}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="launch-sequence-title"
    >
      <div className="launch-flight-panel">
        <header className="launch-flight-header">
          <div className="launch-flight-title">
            <span className="launch-flight-kicker">MISSION OPERATIONS // EDUCATIONAL FLIGHT SIM</span>
            <h2 id="launch-sequence-title">{details.title}</h2>
            <p>{details.description}</p>
          </div>
          <div className="launch-flight-identity">
            <span>PATH {mission.level}</span>
            <strong>{destination.name.toUpperCase()}</strong>
            {mission.title && <small>{mission.title}</small>}
          </div>
          <button className="launch-flight-abort" type="button" onClick={onReset}>
            ABORT / RETURN
          </button>
        </header>

        <div className="launch-flight-progress" aria-label={`Flight sequence ${Math.round(progress)}% complete`}>
          <i style={{ width: `${progress}%` }} />
        </div>

        <div className="launch-flight-layout">
          <aside className="launch-flight-hud" aria-label="Launch telemetry">
            <div className="launch-hud-heading">
              <span>FLIGHT TELEMETRY</span>
              <b><i /> {stage === "complete" ? "ORBITAL" : "LIVE"}</b>
            </div>
            <div className="launch-countdown-card" aria-live="assertive">
              <span>{stage === "countdown" ? "T MINUS" : stage === "complete" ? "MISSION STATUS" : "FLIGHT PHASE"}</span>
              <strong className={`launch-countdown-value ${countdown <= 3 && stage === "countdown" ? "launch-countdown-critical" : ""}`}>
                {stage === "countdown" ? `00:${String(countdown).padStart(2, "0")}` : stage === "complete" ? "ORBIT" : details.name.toUpperCase()}
              </strong>
            </div>
            <dl className="launch-telemetry-grid">
              <div><dt>ALTITUDE</dt><dd>{details.altitude}</dd></div>
              <div><dt>SPEED</dt><dd>{details.speed}</dd></div>
              <div><dt>VEHICLE</dt><dd>{details.vehicleStage}</dd></div>
              <div><dt>PAYLOAD</dt><dd>{components.length} systems</dd></div>
            </dl>
            <div className="launch-orbit-readout">
              <span>ORBIT / TRAJECTORY</span>
              <strong>{routeDescription}</strong>
            </div>
            <OrbitRoute destination={destination} stage={stage} />
          </aside>

          <div className="launch-viewport">
            <LaunchVisual components={components} destination={destination} stage={stage} />
            <div className="launch-viewport-readout">
              <span>FLIGHT CAMERA // AUTO-TRACK</span>
              <strong>{details.name.toUpperCase()}</strong>
            </div>
            {stage === "countdown" && (
              <div className={`launch-countdown-overlay ${countdown <= 3 ? "launch-countdown-overlay-critical" : ""}`} aria-hidden="true">
                <span>T MINUS</span>
                <strong key={countdown}>{String(countdown).padStart(2, "0")}</strong>
              </div>
            )}
            {stage === "complete" && (
              <div className="launch-orbit-confirmation" role="status">
                <span>{destination.id === "earth" ? "DEPLOYMENT CONFIRMED" : "DESTINATION VIEW"}</span>
                <strong>{destination.id === "earth" ? "EARTH ORBIT ACHIEVED" : `${destination.name.toUpperCase()} ORBIT // SCHEMATIC`}</strong>
              </div>
            )}
          </div>
        </div>

        <footer className="launch-flight-footer">
          <p>
            Altitude and speed are illustrative Earth-ascent values. Staging and destination orbit are schematic—not a launch-vehicle or trajectory prediction.
          </p>
          <div>
            {stage !== "complete" && (
              <button className="launch-flight-skip" type="button" onClick={skipToOrbit}>
                SKIP TO ORBIT
              </button>
            )}
            {stage === "complete" && (
              <button className="launch-flight-continue" type="button" onClick={onContinue}>
                CONTINUE TO FLIGHT SIMULATION
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
