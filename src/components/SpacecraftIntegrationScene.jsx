import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const COMPONENT_DOCKS = {
  Structure: [[0, 0, -0.55], [0, 0, 0.55]],
  "Solar panels": [[-1.42, 0.02, 0], [1.42, 0.02, 0]],
  Batteries: [[-0.72, -0.55, 0.45], [0.72, -0.55, 0.45]],
  Communication: [[0, 0.9, 0.2], [0, 1.12, -0.25]],
  Computers: [[0.56, -0.1, 0.25]],
  Cameras: [[0, -0.12, 0.65]],
  Spectrometers: [[-0.55, -0.12, 0.45]],
  Radar: [[0.6, 0.32, -0.45]],
  Magnetometers: [[0, 1.18, 0]],
  "Attitude control": [[0.62, -0.62, -0.2]],
  "Fuel systems": [[-0.58, -0.62, -0.2]],
};

const COMPONENT_SLOTS = {
  "light-frame": 1,
  "high-panel": 1,
  "advanced-battery": 1,
  "deep-space-antenna": 1,
};

function getDockPosition(component) {
  const docks = COMPONENT_DOCKS[component.category] || [[0, 0, 0]];
  return docks[COMPONENT_SLOTS[component.id] || 0] || docks[0];
}

function SolarArray() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.05, 0.055, 0.68]} />
        <meshStandardMaterial color="#102b54" metalness={0.38} roughness={0.34} />
      </mesh>
      {[-0.31, 0, 0.31].map((z) => (
        <mesh key={z} position={[0, 0.031, z]}>
          <boxGeometry args={[1.02, 0.012, 0.018]} />
          <meshStandardMaterial color="#9bb6c6" metalness={0.55} roughness={0.28} />
        </mesh>
      ))}
      {[-0.32, 0, 0.32].map((x) => (
        <mesh key={x} position={[x, 0.032, 0]}>
          <boxGeometry args={[0.014, 0.012, 0.65]} />
          <meshStandardMaterial color="#9bb6c6" metalness={0.55} roughness={0.28} />
        </mesh>
      ))}
      {[-0.35, 0.35].map((z) => (
        <mesh key={z} position={[0, 0.025, z]}>
          <boxGeometry args={[1.12, 0.045, 0.035]} />
          <meshStandardMaterial color="#c5cdd1" metalness={0.78} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[0.56, 0, 0]}>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
        <meshStandardMaterial color="#c5cdd1" metalness={0.82} roughness={0.23} />
      </mesh>
    </group>
  );
}

