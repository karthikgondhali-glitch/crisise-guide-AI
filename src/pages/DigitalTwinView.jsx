import React from 'react';
import DigitalTwinCity from '../components/DigitalTwinCity.jsx';
import { Award, ShieldAlert, Sparkles } from 'lucide-react';

export default function DigitalTwinView({ simulation }) {
  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h1 className="text-lg font-bold text-white tracking-wide">
              3D Smart City Digital Twin
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              INTERACTIVE R3F
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time visual simulation of autonomous agent power negotiation, cascading failure dependencies, and disaster dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Judge Mode Ready</span>
          </div>
        </div>
      </div>

      {/* 3D Digital Twin City Canvas */}
      <DigitalTwinCity
        initialScenario={simulation?.scenario || 'Flood'}
      />
    </div>
  );
}
