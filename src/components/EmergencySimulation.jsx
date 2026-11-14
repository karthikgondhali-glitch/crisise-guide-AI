import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 3D Visual Emergency Beacon (Revolving Siren on buildings)
function SirenBeacon({ position, color = '#ef4444' }) {
  const lightRef = useRef();
  const ringRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (lightRef.current) {
      lightRef.current.intensity = 2.0 + Math.sin(time * 16) * 1.5;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 6;
      ringRef.current.scale.setScalar(1 + Math.sin(time * 8) * 0.2);
    }
  });

  return (
    <group position={position}>
      {/* Red / Blue flashing point light */}
      <pointLight
        ref={lightRef}
        color={color}
        distance={12}
        intensity={2.5}
      />
      {/* Small siren dome */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.3, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Emissive pulse halo */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.6, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function EmergencySimulation({
  isEmergency = false,
  hospitalDemand = 40,
}) {
  const pulseRingRef = useRef();

  useFrame((state, delta) => {
    if (!isEmergency || !pulseRingRef.current) return;
    const time = state.clock.getElapsedTime();
    const scale = (time * 1.5) % 3 + 1;
    pulseRingRef.current.scale.set(scale, scale, 1);
    pulseRingRef.current.material.opacity = Math.max(0, 0.8 - (scale - 1) / 3);
  });

  if (!isEmergency) return null;

  return (
    <group name="emergency-simulation-visuals">
      {/* Siren on Hospital Rooftop */}
      <SirenBeacon position={[-9, 6.2, -8]} color="#ef4444" />
      <SirenBeacon position={[-9.5, 6.2, -7.5]} color="#38bdf8" />

      {/* Siren on Emergency Center Rooftop */}
      <SirenBeacon position={[9, 4.0, -8]} color="#ef4444" />
      <SirenBeacon position={[9.4, 4.0, -8]} color="#38bdf8" />

      {/* Expanding Emergency Radar Ripple from Hospital */}
      <mesh
        ref={pulseRingRef}
        position={[-9, 0.1, -8]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[1.5, 2.2, 32]} />
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