function ComponentHardware({ component }) {
  switch (component.category) {
    case "Structure":
      return (
        <group>
          <RoundedBox args={[0.42, 0.56, 0.38]} radius={0.055} smoothness={3}>
            <meshStandardMaterial color="#e1e4e5" metalness={0.52} roughness={0.36} />
          </RoundedBox>
          {[[-0.22, 0, 0], [0.22, 0, 0], [0, 0.3, 0], [0, -0.3, 0]].map((position, index) => (
            <mesh key={index} position={position}>
              <boxGeometry args={[0.045, 0.045, 0.045]} />
              <meshStandardMaterial color={index === 0 ? "#b4453f" : "#547da0"} metalness={0.35} roughness={0.35} />
            </mesh>
          ))}
        </group>
      );
    case "Solar panels":
      return <SolarArray />;
    case "Batteries":
      return (
        <group>
          <RoundedBox args={[0.38, 0.34, 0.32]} radius={0.04} smoothness={3}>
            <meshStandardMaterial color="#d5d9d8" metalness={0.68} roughness={0.3} />
          </RoundedBox>
          <mesh position={[0, 0.19, 0]}>
            <boxGeometry args={[0.26, 0.035, 0.22]} />
            <meshStandardMaterial color="#a98550" metalness={0.48} roughness={0.38} />
          </mesh>
        </group>
      );
    case "Communication":
      return (
        <group>
          <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.31, 0.09, 0.08, 24, 1, true]} />
            <meshStandardMaterial color="#e2e4e2" metalness={0.88} roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.12, 0.06]}>
            <sphereGeometry args={[0.055, 12, 8]} />
            <meshStandardMaterial color="#ba4c42" metalness={0.3} roughness={0.24} />
          </mesh>
          <mesh position={[0, -0.13, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.36, 8]} />
            <meshStandardMaterial color="#b7bec1" metalness={0.86} roughness={0.22} />
          </mesh>
        </group>
      );
    case "Computers":
    case "Spectrometers":
      return (
        <group>
          <RoundedBox args={[0.34, 0.28, 0.3]} radius={0.035} smoothness={3}>
            <meshStandardMaterial color={component.category === "Computers" ? "#dce0df" : "#c8d0d1"} metalness={0.66} roughness={0.32} />
          </RoundedBox>
          {[-0.11, 0, 0.11].map((x) => (
            <mesh key={x} position={[x, 0, 0.16]}>
              <boxGeometry args={[0.035, 0.12, 0.018]} />
              <meshStandardMaterial color={x === 0 ? "#b4453f" : "#557fa1"} metalness={0.38} roughness={0.32} />
            </mesh>
          ))}
        </group>
      );
    case "Cameras":
    case "Radar":
      return (
        <group>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.14, 0.34, 20]} />
            <meshStandardMaterial color="#bdc7ca" metalness={0.82} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0, 0.19]}>
            <circleGeometry args={[0.15, 24]} />
            <meshStandardMaterial color={component.category === "Radar" ? "#56b9cb" : "#18283c"} emissive={component.category === "Cameras" ? "#174a71" : "#113b4a"} emissiveIntensity={0.48} />
          </mesh>
          <mesh position={[0, -0.24, 0]}>
            <boxGeometry args={[0.28, 0.12, 0.25]} />
            <meshStandardMaterial color="#e0e3e1" metalness={0.62} roughness={0.3} />
          </mesh>
        </group>
      );
    case "Magnetometers":
      return (
        <group>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 1.05, 8]} />
            <meshStandardMaterial color="#d0dbe1" metalness={0.84} roughness={0.22} />
          </mesh>
          {[-0.5, 0.5].map((x) => (
            <mesh key={x} position={[x, 0, 0]}>
              <sphereGeometry args={[0.09, 12, 8]} />
              <meshStandardMaterial color="#b89258" metalness={0.55} roughness={0.32} />
            </mesh>
          ))}
        </group>
      );
    case "Attitude control":
      return (
        <group>
          <RoundedBox args={[0.38, 0.34, 0.34]} radius={0.04} smoothness={3}>
            <meshStandardMaterial color="#d4d9d9" metalness={0.72} roughness={0.28} />
          </RoundedBox>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.26, -0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
              <coneGeometry args={[0.075, 0.24, 10]} />
              <meshStandardMaterial color="#a98451" metalness={0.72} roughness={0.28} />
            </mesh>
          ))}
        </group>
      );
    case "Fuel systems":
      return (
        <group>
          <mesh>
            <cylinderGeometry args={[0.17, 0.17, 0.62, 16]} />
            <meshStandardMaterial color="#c2ccd1" metalness={0.68} roughness={0.28} />
          </mesh>
          {[-0.22, 0.22].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <torusGeometry args={[0.17, 0.028, 8, 18]} />
              <meshStandardMaterial color="#557fa1" metalness={0.62} roughness={0.26} />
            </mesh>
          ))}
        </group>
      );
    default:
      return (
        <mesh>
          <boxGeometry args={[0.36, 0.36, 0.36]} />
          <meshStandardMaterial color="#9eacb5" metalness={0.65} roughness={0.3} />
        </mesh>
      );
  }
}

function HardwareAndMount({ component }) {
  return (
    <>
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.2, 8]} />
        <meshStandardMaterial color="#899ca8" metalness={0.78} roughness={0.25} />
      </mesh>
      <ComponentHardware component={component} />
    </>
  );
}

