import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Utility to create a 3D catenary (sagging) curve between start and end
function createPowerLineCurve(start, end, sag = 0.8) {
  const p0 = new THREE.Vector3(...start);
  const p2 = new THREE.Vector3(...end);
  const mid = new THREE.Vector3().addVectors(p0, p2).multiplyScalar(0.5);
  // Lower the midpoint to simulate wire catenary sag
  mid.y -= sag;
  const p1 = mid;
  return new THREE.QuadraticBezierCurve3(p0, p1, p2);
}

// Single animated power line with flowing energy pulses
function AnimatedPowerLine({
  start,
  end,
  status = 'green',
  pulseSpeed = 1.2,
  pulseCount = 4,
}) {
  const curve = useMemo(() => createPowerLineCurve(start, end), [start, end]);
  const points = useMemo(() => curve.getPoints(36), [curve]);
  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  const pulsesRef = useRef([]);

  // Color mapping
  const colorMap = {
    green: { main: '#10b981', pulse: '#34d399', glow: '#059669' },
    yellow: { main: '#f59e0b', pulse: '#fbbf24', glow: '#d97706' },
    red: { main: '#ef4444', pulse: '#f87171', glow: '#dc2626' },
  };

  const colors = colorMap[status] || colorMap.green;

  // Track progress of energy packet pulses along the curve
  const pulseOffsets = useMemo(() => {
    return Array.from({ length: pulseCount }, (_, i) => i / pulseCount);
  }, [pulseCount]);

  useFrame((state, delta) => {
    for (let i = 0; i < pulsesRef.current.length; i++) {
      const mesh = pulsesRef.current[i];
      if (!mesh) continue;
      pulseOffsets[i] = (pulseOffsets[i] + delta * (pulseSpeed * 0.4)) % 1;
      const point = curve.getPointAt(pulseOffsets[i]);
      mesh.position.copy(point);
    }
  });

  return (
    <group>
      {/* Base Wire with Glow */}
      {/* Native line for crisp render */}
      {/* @ts-ignore */}
      <line geometry={lineGeometry}>
        <lineBasicMaterial
          color={colors.glow}
          linewidth={2}
          transparent
          opacity={0.65}
        />
      </line>

      {/* Traveling Energy Pulse Orbs */}
      {pulseOffsets.map((_, idx) => (
        <mesh
          key={idx}
          ref={(el) => (pulsesRef.current[idx] = el)}
        >
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshBasicMaterial
            color={colors.pulse}
            transparent
            opacity={0.95}
          />
        </mesh>
      ))}
    </group>
  );
}

// Low-poly transmission pylon
function TransmissionPylon({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Steel Lattice Mast */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.08, 0.16, 2.4, 4]} />
        <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Crossarm */}
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[1.4, 0.08, 0.12]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Glass Insulators */}
      <mesh position={[-0.6, 2.05, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.2, 6]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <mesh position={[0.6, 2.05, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.2, 6]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
    </group>
  );
}

export default function PowerFlowSystem({
  agents = [],
  gridCenter = [0, 2.2, 0],
}) {
  // Determine color status for each agent
  const getAgentStatus = (agent) => {
    if (!agent) return 'green';
    const demand = Number(agent.demand || 0);
    const allocated = Number(agent.allocated || agent.allocated_power || 0);
    const minSafe = Number(agent.minSafe || 0);
    const pct = demand > 0 ? (allocated / demand) * 100 : 100;

    if (pct < 70 || (minSafe > 0 && allocated < minSafe)) return 'red';
    if (pct < 95) return 'yellow';
    return 'green';
  };

  // Agent target connection points
  const connections = useMemo(() => {
    return agents.map((agent) => {
      // Connect to top of building
      const targetPoint = [
        agent.position[0],
        agent.position[1] + 1.6,
        agent.position[2],
      ];
      const status = getAgentStatus(agent);
      return {
        id: agent.id,
        start: gridCenter,
        end: targetPoint,
        status,
        speed: status === 'green' ? 1.6 : status === 'yellow' ? 1.0 : 0.5,
      };
    });
  }, [agents, gridCenter]);

  // Secondary residential distribution lines
  const residentialConnections = useMemo(() => {
    return [
      { start: gridCenter, end: [0, 1.2, 14], status: 'yellow' },
      { start: gridCenter, end: [-14, 1.2, 0], status: 'yellow' },
      { start: gridCenter, end: [14, 1.2, 0], status: 'green' },
      { start: gridCenter, end: [0, 1.2, -14], status: 'red' },
    ];
  }, [gridCenter]);

  return (
    <group name="power-flow-system">
      {/* Midpoint Pylons */}
      <TransmissionPylon position={[-4.5, 0, -4]} />
      <TransmissionPylon position={[-5, 0, 4.5]} />
      <TransmissionPylon position={[4.5, 0, -4]} />
      <TransmissionPylon position={[5, 0, 4.5]} />

      {/* Main Critical Infrastructure Power Lines */}
      {connections.map((conn) => (
        <AnimatedPowerLine
          key={conn.id}
          start={conn.start}
          end={conn.end}
          status={conn.status}
          pulseSpeed={conn.speed}
          pulseCount={4}
        />
      ))}

      {/* Residential Grid Lines */}
      {residentialConnections.map((conn, idx) => (
        <AnimatedPowerLine
          key={`res-${idx}`}
          start={conn.start}
          end={conn.end}
          status={conn.status}
          pulseSpeed={0.8}
          pulseCount={3}
        />
      ))}
    </group>
  );
}
