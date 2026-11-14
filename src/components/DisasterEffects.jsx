import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function DisasterEffects({
  scenario = 'Normal',
  isShaking = false,
  shakingIntensity = 0.08,
}) {
  const waterRef = useRef();
  const cracksRef = useRef();
  const sparksRef = useRef();
  const rainRef = useRef();

  // Water level animation for Flood
  const targetWaterY = scenario === 'Flood' ? 0.45 : -2.0;

  useFrame((state, delta) => {
    // 1. Flood water animation
    if (waterRef.current) {
      // Smoothly raise or lower water plane
      waterRef.current.position.y = THREE.MathUtils.lerp(
        waterRef.current.position.y,
        targetWaterY,
        delta * 2.5
      );

      // Subtle water wave undulating ripple
      if (scenario === 'Flood') {
        const time = state.clock.getElapsedTime();
        waterRef.current.rotation.z = Math.sin(time * 0.8) * 0.005;
        waterRef.current.material.opacity = THREE.MathUtils.lerp(
          waterRef.current.material.opacity,
          0.72,
          delta * 2
        );
      } else {
        waterRef.current.material.opacity = THREE.MathUtils.lerp(
          waterRef.current.material.opacity,
          0.0,
          delta * 3
        );
      }
    }

    // 2. Earthquake cracks pulse & shake
    if (cracksRef.current) {
      if (scenario === 'Earthquake' || isShaking) {
        const time = state.clock.getElapsedTime();
        cracksRef.current.visible = true;
        cracksRef.current.scale.setScalar(
          1 + Math.sin(time * 12) * 0.04
        );
      } else {
        cracksRef.current.visible = false;
      }
    }

    // 3. Power Shortage Sparks
    if (sparksRef.current && scenario === 'Power Shortage') {
      const time = state.clock.getElapsedTime();
      sparksRef.current.rotation.y = time * 0.5;
      const positions = sparksRef.current.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= delta * 1.5;
        if (positions[i] < 0) {
          positions[i] = 3.5 + Math.random() * 2;
        }
      }
      sparksRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Generate particle geometry for emergency sparks
  const sparkPoints = useMemo(() => {
    const count = 60;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = Math.random() * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return positions;
  }, []);

  return (
    <group name="disaster-effects-group">
      {/* 1. FLOOD: Rising Cyber-Water Plane */}
      <mesh
        ref={waterRef}
        position={[0, -2.0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[70, 70, 48, 48]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.1}
          metalness={0.8}
          transparent={true}
          opacity={0.0}
          depthWrite={false}
          emissive="#0369a1"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* 2. EARTHQUAKE: Ground Fissures & Fault Lines */}
      <group ref={cracksRef} visible={scenario === 'Earthquake' || isShaking}>
        {/* Main Fault line */}
        <mesh position={[1, 0.03, -2]} rotation={[-Math.PI / 2, 0, 0.4]}>
          <planeGeometry args={[32, 0.7]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={0.85}
          />
        </mesh>
        <mesh position={[-2, 0.03, 3]} rotation={[-Math.PI / 2, 0, -0.6]}>
          <planeGeometry args={[26, 0.5]} />
          <meshBasicMaterial
            color="#f97316"
            transparent
            opacity={0.8}
          />
        </mesh>
        <mesh position={[6, 0.03, 5]} rotation={[-Math.PI / 2, 0, 1.1]}>
          <planeGeometry args={[18, 0.4]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={0.75}
          />
        </mesh>
      </group>

      {/* 3. POWER SHORTAGE: Substation Electrical Arc Sparks */}
      {scenario === 'Power Shortage' && (
        <points ref={sparksRef} position={[0, 1, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={sparkPoints.length / 3}
              array={sparkPoints}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.16}
            color="#38bdf8"
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* Ambient Lighting Override for Power Shortage */}
      {scenario === 'Power Shortage' && (
        <ambientLight intensity={0.12} color="#0c1a2f" />
      )}
      {scenario === 'Flood' && (
        <directionalLight
          position={[-10, 20, -10]}
          intensity={0.6}
          color="#38bdf8"
        />
      )}
      {scenario === 'Earthquake' && (
        <pointLight
          position={[0, 1, 0]}
          intensity={1.2}
          color="#ef4444"
          distance={20}
        />
      )}
    </group>
  );
}