function InstalledHardware({ component }) {
  const position = getDockPosition(component);
  return (
    <group position={position} rotation={[0, component.category === "Solar panels" && COMPONENT_SLOTS[component.id] === 1 ? Math.PI : 0, 0]}>
      <HardwareAndMount component={component} />
    </group>
  );
}

function AnimatedHardware({ event, onComplete, duration }) {
  const groupRef = useRef(null);
  const elapsedRef = useRef(0);
  const completedRef = useRef(false);
  const dock = getDockPosition(event.component);
  const start = event.action === "add" ? [3.2, 2.1, 2.1] : dock;
  const end = event.action === "add" ? dock : [3.2, 2.1, 2.1];

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    elapsedRef.current += delta;
    const progress = THREE.MathUtils.clamp(elapsedRef.current / duration, 0, 1);
    const eased = progress * progress * (3 - 2 * progress);
    groupRef.current.position.set(
      THREE.MathUtils.lerp(start[0], end[0], eased),
      THREE.MathUtils.lerp(start[1], end[1], eased) + Math.sin(progress * Math.PI) * 0.38,
      THREE.MathUtils.lerp(start[2], end[2], eased),
    );
    groupRef.current.rotation.set(
      THREE.MathUtils.lerp(event.action === "add" ? -0.45 : 0, event.action === "add" ? 0 : 0.45, eased),
      THREE.MathUtils.lerp(0.65, 0, eased),
      THREE.MathUtils.lerp(event.action === "add" ? 0.35 : 0, event.action === "add" ? 0 : 0.35, eased),
    );

    if (progress === 1 && !completedRef.current) {
      completedRef.current = true;
      onComplete(event.eventId);
    }
  });

  return (
    <group ref={groupRef} position={start} scale={1.04}>
      <mesh>
        <sphereGeometry args={[0.72, 20, 16]} />
        <meshBasicMaterial color={event.action === "add" ? "#67e8ff" : "#ffbd76"} transparent opacity={0.11} />
      </mesh>
      <group rotation={[0, event.component.category === "Solar panels" && COMPONENT_SLOTS[event.component.id] === 1 ? Math.PI : 0, 0]}>
        <HardwareAndMount component={event.component} />
      </group>
    </group>
  );
}

