import React from 'react';
import { ArrowRight, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function DependencyPanel({ simulation }) {
  const risks = simulation?.dependency_risks || [];

  return (
    <div className="bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 flex flex-col justify-between">
      <div>
        <div className="pb-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
              Inter-Sector Dependency Graph & Cascading Risks
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Monitors critical coupled links: Telecom → Emergency and Water → Hospital
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-cyan-300">
            2 Coupled Chains
          </span>
        </div>

        <div className="mt-4 space-y-3.5">
          {risks.map((dep) => {
            const isCritical = dep.severity === 'critical';
            const isWarning = dep.severity === 'warning';

            return (
              <div
                key={dep.relationship}
                className={`p-4 rounded-lg border ${
                  isCritical
                    ? 'bg-red-950/35 border-red-800/70'
                    : isWarning
                    ? 'bg-orange-950/30 border-orange-500/40'
                    : 'bg-black/70 border-cyan-500/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span>{dep.source}</span>
                    <ArrowRight className="w-4 h-4 text-neutral-400" />
                    <span>{dep.target}</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 text-xs font-mono tabular-nums font-medium ${
                      isCritical
                        ? 'text-red-400'
                        : isWarning
                        ? 'text-orange-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {isCritical ? (
                      <ShieldAlert className="w-3.5 h-3.5" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    <span>{dep.status}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
                  {dep.message}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
