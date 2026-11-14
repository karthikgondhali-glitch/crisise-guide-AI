import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// Arc helper for connecting two 3D points with an overhead curve
function createDependencyArc(p1, p2, height = 3.5) {
  const start = new THREE.Vector3(...p1);
  const end = new THREE.Vector3(...p2);
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  mid.y += height;
  return new THREE.QuadraticBezierCurve3(start, mid, end);
}

export default function DependencyGraph({
  agents = [],
  telecomAllocated = 15,
  waterAllocated = 25,
}) {
  // Find current agent objects
  const telecomAgent = agents.find((a) => a.id === 'telecom');
  const emergencyAgent = agents.find((a) => a.id === 'emergency');
  const waterAgent = agents.find((a) => a.id === 'water');
  const hospitalAgent = agents.find((a) => a.id === 'hospital');

  const telPower = telecomAgent ? Number(telecomAgent.allocated ?? telecomAllocated) : telecomAllocated;
  const watPower = waterAgent ? Number(waterAgent.allocated ?? waterAllocated) : waterAllocated;

  // Thresholds
  const isTelecomDegraded = telPower < 20; // Telecom minimum safe is 15-20 MW
  const isWaterDegraded = watPower < 25; // Water minimum safe is 20-25 MW

  // Arc 1: Telecom -> Emergency
  const telecomPos = [10, 5.0, 9];
  const emergencyPos = [9, 2.8, -8];
  const telecomToEmergencyCurve = useMemo(
    () => createDependencyArc(telecomPos, emergencyPos, 4.5),
    []
  );
  const telecomPoints = useMemo(
    () => telecomToEmergencyCurve.getPoints(32),
    [telecomToEmergencyCurve]
  );
  const telecomGeo = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(telecomPoints),
    [telecomPoints]
  );

  // Arc 2: Water -> Hospital
  const waterPos = [-10, 3.0, 9];
  const hospitalPos = [-9, 3.8, -8];
  const waterToHospitalCurve = useMemo(
    () => createDependencyArc(waterPos, hospitalPos, 4.5),
    []
  );
  const waterPoints = useMemo(
    () => waterToHospitalCurve.getPoints(32),
    [waterToHospitalCurve]
  );
  const waterGeo = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(waterPoints),
    [waterPoints]
  );

  return (
    <group name="dependency-graph-group">
      {/* ========================================================
          1. Telecom -> Emergency Dependency Arc
         ======================================================== */}
      {/* @ts-ignore */}
      <line geometry={telecomGeo}>
        <lineBasicMaterial
          color={isTelecomDegraded ? '#ef4444' : '#818cf8'}
          linewidth={2}
          transparent
          opacity={0.7}
        />
      </line>

      {/* Floating Warning over Emergency if Telecom is degraded */}
      {isTelecomDegraded && (
        <Html
          position={[9, 4.5, -8]}
          center
          distanceFactor={26}
          className="pointer-events-none select-none"
        >
          <div className="bg-rose-950/95 border-2 border-rose-500 text-rose-100 px-3 py-2 rounded-xl shadow-[0_0_25px_rgba(239,68,68,0.8)] backdrop-blur-md animate-pulse max-w-[200px]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 mb-0.5">
              <span>⚠ DEPENDENCY STRAIN</span>
            </div>
            <p className="text-[11px] font-mono leading-tight">
              Emergency communication may be degraded (Telecom below threshold)
            </p>
          </div>
        </Html>
      )}

      {/* ========================================================
          2. Water -> Hospital Dependency Arc
         ======================================================== */}
      {/* @ts-ignore */}
      <line geometry={waterGeo}>
        <lineBasicMaterial
          color={isWaterDegraded ? '#ef4444' : '#38bdf8'}
          linewidth={2}
          transparent
          opacity={0.7}
        />
      </line>

      {/* Floating Warning over Hospital if Water is degraded */}
      {isWaterDegraded && (
        <Html
          position={[-9, 5.5, -8]}
          center
          distanceFactor={26}
          className="pointer-events-none select-none"
        >
          <div className="bg-amber-950/95 border-2 border-amber-500 text-amber-100 px-3 py-2 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.8)] backdrop-blur-md animate-pulse max-w-[200px]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-0.5">
              <span>⚠ DEPENDENCY STRAIN</span>
            </div>
            <p className="text-[11px] font-mono leading-tight">
              Hospital operations may be affected (Pumping/cooling loss)
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
