import React from 'react';
import { Lightbulb, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RecommendationPanel({ simulation }) {
  const recommendations = simulation?.recommendations || [];
  const warnings = simulation?.warnings || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Safety Validator Warnings */}
      <div className="bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
        <div className="pb-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
              Safety Validator Diagnostics
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Verifies allocation &gt;= minimum safe floor and aggregate allocation &lt;= supply
            </p>
          </div>
          <span
            className={`text-xs font-mono tabular-nums font-medium ${
              simulation?.safe ? 'text-cyan-400' : 'text-red-400'
            }`}
          >
            {simulation?.safe ? 'ALL CHECKS PASSED' : 'SAFETY VIOLATION'}
          </span>
        </div>

        <div className="mt-4 space-y-2.5">
          {warnings.length === 0 ? (
            <div className="p-4 rounded-lg bg-cyan-950/30 border border-cyan-400/35 flex items-center gap-3 text-xs text-cyan-100">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                All critical services hold power strictly above their minimum safe operating thresholds with comfortable margin.
              </span>
            </div>
          ) : (
            warnings.map((warn, i) => {
              const isSevere =
                warn.includes('Violation') ||
                warn.includes('No Safe Allocation') ||
                warn.includes('CASCADING FAILURE');
              return (
                <div
                  key={i}
                  className={`p-3.5 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 ${
                    isSevere
                      ? 'bg-red-950/35 border-red-800/70 text-red-200'
                      : 'bg-orange-950/30 border-orange-500/40 text-orange-200'
                  }`}
                >
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isSevere ? 'text-red-400' : 'text-orange-400'
                    }`}
                  />
                  <span>{warn}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
        <div className="pb-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
              AI Dispatch Recommendations
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Hospital protection directives, renegotiation triggers, and risk mitigation advice
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-cyan-400">
            {recommendations.length} Directives
          </span>
        </div>

        <div className="mt-4 space-y-2.5">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-black/70 border border-cyan-500/15 text-xs text-neutral-200 leading-relaxed flex items-start gap-3"
            >
              <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono tabular-nums text-cyan-400 mr-1.5">
                  0{idx + 1}.
                </span>
                <span>{rec}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
