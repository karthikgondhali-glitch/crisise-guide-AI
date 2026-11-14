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
} from 'recharts';

export default function DemandVsAllocationChart({ simulation }) {
  if (!simulation || !simulation.agents) return null;

  const data = simulation.agents.map((a) => ({
    name: a.name,
    Demand: a.demand,
    Allocated: a.allocated_power,
    'Min Safe': a.minimum_safe,
  }));

  return (
    <div className="bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 flex flex-col justify-between">
      <div className="pb-4 border-b border-cyan-500/20 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
            Nominal Demand vs. Allocated Power vs. Safety Floor
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Verifies how CrisisGrid AI protects minimum safety baselines while allocating surplus MW
          </p>
        </div>
        <span className="text-xs font-mono tabular-nums text-cyan-300">
          Unit: Megawatts (MW)
        </span>
      </div>

      <div className="h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
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
              unit=" MW"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#050a0c',
                borderColor: '#164e63',
                borderRadius: '8px',
                color: '#ecfeff',
                fontSize: '12px',
              }}
              formatter={(val) => [`${val} MW`]}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#d4d4d8' }} />
            <Bar dataKey="Demand" fill="#52525b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Allocated" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Min Safe" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
