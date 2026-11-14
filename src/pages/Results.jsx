import React from 'react';
import AllocationTable from '../components/AllocationTable.jsx';
import AllocationPieChart from '../components/AllocationPieChart.jsx';
import DemandVsAllocationChart from '../components/DemandVsAllocationChart.jsx';
import DependencyPanel from '../components/DependencyPanel.jsx';
import RecommendationPanel from '../components/RecommendationPanel.jsx';
import KPISection from '../components/KPISection.jsx';
import ParticleCloakPlate from '../components/ParticleCloakPlate.jsx';

export default function Results({ simulation }) {
  if (!simulation) return null;

  return (
    <div className="space-y-6">
      <ParticleCloakPlate
        headline={`Safety Audit · ${simulation.scenario}`}
        caption={`Supply Utilization ${simulation.utilization_rate}% · ${simulation.safe ? 'SAFE (COMPLIANT)' : 'UNSAFE (DEFICIT)'}`}
        safe={simulation.safe}
        className="min-h-[190px] md:min-h-[210px]"
      />

      <KPISection simulation={simulation} />

      <AllocationTable simulation={simulation} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationPieChart simulation={simulation} />
        <DemandVsAllocationChart simulation={simulation} />
      </div>

      <DependencyPanel simulation={simulation} />

      <RecommendationPanel simulation={simulation} />
    </div>
  );
}
