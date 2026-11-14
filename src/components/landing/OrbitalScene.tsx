import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";

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

function PlanetModel() {
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
      Array.from({ length: 36 }, (_, index) => {
        const angle = (index / 36) * Math.PI * 2;
        const radius = 3.05 + (index % 7) * 0.18;
        return {
          angle,
          radius,
          y: (index % 5) * 0.28 - 0.6,
          scale: 0.08 + (index % 4) * 0.04,
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

    groupRef.current.rotation.y = clock.elapsedTime * 0.45;
    groupRef.current.rotation.x = 0.7;
  });

  return (
    <group ref={groupRef}>
      <Float speed={2.1} rotationIntensity={0.8} floatIntensity={1.2}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1.42, 72, 72]} />
          <meshStandardMaterial
            color="#9ad7ff"
            emissive="#5ec7ff"
            emissiveIntensity={1.7}
            roughness={0.8}
            metalness={0.35}
          />
        </mesh>
      </Float>

      <mesh scale={[1.28, 1.28, 1.28]}>
        <sphereGeometry args={[1.55, 72, 72]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#67e8f9" emissiveIntensity={0.6} transparent opacity={0.2} />
      </mesh>

      {ringData.map((ring, index) => (
        <mesh key={index} rotation={ring.rotation as [number, number, number]}>
          <torusGeometry args={[ring.radius, ring.tube, 16, 180]} />
          <meshStandardMaterial color={ring.color} emissive={ring.color} emissiveIntensity={1.4} transparent opacity={0.78} />
        </mesh>
      ))}

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

      <mesh position={[2.3, 0.6, 0]} castShadow>
        <sphereGeometry args={[0.24, 24, 24]} />
        <meshStandardMaterial color="#f8fafc" emissive="#dbeafe" emissiveIntensity={0.8} />
      </mesh>

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
      <Canvas camera={{ position: [0, 0, 5.7], fov: 42 }} dpr={[1, 2]}>
        <color attach="background" args={["#020817"]} />
        <fog attach="fog" args={["#020817", 4.5, 10]} />
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 2, 4]} intensity={1.6} color="#dbeafe" />
        <pointLight position={[-2, -1, 2]} intensity={18} color="#22d3ee" />
        <spotLight position={[0, 3, 5]} angle={0.4} penumbra={0.7} intensity={16} color="#8b5cf6" />
        <Stars radius={25} depth={18} count={2200} factor={3} fade speed={1.2} />
        <Sparkles count={120} scale={[6, 5, 6]} size={2.8} speed={0.7} color="#93c5fd" />
        <PlanetModel />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
}
