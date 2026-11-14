import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";

const SOLAR_SYSTEM_PLANETS = [
  { name: "Mercury", color: "#d1d5db", distance: 2.2, radius: 0.22, speed: 0.9, emissive: "#e2e8f0" },
  { name: "Venus", color: "#f7c77d", distance: 3.1, radius: 0.28, speed: 0.72, emissive: "#f9a826" },
  { name: "Earth", color: "#67e8f9", distance: 4.15, radius: 0.32, speed: 0.6, emissive: "#22d3ee" },
  { name: "Mars", color: "#f97316", distance: 5.35, radius: 0.26, speed: 0.52, emissive: "#fb923c" },
  { name: "Jupiter", color: "#fbbf24", distance: 6.8, radius: 0.46, speed: 0.38, emissive: "#f59e0b" },
  { name: "Saturn", color: "#f3d8a0", distance: 8.4, radius: 0.42, speed: 0.28, emissive: "#fef3c7" },
  { name: "Uranus", color: "#7dd3fc", distance: 10.1, radius: 0.35, speed: 0.22, emissive: "#a5f3fc" },
  { name: "Neptune", color: "#60a5fa", distance: 11.8, radius: 0.34, speed: 0.18, emissive: "#93c5fd" },
];

function Satellite({ radius, speed, angle, color }: { radius: number; speed: number; angle: number; color: string }) {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const t = clock.elapsedTime * speed + angle;
    meshRef.current.position.set(
      Math.cos(t) * radius,
      Math.sin(t * 1.8) * 0.45,
      Math.sin(t) * radius,
    );
  });

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[0.14, 22, 22]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.3} />
    </mesh>
  );
}

function SpaceStation({ radius, speed, angle }: { radius: number; speed: number; angle: number }) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.elapsedTime * speed + angle;
    groupRef.current.position.set(Math.cos(t) * radius, Math.sin(t * 1.7) * 0.55, Math.sin(t) * radius);
    groupRef.current.rotation.y = t * 1.5;
    groupRef.current.rotation.z = Math.sin(t * 1.4) * 0.6;
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow>
        <boxGeometry args={[0.42, 0.14, 0.68]} />
        <meshStandardMaterial color="#dbeafe" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.7, 18]} />
        <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={0.85} />
      </mesh>
      <mesh position={[0.35, 0.02, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.6, 18]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.18} />
      </mesh>
      <mesh position={[-0.35, 0.02, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.6, 18]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.18} />
      </mesh>
      <mesh position={[0, 0.15, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.9, 0.04, 0.08]} />
        <meshStandardMaterial color="#a5f3fc" emissive="#67e8f9" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0, 0.15, -0.3]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.9, 0.04, 0.08]} />
        <meshStandardMaterial color="#a5f3fc" emissive="#67e8f9" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