function SpacecraftModel({ components, event, onComplete, duration, reducedMotion }) {
  const craftRef = useRef(null);
  const armJointRef = useRef(null);
  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    elapsedRef.current += delta;
    if (craftRef.current && !reducedMotion) {
      craftRef.current.position.y = Math.sin(elapsedRef.current * 0.8) * 0.025;
      craftRef.current.rotation.y = Math.sin(elapsedRef.current * 0.24) * 0.035;
    } else if (craftRef.current) {
      craftRef.current.position.y = 0;
      craftRef.current.rotation.y = 0;
    }
    if (armJointRef.current) {
      const target = event ? -0.22 : 0.08;
      armJointRef.current.rotation.z = THREE.MathUtils.damp(armJointRef.current.rotation.z, target, 2.8, delta);
    }
  });

  const visibleComponents = event?.action === "add"
    ? components.filter((component) => component.id !== event.component.id)
    : components;

  return (
    <>
      <group ref={craftRef}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.45, 0.51, 1.38, 14]} />
          <meshStandardMaterial color="#e5e8e7" metalness={0.64} roughness={0.32} />
        </mesh>
        <mesh position={[0, 0.76, 0]}>
          <coneGeometry args={[0.45, 0.3, 14]} />
          <meshStandardMaterial color="#f0f1ee" metalness={0.58} roughness={0.28} />
        </mesh>
        <mesh position={[0, -0.78, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.31, 0.3, 12]} />
          <meshStandardMaterial color="#9ca7ab" metalness={0.82} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.49, 0]}>
          <torusGeometry args={[0.46, 0.024, 8, 24]} />
          <meshStandardMaterial color="#b44740" metalness={0.38} roughness={0.36} />
        </mesh>
        <mesh position={[0, -0.49, 0]}>
          <torusGeometry args={[0.49, 0.028, 8, 24]} />
          <meshStandardMaterial color="#b9c1c3" metalness={0.86} roughness={0.22} />
        </mesh>
        <mesh position={[0, -0.76, 0]}>
          <torusGeometry args={[0.33, 0.035, 8, 20]} />
          <meshStandardMaterial color="#b28d5a" metalness={0.72} roughness={0.28} />
        </mesh>
        <mesh position={[0.28, -0.02, -0.36]} rotation={[0, -0.42, 0]}>
          <boxGeometry args={[0.12, 0.62, 0.08]} />
          <meshStandardMaterial color="#a98451" metalness={0.32} roughness={0.5} />
        </mesh>
        <mesh position={[-0.28, -0.02, -0.36]} rotation={[0, 0.42, 0]}>
          <boxGeometry args={[0.12, 0.62, 0.08]} />
          <meshStandardMaterial color="#a98451" metalness={0.32} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.22, 0.49]}>
          <sphereGeometry args={[0.19, 18, 14]} />
          <meshStandardMaterial color="#183c60" emissive="#17334c" emissiveIntensity={0.24} metalness={0.48} roughness={0.16} />
        </mesh>
        <mesh position={[0, 0.22, 0.51]}>
          <torusGeometry args={[0.2, 0.026, 8, 24]} />
          <meshStandardMaterial color="#c4ccce" metalness={0.86} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.56, 0]}>
          <cylinderGeometry args={[0.17, 0.25, 0.12, 12]} />
          <meshStandardMaterial color="#a8b1b2" metalness={0.88} roughness={0.22} />
        </mesh>
        {visibleComponents.map((component) => (
          <InstalledHardware key={component.id} component={component} />
        ))}
        {event && (
          <AnimatedHardware
            key={event.eventId}
            event={event}
            duration={duration}
            onComplete={onComplete}
          />
        )}
      </group>
      <group position={[2.75, -0.95, -0.3]}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.32, 0.38, 0.2, 20]} />
          <meshStandardMaterial color="#a8b2b5" metalness={0.84} roughness={0.24} />
        </mesh>
        <mesh position={[0, 0.64, 0]}>
          <cylinderGeometry args={[0.14, 0.17, 0.92, 12]} />
          <meshStandardMaterial color="#d5d9d8" metalness={0.82} roughness={0.22} />
        </mesh>
        <group ref={armJointRef} position={[0, 1.14, 0]}>
          <mesh position={[-0.62, 0, 0]}>
            <boxGeometry args={[1.36, 0.12, 0.14]} />
            <meshStandardMaterial color="#e0e3e1" metalness={0.84} roughness={0.22} />
          </mesh>
          <mesh position={[-1.3, -0.08, 0]}>
            <boxGeometry args={[0.1, 0.22, 0.3]} />
            <meshStandardMaterial color="#547fa2" metalness={0.56} roughness={0.28} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[-1.34, -0.2, side * 0.13]}>
              <boxGeometry args={[0.08, 0.2, 0.055]} />
              <meshStandardMaterial color={side === -1 ? "#b74740" : "#cdd3d3"} metalness={0.76} roughness={0.23} />
            </mesh>
          ))}
          <mesh position={[-0.08, 0, 0]}>
            <sphereGeometry args={[0.17, 14, 10]} />
            <meshStandardMaterial color="#6687a0" metalness={0.58} roughness={0.25} />
          </mesh>
        </group>
      </group>
    </>
  );
}

