import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

// ── Drone Body ────────────────────────────────────────────────────────────────
function DroneBody() {
  return (
    <group>
      {/* Main fuselage */}
      <mesh castShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[0.72, 0.18, 0.52]} />
        <meshStandardMaterial color="#1a1d24" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Top aerodynamic dome */}
      <mesh position={[0, 0.17, 0]} castShadow>
        <sphereGeometry args={[0.26, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#1a1d24" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Camera gimbal housing */}
      <mesh position={[0, -0.04, 0.22]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#0f1117" metalness={1} roughness={0.05} />
      </mesh>

      {/* Camera lens */}
      <mesh position={[0, -0.04, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.04, 16]} />
        <meshStandardMaterial color="#050810" metalness={1} roughness={0} />
      </mesh>

      {/* Front LED bar — blue */}
      <mesh position={[0, -0.06, 0.3]}>
        <boxGeometry args={[0.28, 0.018, 0.018]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={4} />
      </mesh>

      {/* Rear LED bar — red */}
      <mesh position={[0, -0.06, -0.3]}>
        <boxGeometry args={[0.28, 0.018, 0.018]} />
        <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={4} />
      </mesh>

      {/* Silver accent strip top */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.74, 0.015, 0.54]} />
        <meshStandardMaterial color="#8a9bb0" metalness={1} roughness={0.1} />
      </mesh>

      {/* Battery compartment bottom */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[0.44, 0.08, 0.3]} />
        <meshStandardMaterial color="#111318" metalness={0.95} roughness={0.15} />
      </mesh>
    </group>
  );
}

// ── Arm + Rotor ───────────────────────────────────────────────────────────────
function Arm({ angle, color }) {
  const rotorRef = useRef();

  useFrame((_, delta) => {
    if (rotorRef.current) rotorRef.current.rotation.y += delta * 28;
  });

  const x = Math.cos(angle) * 0.62;
  const z = Math.sin(angle) * 0.62;

  return (
    <group>
      {/* Arm tube */}
      <mesh position={[x / 2, 0.02, z / 2]} rotation={[0, -angle, 0]}>
        <boxGeometry args={[0.62, 0.045, 0.065]} />
        <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Motor housing cylinder */}
      <mesh position={[x, 0.05, z]}>
        <cylinderGeometry args={[0.085, 0.085, 0.11, 20]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Motor top cap */}
      <mesh position={[x, 0.115, z]}>
        <cylinderGeometry args={[0.07, 0.07, 0.025, 20]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.15} />
      </mesh>

      {/* Spinning rotor blades */}
      <group ref={rotorRef} position={[x, 0.135, z]}>
        {[0, Math.PI / 2].map((r, i) => (
          <mesh key={i} rotation={[0, r, 0]}>
            <boxGeometry args={[0.52, 0.012, 0.065]} />
            <meshStandardMaterial
              color={color} metalness={0.6} roughness={0.2}
              transparent opacity={0.78}
            />
          </mesh>
        ))}
      </group>

      {/* Motor glow point light */}
      <pointLight position={[x, 0.2, z]} color={color} intensity={1.2} distance={1.0} />
    </group>
  );
}

// ── Full Drone ────────────────────────────────────────────────────────────────
function Drone() {
  const droneRef = useRef();
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (!droneRef.current) return;
    droneRef.current.position.y = Math.sin(t.current * 1.1) * 0.13;
    droneRef.current.rotation.x = Math.sin(t.current * 0.7) * 0.055;
    droneRef.current.rotation.z = Math.cos(t.current * 0.85) * 0.04;
    droneRef.current.rotation.y += delta * 0.14;
  });

  const arms = [
    { angle: Math.PI / 4,         color: '#38bdf8' },
    { angle: (3 * Math.PI) / 4,   color: '#818cf8' },
    { angle: (5 * Math.PI) / 4,   color: '#38bdf8' },
    { angle: (7 * Math.PI) / 4,   color: '#818cf8' },
  ];

  return (
    <group ref={droneRef}>
      <DroneBody />
      {arms.map((a, i) => <Arm key={i} angle={a.angle} color={a.color} />)}
    </group>
  );
}

// ── Orbit ring with travelling dot ───────────────────────────────────────────
function TravellingDot({ radius, color, speed }) {
  const ref = useRef();
  const t = useRef(Math.random() * Math.PI * 2);
  useFrame((_, delta) => {
    t.current += delta * speed;
    if (ref.current) {
      ref.current.position.x = Math.cos(t.current) * radius;
      ref.current.position.y = Math.sin(t.current) * radius;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
    </mesh>
  );
}

function OrbitRing({ radius, speed, color, tilt }) {
  const groupRef = useRef();
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.z += delta * speed;
  });

  const geo = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  return (
    <group ref={groupRef} rotation={[tilt, 0, 0]}>
      <line geometry={geo}>
        <lineBasicMaterial color={color} transparent opacity={0.3} />
      </line>
      <TravellingDot radius={radius} color={color} speed={speed * 2.5} />
    </group>
  );
}

// ── Floating data particles ───────────────────────────────────────────────────
function DataParticles() {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(150 * 3);
    for (let i = 0; i < 150; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.025;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#38bdf8" size={0.045} transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

// ── Moving ground grid ────────────────────────────────────────────────────────
function GroundGrid() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.position.z = (ref.current.position.z + delta * 0.35) % 1;
  });
  return (
    <group ref={ref} position={[0, -2.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <gridHelper args={[24, 24, '#1e3a8a', '#172554']} />
    </group>
  );
}

// ── Pulsing altitude beam ─────────────────────────────────────────────────────
function AltitudeBeam() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current)
      ref.current.material.opacity = 0.07 + Math.sin(clock.elapsedTime * 2.2) * 0.05;
  });
  return (
    <mesh ref={ref} position={[0, -1.0, 0]}>
      <cylinderGeometry args={[0.015, 0.45, 2.0, 20, 1, true]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ── Exported scene ────────────────────────────────────────────────────────────
export default function DroneScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.8, 5.0], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 8, 5]} intensity={1.4} color="#e0f2fe" castShadow />
      <pointLight position={[-4, 3, -4]} color="#818cf8" intensity={2} distance={10} />
      <pointLight position={[4, -1, 4]} color="#0ea5e9" intensity={1.2} distance={8} />

      <Stars radius={70} depth={50} count={2500} factor={3} saturation={0.4} fade speed={0.4} />

      <DataParticles />
      <GroundGrid />
      <AltitudeBeam />

      <OrbitRing radius={1.5} speed={0.35} color="#38bdf8" tilt={Math.PI / 6} />
      <OrbitRing radius={2.1} speed={0.22} color="#818cf8" tilt={Math.PI / 3} />
      <OrbitRing radius={2.9} speed={0.13} color="#0ea5e9" tilt={Math.PI / 2.4} />

      <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.25}>
        <Drone />
      </Float>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.7}
        minPolarAngle={Math.PI / 4}
      />
    </Canvas>
  );
}
