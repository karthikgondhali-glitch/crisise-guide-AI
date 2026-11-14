import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function NegotiationAnimation({
  isNegotiating = false,
  activeStep = 0,
  agents = [],
  hospitalDemand = 40,
}) {
  const ringsRef = useRef([]);

  // Negotiation dialogue speeches
  const dialogues = useMemo(() => {
    return {
      hospital:
        hospitalDemand > 45
          ? `I urgently require ${hospitalDemand} units for mass-casualty ICU!`
          : `I require ${hospitalDemand} units for life-support critical care.`,
      water: 'I can temporarily operate with 20 units via pressure throttling.',
      telecom: 'I can reduce demand to 15 units by shedding non-essential cellular cells.',
      emergency: 'Priority remains critical. Direct dispatch channels must stay online.',
      grid: 'Pareto negotiation active. Consensus reached under minimax safety rules.',
    };
  }, [hospitalDemand]);

  // Positions for floating speech bubbles above buildings
  const bubblePositions = {
    hospital: [-9, 9.8, -8],
    water: [-10, 8.0, 9],
    emergency: [9, 8.0, -8],
    telecom: [10, 14.8, 9],
    grid: [0, 8.0, 0],
  };

  // Animated data beam pulses between Grid Hub and agents
  const beamCurves = useMemo(() => {
    const gridPt = new THREE.Vector3(0, 3.5, 0);
    return agents.map((agent) => {
      const targetPt = new THREE.Vector3(
        agent.position[0],
        agent.position[1] + 2.5,
        agent.position[2]
      );
      const midPt = new THREE.Vector3()
        .addVectors(gridPt, targetPt)
        .multiplyScalar(0.5);
      midPt.y += 2.0; // arch overhead
      const curve = new THREE.QuadraticBezierCurve3(gridPt, midPt, targetPt);
      return {
        id: agent.id,
        curve,
        points: curve.getPoints(24),
      };
    });
  }, [agents]);

  // Animated packet particles
  const packetOffsets = useRef([0.1, 0.4, 0.7, 0.9]);

  useFrame((state, delta) => {
    if (!isNegotiating) return;
    for (let i = 0; i < packetOffsets.current.length; i++) {
      packetOffsets.current[i] = (packetOffsets.current[i] + delta * 1.5) % 1;
    }
  });

  if (!isNegotiating) return null;

  return (
    <group name="negotiation-animation-group">
      {/* 1. Animated Negotiation Beams (Cyan Data Waves) */}
      {beamCurves.map((beam, idx) => {
        const lineGeo = new THREE.BufferGeometry().setFromPoints(beam.points);
        return (
          <group key={beam.id}>
            {/* Holographic Cyan Arc Line */}
            {/* @ts-ignore */}
            <line geometry={lineGeo}>
              <lineBasicMaterial
                color="#22d3ee"
                linewidth={3}
                transparent
                opacity={0.8}
              />
            </line>

            {/* Bidirectional Data Packet Orbs */}
            {packetOffsets.current.map((offset, pIdx) => {
              const pt = beam.curve.getPointAt(offset);
              return (
                <mesh key={pIdx} position={pt}>
                  <sphereGeometry args={[0.22, 10, 10]} />
                  <meshBasicMaterial
                    color="#67e8f9"
                    transparent
                    opacity={0.9}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {/* 2. Central Negotiation Ring at Grid Hub */}
      <mesh position={[0, 4.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 2.2, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          side={THREE.DoubleSide}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* 3. Floating Dialogue Speech Bubbles */}
      {/* Hospital Dialogue */}
      <Html
        position={bubblePositions.hospital}
        center
        distanceFactor={28}
        className="pointer-events-none select-none"
      >
        <div className="relative animate-bounce">
          <div className="bg-cyan-950/95 border-2 border-cyan-400 text-cyan-50 px-3.5 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(34,211,238,0.7)] text-xs font-mono max-w-[210px] backdrop-blur-md">
            <div className="font-bold text-rose-400 mb-0.5 flex items-center gap-1">
              <span>🏥 Hospital</span>
              <span className="text-[10px] bg-rose-500/20 px-1 rounded text-rose-300">
                OFFER
              </span>
            </div>
            <p className="text-[11px] leading-snug">"{dialogues.hospital}"</p>
          </div>
          {/* Pointer tail */}
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-cyan-400 mx-auto -mt-0.5" />
        </div>
      </Html>

      {/* Water Dialogue */}
      <Html
        position={bubblePositions.water}
        center
        distanceFactor={28}
        className="pointer-events-none select-none"
      >
        <div className="relative animate-bounce" style={{ animationDelay: '0.2s' }}>
          <div className="bg-cyan-950/95 border-2 border-cyan-400 text-cyan-50 px-3.5 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(34,211,238,0.7)] text-xs font-mono max-w-[210px] backdrop-blur-md">
            <div className="font-bold text-sky-400 mb-0.5 flex items-center gap-1">
              <span>💧 Water Station</span>
              <span className="text-[10px] bg-sky-500/20 px-1 rounded text-sky-300">
                CONCESSION
              </span>
            </div>
            <p className="text-[11px] leading-snug">"{dialogues.water}"</p>
          </div>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-cyan-400 mx-auto -mt-0.5" />
        </div>
      </Html>

      {/* Telecom Dialogue */}
      <Html
        position={bubblePositions.telecom}
        center
        distanceFactor={28}
        className="pointer-events-none select-none"
      >
        <div className="relative animate-bounce" style={{ animationDelay: '0.4s' }}>
          <div className="bg-cyan-950/95 border-2 border-cyan-400 text-cyan-50 px-3.5 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(34,211,238,0.7)] text-xs font-mono max-w-[210px] backdrop-blur-md">
            <div className="font-bold text-violet-400 mb-0.5 flex items-center gap-1">
              <span>📡 Telecom</span>
              <span className="text-[10px] bg-violet-500/20 px-1 rounded text-violet-300">
                OFFER
              </span>
            </div>
            <p className="text-[11px] leading-snug">"{dialogues.telecom}"</p>
          </div>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-cyan-400 mx-auto -mt-0.5" />
        </div>
      </Html>

      {/* Emergency Dialogue */}
      <Html
        position={bubblePositions.emergency}
        center
        distanceFactor={28}
        className="pointer-events-none select-none"
      >
        <div className="relative animate-bounce" style={{ animationDelay: '0.3s' }}>
          <div className="bg-cyan-950/95 border-2 border-cyan-400 text-cyan-50 px-3.5 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(34,211,238,0.7)] text-xs font-mono max-w-[210px] backdrop-blur-md">
            <div className="font-bold text-emerald-400 mb-0.5 flex items-center gap-1">
              <span>🚑 Emergency Center</span>
              <span className="text-[10px] bg-emerald-500/20 px-1 rounded text-emerald-300">
                PRIORITY
              </span>
            </div>
            <p className="text-[11px] leading-snug">"{dialogues.emergency}"</p>
          </div>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-cyan-400 mx-auto -mt-0.5" />
        </div>
      </Html>

      {/* Grid Manager Dialogue */}
      <Html
        position={bubblePositions.grid}
        center
        distanceFactor={28}
        className="pointer-events-none select-none"
      >
        <div className="relative animate-pulse">
          <div className="bg-neutral-950/95 border-2 border-amber-400 text-amber-50 px-3.5 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.8)] text-xs font-mono max-w-[230px] backdrop-blur-md">
            <div className="font-bold text-amber-300 mb-0.5 flex items-center gap-1">
              <span>⚡ Grid Controller</span>
              <span className="text-[10px] bg-amber-500/20 px-1 rounded text-amber-200">
                OPTIMIZER
              </span>
            </div>
            <p className="text-[11px] leading-snug">"{dialogues.grid}"</p>
          </div>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-400 mx-auto -mt-0.5" />
        </div>
      </Html>
    </group>
  );
}