function CameraNavigation({ viewCommand, reducedMotion }) {
  const controlsRef = useRef(null);
  const { camera } = useThree();

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls || !viewCommand) return;

    switch (viewCommand.action) {
      case "left":
        controls.setAzimuthalAngle(controls.getAzimuthalAngle() + Math.PI / 14);
        break;
      case "right":
        controls.setAzimuthalAngle(controls.getAzimuthalAngle() - Math.PI / 14);
        break;
      case "up":
        controls.setPolarAngle(controls.getPolarAngle() - Math.PI / 14);
        break;
      case "down":
        controls.setPolarAngle(controls.getPolarAngle() + Math.PI / 14);
        break;
      case "zoom-in":
        controls.dollyIn(1.25);
        break;
      case "zoom-out":
        controls.dollyOut(1.25);
        break;
      case "reset":
        controls.target.set(0.3, 0, 0);
        camera.position.set(5.4, 3.2, 6.4);
        camera.zoom = 1;
        camera.updateProjectionMatrix();
        break;
      default:
        return;
    }

    controls.update();
  }, [camera, viewCommand]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      minDistance={4.5}
      maxDistance={12}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI - 0.12}
      autoRotate={!reducedMotion}
      autoRotateSpeed={0.32}
      target={[0.3, 0, 0]}
    />
  );
}

function CleanroomScene({ components, event, onComplete, reducedMotion, viewCommand }) {
  const duration = reducedMotion ? 0.2 : 1.55;

  return (
    <>
      <color attach="background" args={["#091725"]} />
      <fog attach="fog" args={["#091725", 8, 17]} />
      <ambientLight intensity={0.88} />
      <hemisphereLight args={["#f0f4f4", "#273541", 1.05]} />
      <directionalLight position={[4, 7, 5]} intensity={2.4} color="#fff4dd" />
      <pointLight position={[-4, 2, 1]} intensity={1.15} color="#94b7d0" />
      <pointLight position={[2, 3, -4]} intensity={1.3} color="#f0d7b3" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.78, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#1a2731" metalness={0.5} roughness={0.48} />
      </mesh>
      <gridHelper args={[18, 24, "#5c7483", "#344652"]} position={[0, -1.765, 0]} />
      <ContactShadows position={[0, -1.74, 0]} opacity={0.42} scale={9} blur={2.8} far={4} />
      <SpacecraftModel components={components} event={event} onComplete={onComplete} duration={duration} reducedMotion={reducedMotion} />
      <CameraNavigation viewCommand={viewCommand} reducedMotion={reducedMotion} />
    </>
  );
}

export default function SpacecraftIntegrationScene({ components, event, onComplete }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [viewCommand, setViewCommand] = useState(null);
  const viewSequenceRef = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener?.("change", updatePreference);
    return () => mediaQuery.removeEventListener?.("change", updatePreference);
  }, []);

  const navigateView = (action) => {
    setViewCommand({ action, sequence: viewSequenceRef.current++ });
  };

  return (
    <>
      <Canvas
        camera={{ position: [5.4, 3.2, 6.4], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        aria-label="Interactive 3D spacecraft integration bay"
        fallback={<div className="integration-scene-fallback">3D preview is unavailable in this browser.</div>}
      >
        <CleanroomScene
          components={components}
          event={event}
          onComplete={onComplete}
          reducedMotion={reducedMotion}
          viewCommand={viewCommand}
        />
      </Canvas>
      <div className="integration-view-controls" role="group" aria-label="Spacecraft camera controls">
        <span>CAMERA</span>
        <div className="integration-camera-pad">
          <button type="button" className="camera-up" aria-label="Look up" title="Look up" onClick={() => navigateView("up")}>↑</button>
          <button type="button" className="camera-left" aria-label="Look left" title="Look left" onClick={() => navigateView("left")}>←</button>
          <button type="button" className="camera-down" aria-label="Look down" title="Look down" onClick={() => navigateView("down")}>↓</button>
          <button type="button" className="camera-right" aria-label="Look right" title="Look right" onClick={() => navigateView("right")}>→</button>
        </div>
        <div className="integration-zoom-controls">
          <button type="button" aria-label="Zoom out" title="Zoom out" onClick={() => navigateView("zoom-out")}>−</button>
          <button type="button" aria-label="Zoom in" title="Zoom in" onClick={() => navigateView("zoom-in")}>+</button>
          <button type="button" aria-label="Reset camera" title="Reset camera" onClick={() => navigateView("reset")}>↺</button>
        </div>
      </div>
    </>
  );
}
