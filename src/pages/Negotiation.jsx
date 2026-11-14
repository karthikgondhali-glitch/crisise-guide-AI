import React from 'react';
import NegotiationTimeline from '../components/NegotiationTimeline.jsx';
import KPISection from '../components/KPISection.jsx';
import ParticleCloakPlate from '../components/ParticleCloakPlate.jsx';

export default function Negotiation({ simulation }) {
  if (!simulation) return null;

  return (
    <div className="space-y-6">
      <ParticleCloakPlate
        headline={`Negotiation Console · ${simulation.scenario}`}
        caption={`score = priority × unmet_demand · ${simulation.status_message}`}
        safe={simulation.safe}
        className="min-h-[190px] md:min-h-[210px]"
      />

      <KPISection simulation={simulation} />

      {/* Agent Utility Scoring Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {simulation.agents?.map((agent) => {
          const initialUnmet = Math.max(0, agent.demand - agent.minimum_safe);
          const initialScore = agent.priority * initialUnmet;
          const finalScore = agent.priority * agent.unmet_demand;
          return (
            <div
              key={agent.name}
              className="bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-bold text-sm bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
                  {agent.name} Agent
                </span>
                <span className="font-mono tabular-nums text-cyan-300">Priority {agent.priority}</span>
              </div>
              <div className="text-xs text-neutral-400 flex items-center justify-between font-mono tabular-nums">
                <span>Request / Min Safe:</span>
                <span className="text-neutral-200">{agent.demand} MW / {agent.minimum_safe} MW</span>
              </div>
              <div className="text-xs text-neutral-400 flex items-center justify-between font-mono tabular-nums">
                <span>Initial Bid Score:</span>
                <span className="text-cyan-400">{initialScore}</span>
              </div>
              <div className="text-xs text-neutral-400 flex items-center justify-between font-mono tabular-nums">
                <span>Final Allocated:</span>
                <span className="text-emerald-400 font-semibold">{agent.allocated_power} MW ({agent.proposal_evaluation})</span>
              </div>
              <div className="text-xs text-neutral-400 flex items-center justify-between font-mono tabular-nums">
                <span>Residual Score:</span>
                <span className="text-sky-300">{finalScore}</span>
              </div>
            </div>
          );
        })}
      </div>

      <NegotiationTimeline logs={simulation.logs || []} autoAnimate={true} />
    </div>
  );
}