function SolarSystemModel() {
  const groupRef = useRef<Group>(null);
  const ringData = useMemo(
    () => [
      { radius: 2.05, tube: 0.06, rotation: [Math.PI / 2.8, 0, 0], color: "#7dd3fc" },
      { radius: 2.3, tube: 0.04, rotation: [Math.PI / 2.1, 0.6, 0.8], color: "#67e8f9" },
      { radius: 2.6, tube: 0.025, rotation: [Math.PI / 2.5, 0.4, 1.1], color: "#93c5fd" },
      { radius: 2.95, tube: 0.018, rotation: [Math.PI / 1.9, 1.2, 0.2], color: "#c4b5fd" },
    ],
    [],
  );

  const asteroidData = useMemo(
    () =>
      Array.from({ length: 96 }, (_, index) => {
        const angle = (index / 96) * Math.PI * 2;
        const radius = 2.5 + (index % 13) * 0.28;
        return {
          angle,
          radius,
          y: (index % 7) * 0.24 - 0.9,
          scale: 0.07 + (index % 4) * 0.04,
        };
      }),
    [],
  );

  const moonData = useMemo(
    () => [
      { position: [2.9, 0.6, 0.8], scale: 0.18, color: "#f8fafc" },
      { position: [-2.3, -0.9, -1.1], scale: 0.14, color: "#dbeafe" },
      { position: [1.4, -1.7, 1.6], scale: 0.12, color: "#a5f3fc" },
    ],
    [],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.elapsedTime * 0.22;
    groupRef.current.rotation.x = 0.75;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.8} />
      </mesh>

      <mesh scale={[1.3, 1.3, 1.3]}>
        <sphereGeometry args={[1.1, 64, 64]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#67e8f9" emissiveIntensity={0.5} transparent opacity={0.12} />
      </mesh>

      {ringData.map((ring, index) => (
        <mesh key={index} rotation={ring.rotation as [number, number, number]}>
          <torusGeometry args={[ring.radius, ring.tube, 16, 180]} />
          <meshStandardMaterial color={ring.color} emissive={ring.color} emissiveIntensity={1.4} transparent opacity={0.7} />
        </mesh>
      ))}

      {SOLAR_SYSTEM_PLANETS.map((planet, index) => {
        const angle = index * 0.9 + 0.4;
        const x = Math.cos(angle) * planet.distance;
        const z = Math.sin(angle) * planet.distance;

        return (
          <group key={planet.name} position={[x, Math.sin(index * 1.2) * 0.5, z]}>
            <mesh castShadow>
              <sphereGeometry args={[planet.radius, 32, 32]} />
              <meshStandardMaterial color={planet.color} emissive={planet.emissive} emissiveIntensity={0.75} />
            </mesh>
            {planet.name === "Saturn" && (
              <mesh rotation={[Math.PI / 2.5, 0.4, 0.8]}>
                <torusGeometry args={[planet.radius + 0.33, 0.08, 16, 72]} />
                <meshStandardMaterial color="#fef3c7" emissive="#f59e0b" emissiveIntensity={0.7} transparent opacity={0.8} />
              </mesh>
            )}
          </group>
        );
      })}

      {asteroidData.map((item, index) => (
        <mesh
          key={index}
          position={[
            Math.cos(item.angle) * item.radius,
            item.y,
            Math.sin(item.angle) * item.radius,
          ]}
          rotation={[item.angle, item.angle * 1.3, item.angle * 0.7]}
          scale={item.scale}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#dfe7f4" roughness={0.9} metalness={0.3} />
        </mesh>
      ))}

      {moonData.map((moon, index) => (
        <mesh key={index} position={moon.position as [number, number, number]} castShadow>
          <sphereGeometry args={[moon.scale, 24, 24]} />
          <meshStandardMaterial color={moon.color} emissive={moon.color} emissiveIntensity={0.6} />
        </mesh>
      ))}

      <SpaceStation radius={2.9} speed={0.9} angle={0.9} />
      <SpaceStation radius={3.7} speed={0.75} angle={1.7} />
      <Satellite radius={1.95} speed={1.2} angle={0.7} color="#f8fafc" />
      <Satellite radius={2.45} speed={1.55} angle={2.1} color="#7dd3fc" />
      <Satellite radius={3.1} speed={1.9} angle={4.2} color="#a78bfa" />
      <Satellite radius={3.4} speed={1.15} angle={1.3} color="#facc15" />
    </group>
  );
}

export function OrbitalScene() {
  return (
    <div className="orbital-scene">
      <Canvas camera={{ position: [0, 0, 17], fov: 36 }} dpr={[1, 2]}>
        <color attach="background" args={["#020817"]} />
        <fog attach="fog" args={["#020817", 13, 28]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 2, 4]} intensity={1.6} color="#dbeafe" />
        <pointLight position={[-8, 8, 6]} intensity={12} color="#22d3ee" />
        <spotLight position={[0, 10, 14]} angle={0.42} penumbra={0.7} intensity={20} color="#8b5cf6" />
        <Stars radius={60} depth={28} count={3500} factor={4} fade speed={1.2} />
        <Sparkles count={260} scale={[18, 10, 18]} size={2.8} speed={0.8} color="#93c5fd" />
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.8]}>
          <torusGeometry args={[15.5, 0.03, 12, 220]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.18} />
        </mesh>
        <SolarSystemModel />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.7} />
      </Canvas>
    </div>
  );
}
