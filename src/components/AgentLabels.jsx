import React from 'react';
import { Html } from '@react-three/drei';

export default function AgentLabels({
  agents = [],
  gridSupply = 100,
  gridDemand = 120,
  onSelectAgent,
  activeAgentId,
}) {
  return (
    <group name="agent-labels-group">
      {/* Grid Manager Central Agent Label */}
      <Html
        position={[0, 5.5, 0]}
        center
        distanceFactor={32}
        className="pointer-events-auto select-none"
      >
        <button
          type="button"
          onClick={() => onSelectAgent?.('grid')}
          className={`cursor-pointer transition-all duration-300 transform hover:scale-105 text-left rounded-xl p-3 border backdrop-blur-md shadow-2xl ${
            activeAgentId === 'grid'
              ? 'bg-cyan-950/90 border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_25px_rgba(34,211,238,0.6)]'
              : 'bg-neutral-950/85 border-cyan-500/40 hover:border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
          }`}
          style={{ width: '190px' }}
        >
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-base animate-pulse">⚡</span>
              <span className="text-xs font-bold text-cyan-200 tracking-wide uppercase">
                Grid Manager Agent
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              HUB
            </span>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-neutral-300">
              <span>Capacity:</span>
              <span className="font-bold text-cyan-300">{gridSupply} MW</span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span>Grid Load:</span>
              <span className="font-bold text-amber-300">{gridDemand} MW</span>
            </div>
          </div>

          <div className="mt-2 w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                gridSupply >= gridDemand ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              style={{
                width: `${Math.min(100, Math.round((gridSupply / Math.max(1, gridDemand)) * 100))}%`,
              }}
            />
          </div>
        </button>
      </Html>

      {/* Critical Service Agent Labels */}
      {agents.map((agent) => {
        const demand = Number(agent.demand || 0);
        const allocated = Number(agent.allocated || agent.allocated_power || 0);
        const ratio = demand > 0 ? allocated / demand : 1;
        const pct = Math.round(ratio * 100);

        let statusColor = 'emerald';
        let statusBadge = 'SAFE';
        let borderColor = 'border-emerald-500/40';
        let badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';

        if (pct < 70 || (agent.minSafe && allocated < agent.minSafe)) {
          statusColor = 'red';
          statusBadge = 'UNSAFE';
          borderColor = 'border-rose-500/60 animate-pulse';
          badgeBg = 'bg-rose-500/25 text-rose-300 border-rose-400/50';
        } else if (pct < 95) {
          statusColor = 'amber';
          statusBadge = 'REDUCED';
          borderColor = 'border-amber-500/50';
          badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-400/40';
        }

        const isSelected = activeAgentId === agent.id;

        return (
          <Html
            key={agent.id}
            position={agent.labelPosition || [agent.position[0], agent.position[1] + 4, agent.position[2]]}
            center
            distanceFactor={30}
            className="pointer-events-auto select-none"
          >
            <button
              type="button"
              onClick={() => onSelectAgent?.(agent.id)}
              className={`cursor-pointer transition-all duration-300 transform hover:scale-105 text-left rounded-xl p-3 border backdrop-blur-md shadow-2xl ${
                isSelected
                  ? 'bg-neutral-950/95 border-cyan-400 ring-2 ring-cyan-400/60 shadow-[0_0_25px_rgba(34,211,238,0.7)]'
                  : `bg-neutral-950/85 ${borderColor} hover:border-cyan-300 shadow-[0_0_15px_rgba(0,0,0,0.8)]`
              }`}
              style={{ width: '185px' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-base">{agent.icon}</span>
                  <span className="text-xs font-bold text-white tracking-wide truncate">
                    {agent.displayName || agent.name}
                  </span>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeBg}`}
                >
                  {statusBadge}
                </span>
              </div>

              {/* Demand & Allocation Stats */}
              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-neutral-300">
                  <span>Demand:</span>
                  <span className="font-bold text-white">{demand} MW</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Allocated:</span>
                  <span
                    className={`font-bold ${
                      statusColor === 'emerald'
                        ? 'text-emerald-400'
                        : statusColor === 'amber'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {allocated} MW
                  </span>
                </div>
              </div>

              {/* Fulfilled Progress Bar */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      statusColor === 'emerald'
                        ? 'bg-emerald-400'
                        : statusColor === 'amber'
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <span
                  className={`font-mono text-[10px] font-bold ${
                    statusColor === 'emerald'
                      ? 'text-emerald-400'
                      : statusColor === 'amber'
                      ? 'text-amber-300'
                      : 'text-rose-400'
                  }`}
                >
                  {pct}%
                </span>
              </div>
            </button>
          </Html>
        );
      })}
    </group>
  );
}
