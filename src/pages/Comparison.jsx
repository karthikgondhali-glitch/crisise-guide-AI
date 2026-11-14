import React, { useEffect, useState } from 'react';
import { Trophy, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import StrategyComparisonChart from '../components/StrategyComparisonChart.jsx';
import ParticleCloakPlate from '../components/ParticleCloakPlate.jsx';
import { compareStrategies } from '../services/api.js';

export default function Comparison({ simulation }) {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadComparison = async () => {
    setLoading(true);
    try {
      const agentsMap = {};
      simulation?.agents?.forEach((a) => {
        agentsMap[a.name.toLowerCase()] = a.demand;
      });
      const data = await compareStrategies({
        scenario: simulation?.scenario || 'Flood',
        supply: simulation?.supply,
        hospital: agentsMap.hospital,
        water: agentsMap.water,
        emergency: agentsMap.emergency,
        telecom: agentsMap.telecom,
      });
      setComparisonData(data);
    } catch (err) {
      console.error('Failed to load strategy comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparison();
  }, [simulation]);

  if (!comparisonData) {
    return (
      <div className="p-8 text-sm text-neutral-400">
        Computing multi-strategy allocation benchmarks...
      </div>
    );
  }

  const strategies = comparisonData.strategies || [];
  const recommended = comparisonData.recommended_strategy || 'CrisisGrid AI';

  return (
    <div className="space-y-6">
      <ParticleCloakPlate
        headline={`Strategy Benchmark · ${comparisonData.scenario}`}
        caption={`${comparisonData.supply} MW Supply · Equal vs Fixed Priority vs CrisisGrid AI · Recommended: ${recommended}`}
        safe={simulation?.safe ?? true}
        className="min-h-[190px] md:min-h-[210px]"
      />

      {/* Recommended Strategy Banner */}
      <div className="bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-neutral-400">
            Algorithmic Benchmark · Equal Allocation vs. Fixed Priority vs. CrisisGrid AI
          </div>
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent mt-1">
            Allocation Strategy Comparison ({comparisonData.scenario})
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Evaluates Operational Services, Safety Violations, Unmet Demand, Resource Utilization, Fairness Score, and Overall Score on {comparisonData.supply} MW supply.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-400/40 flex items-center gap-3.5 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-cyan-400 flex items-center justify-center text-black shrink-0 shadow-[0_0_16px_rgba(34,211,238,0.35)]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-cyan-300">
              Recommended Strategy
            </div>
            <div className="text-lg font-bold text-white">
              {recommended}
            </div>
            <div className="text-xs text-neutral-300 mt-0.5 max-w-xs">
              {comparisonData.summary}
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Comparison Matrix Table */}
      <div className="bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
              Strategy Performance Matrix
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Side-by-side comparison across all 6 evaluation metrics and sector megawatt allocations
            </p>
          </div>
          <button
            type="button"
            onClick={loadComparison}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 hover:bg-neutral-800 border border-cyan-500/20 text-cyan-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Benchmark</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cyan-500/20 text-xs text-neutral-400 bg-black/60">
                <th className="py-3.5 px-6 font-medium">Strategy</th>
                <th className="py-3.5 px-4 font-medium text-right">Operational Services</th>
                <th className="py-3.5 px-4 font-medium text-right">Safety Violations</th>
                <th className="py-3.5 px-4 font-medium text-right">Unmet Demand</th>
                <th className="py-3.5 px-4 font-medium text-right">Resource Utilization</th>
                <th className="py-3.5 px-4 font-medium text-right">Fairness Score</th>
                <th className="py-3.5 px-4 font-medium text-right">Sector Split (H / W / E / T)</th>
                <th className="py-3.5 px-6 font-medium text-right">Overall Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10 text-sm">
              {strategies.map((s) => {
                const isWinner = s.strategy === recommended;
                const alloc = s.allocation || {};
                return (
                  <tr
                    key={s.strategy}
                    className={
                      isWinner
                        ? 'bg-cyan-950/30 hover:bg-cyan-950/45 transition-colors'
                        : 'hover:bg-cyan-500/5 transition-colors'
                    }
                  >
                    <td className="py-4 px-6 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span>{s.strategy}</span>
                        {isWinner && (
                          <span className="text-xs font-mono text-cyan-400">
                            · Recommended
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-mono tabular-nums">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          s.operational_services === 4
                            ? 'text-cyan-400'
                            : 'text-orange-400'
                        }`}
                      >
                        {s.operational_services === 4 ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        {s.operational_services} / {s.total_services}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono tabular-nums">
                      <span
                        className={
                          s.safety_violations === 0
                            ? 'text-cyan-400 font-medium'
                            : 'text-red-400 font-semibold'
                        }
                      >
                        {s.safety_violations}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono tabular-nums text-neutral-300">
                      {s.unmet_demand} MW
                    </td>
                    <td className="py-4 px-4 text-right font-mono tabular-nums text-neutral-300">
                      {s.resource_utilization}%
                    </td>
                    <td className="py-4 px-4 text-right font-mono tabular-nums text-neutral-300">
                      {s.fairness_score}
                    </td>
                    <td className="py-4 px-4 text-right font-mono tabular-nums text-xs text-neutral-400">
                      {alloc.Hospital ?? 0} / {alloc.Water ?? 0} / {alloc.Emergency ?? 0} / {alloc.Telecom ?? 0} MW
                    </td>
                    <td className="py-4 px-6 text-right font-mono tabular-nums font-bold text-base">
                      <span className={isWinner ? 'text-cyan-400' : 'text-white'}>
                        {s.overall_score}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar Chart & Radar Chart */}
      <StrategyComparisonChart comparisonData={comparisonData} />
    </div>
  );
}
