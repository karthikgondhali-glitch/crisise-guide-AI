import React from 'react';
import { motion } from 'motion/react';
import { Zap, Activity, ShieldCheck, ShieldAlert, Server, Flame } from 'lucide-react';

export default function KPISection({ simulation }) {
  if (!simulation) return null;

  const supply = simulation.supply ?? 0;
  const totalDemand = simulation.total_demand ?? 0;
  const scenario = simulation.scenario ?? 'Flood';
  const servicesOnline = simulation.services_online ?? 0;
  const safe = simulation.safe ?? false;
  const deficit = Math.max(0, totalDemand - supply);

  const cards = [
    {
      label: 'Total Supply',
      value: `${supply} MW`,
      subtext: `Utilization ${simulation.utilization_rate ?? 100}% · Min Safe ${simulation.total_minimum_safe ?? 80} MW`,
      icon: Zap,
      accent: 'text-cyan-400',
    },
    {
      label: 'Total Demand',
      value: `${totalDemand} MW`,
      subtext:
        deficit > 0
          ? `Grid Deficit: ${deficit} MW unmet load`
          : 'Grid Surplus: 0 MW unmet load',
      icon: Activity,
      accent: deficit > 0 ? 'text-sky-300' : 'text-cyan-400',
    },
    {
      label: 'Active Scenario',
      value: scenario,
      subtext: '4 Infrastructure Agents Active',
      icon: Flame,
      accent: 'text-cyan-300',
    },
    {
      label: 'Services Online',
      value: `${servicesOnline} / 4`,
      subtext:
        servicesOnline === 4
          ? 'All sectors >= Minimum Safe MW'
          : `${4 - servicesOnline} sector(s) below safety floor`,
      icon: Server,
      accent: servicesOnline === 4 ? 'text-cyan-400' : 'text-red-400',
    },
    {
      label: 'Safety Status',
      value: safe ? 'SAFE' : 'CRITICAL',
      subtext: simulation.status_message || (safe ? 'Safe Allocation Achieved' : 'No Safe Allocation Possible'),
      icon: safe ? ShieldCheck : ShieldAlert,
      accent: safe ? 'text-cyan-400' : 'text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: index * 0.03 }}
            className="bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-xs text-cyan-200/80 font-medium">
              <span>{card.label}</span>
              <Icon className={`w-4 h-4 ${card.accent} shrink-0`} />
            </div>
            <div
              className={`mt-3 text-2xl font-bold font-mono tabular-nums tracking-tight ${
                card.label === 'Safety Status' ? card.accent : 'text-white'
              }`}
            >
              {card.value}
            </div>
            <div className="mt-2 text-xs text-neutral-400 truncate" title={card.subtext}>
              {card.subtext}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
