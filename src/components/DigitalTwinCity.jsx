import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

import AgentLabels from './AgentLabels.jsx';
import DisasterEffects from './DisasterEffects.jsx';
import PowerFlowSystem from './PowerFlowSystem.jsx';
import NegotiationAnimation from './NegotiationAnimation.jsx';
import DependencyGraph from './DependencyGraph.jsx';
import EmergencySimulation from './EmergencySimulation.jsx';
import ControlPanel from './ControlPanel.jsx';

// ============================================================================
// Low-Poly 3D Smart City Architecture Components
// ============================================================================

// 1. Central Power Grid Control Center (⚡ Grid Manager)
function PowerGridSubstation({ isShortage = false }) {
  const reactorRef = useRef();
  const ringRef = useRef();

  useFrame((state, delta) => {
    if (reactorRef.current) {
      reactorRef.current.rotation.y += delta * 0.8;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 1.2;
      ringRef.current.rotation.y += delta * 0.9;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Substation Base Octagon Fortress */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[2.8, 3.2, 0.8, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Raised Containment Ring */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[2.0, 2.4, 0.4, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Central Fusion Reactor Core */}
      <mesh ref={reactorRef} position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.75, 24, 24]} />
        <meshStandardMaterial
          color={isShortage ? '#f59e0b' : '#38bdf8'}
          emissive={isShortage ? '#d97706' : '#0284c7'}
          emissiveIntensity={isShortage ? 0.8 : 1.8}
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>

      {/* Magnetic Containment Rings */}
      <mesh ref={ringRef} position={[0, 1.8, 0]}>
        <torusGeometry args={[1.2, 0.05, 12, 32]} />
        <meshBasicMaterial
          color={isShortage ? '#f59e0b' : '#38bdf8'}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Transformer Bushing Towers (4 corners) */}
      {[
        [-1.6, 0, -1.6],
        [1.6, 0, -1.6],
        [-1.6, 0, 1.6],
        [1.6, 0, 1.6],
      ].map((pos, idx) => (
        <group key={idx} position={pos}>
          <mesh position={[0, 1.0, 0]}>
            <cylinderGeometry args={[0.2, 0.3, 1.4, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.8, 0]}>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      ))}

      {/* Substation Ground Glow Ring */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.6, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// 2. Hospital Complex Building (🏥 Hospital Agent)
function HospitalComplex() {
  return (
    <group position={[-9, 0, -8]}>
      {/* Main Medical Tower (10 stories) */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[3.4, 5.0, 3.0]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Emergency Trauma Wing */}
      <mesh position={[2.2, 1.2, 0.2]}>
        <boxGeometry args={[2.0, 2.4, 2.4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Rooftop Helipad Pad */}
      <mesh position={[0, 5.05, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 0.1, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>

      {/* Helipad 'H' Marking */}
      <mesh position={[0, 5.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.85, 24]} />
        <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
      </mesh>

      {/* Glowing Red Cross Emblem on Facade */}
      <group position={[0, 3.5, 1.55]}>
        <mesh>
          <boxGeometry args={[0.8, 0.25, 0.05]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.25, 0.8, 0.05]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Medical Floor Windows (Emissive Cyan/Warm) */}
      {[-1.0, 0, 1.0].map((x, xi) =>
        [1.2, 2.2, 3.2, 4.2].map((y, yi) => (
          <mesh key={`${xi}-${yi}`} position={[x, y, 1.52]}>
            <planeGeometry args={[0.5, 0.4]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        ))
      )}

      {/* Ambulance Bay Canopy */}
      <mesh position={[2.2, 0.4, 1.6]}>
        <boxGeometry args={[1.8, 0.1, 1.0]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}

// 3. Water Pump Station (💧 Water Agent)
function WaterPumpStation() {
  const rotorRef = useRef();

  useFrame((state, delta) => {
    if (rotorRef.current) {
      rotorRef.current.rotation.y += delta * 2.0;
    }
  });

  return (
    <group position={[-10, 0, 9]}>
      {/* Primary Pump House */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[3.2, 2.0, 2.6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Twin Water Filtration Reservoirs */}
      <mesh position={[-1.8, 1.6, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 3.2, 16]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.2}
          metalness={0.7}
          emissive="#0369a1"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[1.8, 1.6, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 3.2, 16]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.2}
          metalness={0.7}
          emissive="#0369a1"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* High-Pressure Intake Water Piping */}
      <mesh position={[0, 0.8, 1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 3.6, 12]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} />
      </mesh>

      {/* Roof Turbine Vent */}
      <mesh ref={rotorRef} position={[0, 2.15, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 6]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
    </group>
  );
}

// 4. Emergency Response Center (🚑 Emergency Agent)
function EmergencyResponseCenter() {
  return (
    <group position={[9, 0, -8]}>
      {/* Command Bunker Main Hall */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[3.4, 2.8, 3.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Rooftop Communications Radar Dome */}
      <mesh position={[-0.8, 3.1, -0.6]}>
        <sphereGeometry args={[0.6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
      </mesh>

      {/* Rapid Rescue Dispatch Garage Bays (3 Bay Doors) */}
      {[-1.0, 0, 1.0].map((x, idx) => (
        <mesh key={idx} position={[x, 0.7, 1.62]}>
          <planeGeometry args={[0.8, 1.2]} />
          <meshStandardMaterial color="#f97316" metalness={0.6} />
        </mesh>
      ))}

      {/* Command Center Facade Beacon Strip */}
      <mesh position={[0, 2.5, 1.62]}>
        <planeGeometry args={[2.8, 0.2]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
    </group>
  );
}

// 5. Telecom Lattice Spire Tower (📡 Telecom Agent)
function TelecomTower() {
  const radarRef = useRef();
  const beaconRef = useRef();

  useFrame((state, delta) => {
    if (radarRef.current) {
      radarRef.current.rotation.y += delta * 1.5;
    }
    if (beaconRef.current) {
      const time = state.clock.getElapsedTime();
      beaconRef.current.material.opacity = 0.4 + Math.sin(time * 8) * 0.6;
    }
  });

  return (
    <group position={[10, 0, 9]}>
      {/* Tower Base Shelter Bunker */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[2.2, 1.6, 2.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Lattice Spire Sections */}
      <mesh position={[0, 4.0, 0]}>
        <cylinderGeometry args={[0.15, 0.8, 6.0, 4]} />
        <meshStandardMaterial color="#475569" metalness={0.9} wireframe={true} />
      </mesh>
      <mesh position={[0, 8.5, 0]}>
        <cylinderGeometry args={[0.05, 0.15, 3.5, 4]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} wireframe={true} />
      </mesh>

      {/* Microwave Dish Platforms */}
      <mesh position={[0.4, 5.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.45, 0.45, 0.1, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
      </mesh>
      <mesh position={[-0.4, 6.8, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.35, 0.35, 0.08, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
      </mesh>

      {/* Rotating Parabolic Radar Dish */}
      <group ref={radarRef} position={[0, 9.8, 0]}>
        <mesh rotation={[Math.PI / 6, 0, 0]}>
          <coneGeometry args={[0.5, 0.3, 16, 1, true]} />
          <meshStandardMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Red Aircraft Warning Beacon at Spire Tip */}
      <mesh ref={beaconRef} position={[0, 10.5, 0]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

// 6. Residential & Commercial City Districts
function CityDistricts({ isShortage = false }) {
  // Procedural skyscraper clusters around the city perimeter
  const buildings = useMemo(() => {
    return [
      // North Zone
      { pos: [-4, 0, -14], size: [2.5, 6.5, 2.5], color: '#0f172a' },
      { pos: [3, 0, -14], size: [2.8, 8.2, 2.4], color: '#1e293b' },
      { pos: [0, 0, -16], size: [3.2, 10.0, 3.0], color: '#0f172a' },
      // South Zone
      { pos: [-3, 0, 15], size: [2.4, 7.0, 2.4], color: '#1e293b' },
      { pos: [3, 0, 15], size: [2.6, 9.5, 2.6], color: '#0f172a' },
      { pos: [0, 0, 17], size: [3.0, 7.8, 2.8], color: '#1e293b' },
      // East Zone
      { pos: [15, 0, -3], size: [2.8, 9.0, 2.8], color: '#0f172a' },
      { pos: [16, 0, 3], size: [2.5, 6.8, 2.5], color: '#1e293b' },
      { pos: [14, 0, -13], size: [2.2, 5.5, 2.2], color: '#0f172a' },
      { pos: [15, 0, 13], size: [2.4, 6.0, 2.4], color: '#1e293b' },
      // West Zone
      { pos: [-15, 0, -3], size: [2.6, 8.5, 2.6], color: '#1e293b' },
      { pos: [-16, 0, 3], size: [2.8, 7.2, 2.8], color: '#0f172a' },
      { pos: [-14, 0, -13], size: [2.4, 5.8, 2.4], color: '#0f172a' },
      { pos: [-15, 0, 13], size: [2.5, 6.2, 2.5], color: '#1e293b' },
    ];
  }, []);

  return (
    <group name="residential-commercial-districts">
      {buildings.map((b, i) => (
        <group key={i} position={b.pos}>
          {/* Main Skyscraper Mesh */}
          <mesh position={[0, b.size[1] / 2, 0]}>
            <boxGeometry args={b.size} />
            <meshStandardMaterial
              color={b.color}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>

          {/* Glowing Cyber Window Stripes */}
          <mesh position={[0, b.size[1] / 2, b.size[2] / 2 + 0.02]}>
            <planeGeometry args={[b.size[0] * 0.7, b.size[1] * 0.8]} />
            <meshBasicMaterial
              color={isShortage ? '#f59e0b' : '#38bdf8'}
              transparent
              opacity={isShortage ? 0.25 : 0.65}
            />
          </mesh>

          {/* Rooftop HVAC unit */}
          <mesh position={[0, b.size[1] + 0.2, 0]}>
            <boxGeometry args={[1.0, 0.4, 1.0]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 7. Ground Terrain & Cyber Road Network
function CityGroundAndRoads() {
  return (
    <group name="city-ground-and-roads">
      {/* Dark Hex Base Ground */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[65, 65, 1, 1]} />
        <meshStandardMaterial color="#050814" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Cyber Grid Lines */}
      <gridHelper
        args={[60, 30, '#0284c7', '#0f172a']}
        position={[0, 0.01, 0]}
      />

      {/* Main East-West Asphalt Road */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 3.4]} />
        <meshStandardMaterial color="#090d16" roughness={0.9} />
      </mesh>

      {/* Main North-South Asphalt Road */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[60, 3.4]} />
        <meshStandardMaterial color="#090d16" roughness={0.9} />
      </mesh>

      {/* Outer Ring Road */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[19, 21.5, 32]} />
        <meshStandardMaterial color="#090d16" roughness={0.9} />
      </mesh>

      {/* Neon Road Lane Markings */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[58, 0.08]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[58, 0.08]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// ============================================================================
// Camera Controller for Smooth Transitions
// ============================================================================
function CameraController({ cameraMode = 'overview' }) {
  const controlsRef = useRef();

  // Target camera coordinates and look-at positions
  const targets = {
    overview: { pos: new THREE.Vector3(26, 26, 26), lookAt: new THREE.Vector3(0, 1.5, 0) },
    hospital: { pos: new THREE.Vector3(-16, 9, -15), lookAt: new THREE.Vector3(-9, 3, -8) },
    telecom: { pos: new THREE.Vector3(18, 14, 17), lookAt: new THREE.Vector3(10, 6, 9) },
    emergency: { pos: new THREE.Vector3(17, 7, -15), lookAt: new THREE.Vector3(9, 2.5, -8) },
    'auto-orbit': { pos: null, lookAt: new THREE.Vector3(0, 2, 0) },
  };

  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    if (cameraMode === 'auto-orbit') {
      const time = state.clock.getElapsedTime() * 0.15;
      const radius = 34;
      state.camera.position.x = Math.sin(time) * radius;
      state.camera.position.z = Math.cos(time) * radius;
      state.camera.position.y = 22 + Math.sin(time * 0.5) * 4;
      controlsRef.current.target.set(0, 2, 0);
      controlsRef.current.update();
      return;
    }

    const currentTarget = targets[cameraMode] || targets.overview;
    if (currentTarget && currentTarget.pos) {
      state.camera.position.lerp(currentTarget.pos, delta * 3.0);
      controlsRef.current.target.lerp(currentTarget.lookAt, delta * 3.0);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={true}
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2 - 0.05} // don't go below ground
      minDistance={6}
      maxDistance={65}
    />
  );
}

// ============================================================================
// Main Digital Twin City Scene & State Machine
// ============================================================================
export default function DigitalTwinCity({
  initialScenario = 'Flood',
  onSimulationUpdate,
}) {
  // Scenario & Grid Capacity State
  const [scenario, setScenario] = useState(initialScenario);
  const [cameraMode, setCameraMode] = useState('overview');
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [hospitalDemand, setHospitalDemand] = useState(40);
  const [activeAgentId, setActiveAgentId] = useState(null);

  // Judge Auto Demo State
  const [isAutoDemo, setIsAutoDemo] = useState(false);
  const [autoDemoStep, setAutoDemoStep] = useState(0);

  // Scenario profiles
  const scenarioProfiles = {
    Normal: { supply: 120, hospital: 40, water: 30, emergency: 20, telecom: 30 },
    Flood: { supply: 100, hospital: 40, water: 30, emergency: 20, telecom: 30 },
    Earthquake: { supply: 80, hospital: 45, water: 35, emergency: 30, telecom: 25 },
    'Power Shortage': { supply: 60, hospital: 40, water: 30, emergency: 25, telecom: 20 },
  };

  const currentProfile = scenarioProfiles[scenario] || scenarioProfiles.Flood;
  const gridSupply = currentProfile.supply;

  // Real-time calculated agent allocations based on scenario & emergency state
  const agents = useMemo(() => {
    let hDemand = hospitalDemand;
    let wDemand = currentProfile.water;
    let eDemand = currentProfile.emergency;
    let tDemand = currentProfile.telecom;

    // Minimum safe operational levels
    const hMinSafe = 35;
    const wMinSafe = 20;
    const eMinSafe = 15;
    const tMinSafe = 15;

    let hAllocated = hDemand;
    let wAllocated = wDemand;
    let eAllocated = eDemand;
    let tAllocated = tDemand;

    const totalReq = hDemand + wDemand + eDemand + tDemand;
    const deficit = Math.max(0, totalReq - gridSupply);

    if (deficit > 0) {
      if (isEmergency) {
        // Emergency surge: Hospital takes absolute priority
        hAllocated = Math.min(hDemand, 55);
        eAllocated = Math.min(eDemand, 20);
        // Load shed lower priority nodes
        const remainder = Math.max(0, gridSupply - hAllocated - eAllocated);
        wAllocated = Math.min(wDemand, Math.max(wMinSafe, Math.floor(remainder * 0.6)));
        tAllocated = Math.max(tMinSafe, remainder - wAllocated);
      } else if (scenario === 'Power Shortage') {
        hAllocated = 35;
        eAllocated = 15;
        wAllocated = 20;
        tAllocated = 10; // below safe threshold
      } else if (scenario === 'Earthquake') {
        hAllocated = 40;
        eAllocated = 25;
        wAllocated = 20;
        tAllocated = 15;
      } else {
        // Flood
        hAllocated = 38;
        wAllocated = 25;
        eAllocated = 20;
        tAllocated = 17;
      }
    }

    return [
      {
        id: 'hospital',
        name: 'Hospital',
        displayName: 'Hospital Agent',
        icon: '🏥',
        position: [-9, 0, -8],
        labelPosition: [-9, 6.8, -8],
        demand: hDemand,
        allocated: hAllocated,
        minSafe: hMinSafe,
        role: 'Trauma & ICU Operations',
      },
      {
        id: 'water',
        name: 'Water Station',
        displayName: 'Water Agent',
        icon: '💧',
        position: [-10, 0, 9],
        labelPosition: [-10, 4.8, 9],
        demand: wDemand,
        allocated: wAllocated,
        minSafe: wMinSafe,
        role: 'Pumping & Reservoirs',
      },
      {
        id: 'emergency',
        name: 'Emergency Center',
        displayName: 'Emergency Agent',
        icon: '🚑',
        position: [9, 0, -8],
        labelPosition: [9, 4.8, -8],
        demand: eDemand,
        allocated: eAllocated,
        minSafe: eMinSafe,
        role: 'Rescue Dispatch Bays',
      },
      {
        id: 'telecom',
        name: 'Telecom Spire',
        displayName: 'Telecom Agent',
        icon: '📡',
        position: [10, 0, 9],
        labelPosition: [10, 11.5, 9],
        demand: tDemand,
        allocated: tAllocated,
        minSafe: tMinSafe,
        role: 'Cellular & Dispatch Mesh',
      },
    ];
  }, [scenario, gridSupply, hospitalDemand, isEmergency, currentProfile]);

  const gridDemand = agents.reduce((sum, a) => sum + a.demand, 0);

  // Evaluate cascading dependency warnings
  const warnings = useMemo(() => {
    const list = [];
    const telecom = agents.find((a) => a.id === 'telecom');
    const water = agents.find((a) => a.id === 'water');
    const hospital = agents.find((a) => a.id === 'hospital');

    if (telecom && telecom.allocated < telecom.minSafe) {
      list.push({
        title: 'Emergency Communication Degraded',
        detail: `Telecom allocated ${telecom.allocated} MW < ${telecom.minSafe} MW safe threshold. 911 dispatch mesh operating on emergency battery.`,
      });
    }

    if (water && water.allocated < water.minSafe) {
      list.push({
        title: 'Hospital Sanitation & Chiller Risk',
        detail: `Water station power ${water.allocated} MW < ${water.minSafe} MW. Hospital sterilization and cooling loops compromised.`,
      });
    }

    if (hospital && hospital.allocated < hospital.demand) {
      list.push({
        title: 'Hospital Capacity Restricted',
        detail: `Hospital allocated ${hospital.allocated} MW of ${hospital.demand} MW requested. Auxiliary generator spinning reserves active.`,
      });
    }

    return list;
  }, [agents]);

  // AI Dispatcher Recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    if (isEmergency) {
      recs.push('Enact Emergency Ordinance: Shed 15 MW commercial non-vital load.');
      recs.push('Prioritize Hospital Trauma Core feeders via Substation Breaker 4.');
    }
    if (scenario === 'Flood') {
      recs.push('Protect Water Pump Station substations with mobile cofferdams.');
    }
    if (scenario === 'Earthquake') {
      recs.push('Reroute feeder line B around damaged fault line in sector 3.');
    }
    if (scenario === 'Power Shortage') {
      recs.push('Rotate 30-minute rolling brownouts across residential circuits.');
    }
    return recs;
  }, [isEmergency, scenario]);

  // Real-time Negotiation Protocol Logs
  const [negotiationLogs, setNegotiationLogs] = useState([
    { time: '00:01', sender: 'Grid Hub', message: 'System initialized. Steady-state dispatch active.' },
  ]);

  // Start Negotiation Sequence
  const handleStartNegotiation = useCallback(() => {
    setIsNegotiating(true);
    setNegotiationLogs((prev) => [
      ...prev,
      { time: '00:02', sender: 'Grid Hub', message: 'Triggered multi-agent Pareto negotiation round.' },
      { time: '00:03', sender: 'Hospital', message: `Requested ${hospitalDemand} MW for life support.` },
      { time: '00:04', sender: 'Water Station', message: 'Offered -10 MW concession by pressure regulation.' },
      { time: '00:05', sender: 'Telecom', message: 'Offered -15 MW concession via tower power-saving.' },
      { time: '00:06', sender: 'Grid Hub', message: 'Consensus reached. Rebalancing power flows.' },
    ]);

    setTimeout(() => {
      setIsNegotiating(false);
    }, 4500);
  }, [hospitalDemand]);

  // Trigger Emergency Surge
  const handleTriggerEmergency = useCallback(() => {
    setIsEmergency(true);
    setHospitalDemand(55);
    setCameraMode('hospital');
    handleStartNegotiation();
    setNegotiationLogs((prev) => [
      ...prev,
      {
        time: '00:10',
        sender: 'DISPATCH ALERT',
        message: 'MASS CASUALTY SURGE: Hospital demand increased 40 → 55 MW!',
      },
    ]);
  }, [handleStartNegotiation]);

  // Reset Simulation
  const handleResetSimulation = useCallback(() => {
    setIsEmergency(false);
    setHospitalDemand(40);
    setScenario('Normal');
    setCameraMode('overview');
    setIsNegotiating(false);
    setIsAutoDemo(false);
    setAutoDemoStep(0);
    setNegotiationLogs([
      { time: '00:00', sender: 'Grid Hub', message: 'Simulation reset to baseline state.' },
    ]);
  }, []);

  // 9-Step Judge Auto Demo Walker
  useEffect(() => {
    if (!isAutoDemo) return;

    const timer = setTimeout(() => {
      if (autoDemoStep === 0) {
        // Step 1: Show city overview
        setCameraMode('overview');
        setAutoDemoStep(1);
      } else if (autoDemoStep === 1) {
        // Step 2: Trigger Disaster (Flood)
        setScenario('Flood');
        setAutoDemoStep(2);
      } else if (autoDemoStep === 2) {
        // Step 3: Show power shortage (Earthquake/Shortage)
        setScenario('Earthquake');
        setAutoDemoStep(3);
      } else if (autoDemoStep === 3) {
        // Step 4: Start Negotiation
        handleStartNegotiation();
        setAutoDemoStep(4);
      } else if (autoDemoStep === 4) {
        // Step 5: Allocate Resources
        setCameraMode('telecom');
        setAutoDemoStep(5);
      } else if (autoDemoStep === 5) {
        // Step 6: Show Dependency Warnings
        setCameraMode('emergency');
        setAutoDemoStep(6);
      } else if (autoDemoStep === 6) {
        // Step 7: Trigger Emergency Event (+15 MW)
        handleTriggerEmergency();
        setAutoDemoStep(7);
      } else if (autoDemoStep === 7) {
        // Step 8: Renegotiate
        setAutoDemoStep(8);
      } else if (autoDemoStep === 8) {
        // Step 9: Show final results overview
        setCameraMode('overview');
        setIsAutoDemo(false);
      }
    }, 4500);

    return () => clearTimeout(timer);
  }, [isAutoDemo, autoDemoStep, handleStartNegotiation, handleTriggerEmergency]);

  return (
    <div className="relative w-full h-[85vh] min-h-[600px] bg-neutral-950 rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl">
      {/* 3D R3F Canvas Viewport */}
      <Canvas
        shadows
        camera={{ position: [26, 26, 26], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#040814' }}
      >
        {/* Cyber Atmosphere & Background Stars */}
        <color attach="background" args={['#040814']} />
        <fog attach="fog" args={['#040814', 20, 80]} />
        <Stars radius={80} depth={40} count={1200} factor={3} saturation={0.8} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={scenario === 'Power Shortage' ? 0.25 : 0.65} color="#cbd5e1" />
        <directionalLight
          position={[20, 35, 15]}
          intensity={1.2}
          color="#38bdf8"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[0, 8, 0]} intensity={1.5} color="#00ffcc" distance={25} />

        {/* Camera Controller with Cinematic Lerping */}
        <CameraController cameraMode={cameraMode} />

        {/* City Infrastructure Models */}
        <CityGroundAndRoads />
        <PowerGridSubstation isShortage={scenario === 'Power Shortage'} />
        <HospitalComplex />
        <WaterPumpStation />
        <EmergencyResponseCenter />
        <TelecomTower />
        <CityDistricts isShortage={scenario === 'Power Shortage'} />

        {/* Dynamic Power Lines & Flow Pulses */}
        <PowerFlowSystem agents={agents} gridCenter={[0, 1.8, 0]} />

        {/* Disaster Environmental FX (Water, Cracks, Sparks) */}
        <DisasterEffects scenario={scenario} isShaking={scenario === 'Earthquake'} />

        {/* Multi-Agent Negotiation Data Beams & Floating Dialogues */}
        <NegotiationAnimation
          isNegotiating={isNegotiating}
          agents={agents}
          hospitalDemand={hospitalDemand}
        />

        {/* Cascading Dependency Graph & Real-time Warnings */}
        <DependencyGraph
          agents={agents}
          telecomAllocated={agents.find((a) => a.id === 'telecom')?.allocated ?? 15}
          waterAllocated={agents.find((a) => a.id === 'water')?.allocated ?? 25}
        />

        {/* Emergency Siren Beacons & Radar Pulses */}
        <EmergencySimulation
          isEmergency={isEmergency}
          hospitalDemand={hospitalDemand}
        />

        {/* Floating 3D Holographic Agent Labels */}
        <AgentLabels
          agents={agents}
          gridSupply={gridSupply}
          gridDemand={gridDemand}
          activeAgentId={activeAgentId}
          onSelectAgent={(id) => {
            setActiveAgentId(id);
            if (id === 'hospital') setCameraMode('hospital');
            else if (id === 'telecom') setCameraMode('telecom');
            else if (id === 'emergency') setCameraMode('emergency');
            else setCameraMode('overview');
          }}
        />
      </Canvas>

      {/* Glassmorphic Cyber Command HUD Overlay */}
      <ControlPanel
        scenario={scenario}
        onSelectScenario={(sc) => {
          setScenario(sc);
          handleStartNegotiation();
        }}
        gridSupply={gridSupply}
        gridDemand={gridDemand}
        agents={agents}
        warnings={warnings}
        recommendations={recommendations}
        negotiationLogs={negotiationLogs}
        cameraMode={cameraMode}
        onSelectCamera={setCameraMode}
        isNegotiating={isNegotiating}
        onStartNegotiation={handleStartNegotiation}
        isEmergency={isEmergency}
        onTriggerEmergency={handleTriggerEmergency}
        onResetSimulation={handleResetSimulation}
        isAutoDemo={isAutoDemo}
        autoDemoStep={autoDemoStep}
        onStartAutoDemo={() => {
          setIsAutoDemo(true);
          setAutoDemoStep(0);
        }}
        onStopAutoDemo={() => setIsAutoDemo(false)}
      />

      {/* Quick HUD Watermark Badge */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-cyan-500/30 backdrop-blur-md">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-xs font-mono font-bold tracking-wider text-cyan-200">
          LIVE DIGITAL TWIN · 3D TWIN ENGINE
        </span>
      </div>
    </div>
  );
}
