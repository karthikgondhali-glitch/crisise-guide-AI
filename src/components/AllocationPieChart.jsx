import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

const SECTOR_COLORS = {
  Hospital: '#22d3ee',  // Cyan
  Emergency: '#ef4444', // Red
  Water: '#10b981',     // Emerald
  Telecom: '#0ea5e9',   // Sky
};

export default function AllocationPieChart({ simulation }) {
  if (!simulation || !simulation.allocation) return null;

  const data = Object.entries(simulation.allocation).map(([name, value]) => ({
    name,
    value: Number(value),
  }));

  return (
    <div className="bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 flex flex-col justify-between">
      <div className="pb-4 border-b border-cyan-500/20 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
            Electricity Share by Sector
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Proportional distribution of {simulation.supply} MW available grid supply
          </p>
        </div>
        <span className="text-xs font-mono tabular-nums text-cyan-300">
          {simulation.utilization_rate}% Utilized
        </span>
      </div>

      <div className="h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={95}
              paddingAngle={3}
              label={({ name, value }) => `${name}: ${value} MW`}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={SECTOR_COLORS[entry.name] || '#22d3ee'}
                  stroke="#050505"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#050a0c',
                borderColor: '#164e63',
                borderRadius: '8px',
                color: '#ecfeff',
                fontSize: '12px',
              }}
              formatter={(value) => [`${value} MW`, 'Allocated Power']}
            />
            <Legend
              verticalAlign="bottom"
              height={32}
              wrapperStyle={{ fontSize: '12px', color: '#d4d4d8' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
