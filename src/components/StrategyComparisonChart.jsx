import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

export default function StrategyComparisonChart({ comparisonData }) {
  if (!comparisonData || !comparisonData.strategies) return null;

  const strategies = comparisonData.strategies;

  const barData = strategies.map((s) => ({
    name: s.strategy,
    'Overall Score': s.overall_score,
    'Fairness Score': s.fairness_score,
    'Utilization (%)': s.resource_utilization,
  }));

  const byName = Object.fromEntries(strategies.map((s) => [s.strategy, s]));
  const eq = byName['Equal Allocation'] || {};
  const fp = byName['Fixed Priority'] || {};
  const ai = byName['CrisisGrid AI'] || {};

  const radarData = [
    {
      metric: 'Overall Score',
      'Equal Allocation': eq.overall_score ?? 0,
      'Fixed Priority': fp.overall_score ?? 0,
      'CrisisGrid AI': ai.overall_score ?? 0,
    },
    {
      metric: 'Fairness',
      'Equal Allocation': eq.fairness_score ?? 0,
      'Fixed Priority': fp.fairness_score ?? 0,
      'CrisisGrid AI': ai.fairness_score ?? 0,
    },
    {
      metric: 'Utilization',
      'Equal Allocation': eq.resource_utilization ?? 0,
      'Fixed Priority': fp.resource_utilization ?? 0,
      'CrisisGrid AI': ai.resource_utilization ?? 0,
    },
    {
      metric: 'Safety Compliance',
      'Equal Allocation': ((eq.operational_services ?? 0) / 4) * 100,
      'Fixed Priority': ((fp.operational_services ?? 0) / 4) * 100,
      'CrisisGrid AI': ((ai.operational_services ?? 0) / 4) * 100,
    },
    {
      metric: 'Zero-Violation Reliability',
      'Equal Allocation': Math.max(0, 100 - (eq.safety_violations ?? 0) * 30),
      'Fixed Priority': Math.max(0, 100 - (fp.safety_violations ?? 0) * 30),
      'CrisisGrid AI': Math.max(0, 100 - (ai.safety_violations ?? 0) * 30),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <div className="bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
        <div className="pb-4 border-b border-cyan-500/20">
          <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
            Strategy Score & Utilization Benchmark
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Direct comparison of Overall Score, Fairness Index, and Grid Utilization
          </p>
        </div>

        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#12272f" />
              <XAxis
                dataKey="name"
                stroke="#a3a3a3"
                tick={{ fill: '#d4d4d8', fontSize: 12 }}
              />
              <YAxis
                stroke="#a3a3a3"
                tick={{ fill: '#d4d4d8', fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#050a0c',
                  borderColor: '#164e63',
                  borderRadius: '8px',
                  color: '#ecfeff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#d4d4d8' }} />
              <Bar dataKey="Overall Score" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Fairness Score" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Utilization (%)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
        <div className="pb-4 border-b border-cyan-500/20">
          <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
            Multi-Dimensional Resilience Radar
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Evaluates Safety Compliance, Zero-Violation Reliability, Fairness, and Overall Score
          </p>
        </div>

        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
              <PolarGrid stroke="#12272f" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: '#d4d4d8', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: '#737373', fontSize: 10 }}
              />
              <Radar
                name="CrisisGrid AI"
                dataKey="CrisisGrid AI"
                stroke="#22d3ee"
                fill="#22d3ee"
                fillOpacity={0.35}
              />
              <Radar
                name="Fixed Priority"
                dataKey="Fixed Priority"
                stroke="#0ea5e9"
                fill="#0ea5e9"
                fillOpacity={0.22}
              />
              <Radar
                name="Equal Allocation"
                dataKey="Equal Allocation"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#050a0c',
                  borderColor: '#164e63',
                  borderRadius: '8px',
                  color: '#ecfeff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#d4d4d8' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
