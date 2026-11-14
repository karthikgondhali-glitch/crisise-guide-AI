import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  Scale,
  MessageSquareCode,
  Save,
  Trash2,
  RotateCcw,
  Edit3,
  Check,
} from 'lucide-react';
import KPISection from '../components/KPISection.jsx';
import AllocationTable from '../components/AllocationTable.jsx';
import DemandVsAllocationChart from '../components/DemandVsAllocationChart.jsx';
import AllocationPieChart from '../components/AllocationPieChart.jsx';
import DependencyPanel from '../components/DependencyPanel.jsx';
import RecommendationPanel from '../components/RecommendationPanel.jsx';
import ParticleCloakPlate from '../components/ParticleCloakPlate.jsx';
import DigitalTwinCity from '../components/DigitalTwinCity.jsx';
import { Building2, Sparkles, Layers } from 'lucide-react';

export default function Dashboard({
  simulation,
  scenarios,
  onSelectQuickScenario,
  loading,
  user,
  cloudSimulations = [],
  onSaveSimulation,
  onUpdateCloudNote,
  onDeleteCloudSimulation,
  onRestoreCloudSimulation,
  savingToCloud,
}) {
  const [editingId, setEditingId] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [show3dTwin, setShow3dTwin] = useState(true);

  if (!simulation) {
    return (
      <div className="p-8 text-sm text-neutral-400">
        Loading CrisisGrid AI command center state...
      </div>
    );
  }

  const startEditNote = (record) => {
    setEditingId(record.id);
    setNoteInput(record.notes || '');
  };

  const commitEditNote = async (simId) => {
    await onUpdateCloudNote(simId, noteInput);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* 3D vs 2D Hero Mode Bar */}
      <div className="flex items-center justify-between bg-neutral-950/80 border border-cyan-500/20 rounded-xl px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-bold text-white tracking-wide">
            CrisisGrid AI Command Center
          </span>
          <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
            · Low-Poly Multi-Agent Smart City
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShow3dTwin(true)}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              show3dTwin
                ? 'bg-cyan-400 text-black font-bold shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>3D Digital Twin</span>
          </button>
          <button
            type="button"
            onClick={() => setShow3dTwin(false)}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              !show3dTwin
                ? 'bg-cyan-400 text-black font-bold shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D Cloak View</span>
          </button>
        </div>
      </div>

      {/* Hero View: 3D Digital Twin or 2D Particle Cloak */}
      {show3dTwin ? (
        <DigitalTwinCity initialScenario={simulation.scenario} />
      ) : (
        <ParticleCloakPlate
          headline={`${simulation.scenario} Dispatch`}
          caption={`${simulation.supply} MW Supply · ${simulation.total_demand} MW Demand · ${simulation.services_online}/4 Services Online · ${simulation.status_message}`}
          safe={simulation.safe}
        />
      )}

      {/* Quick Scenario Control Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl px-6 py-4">
        <p className="text-xs text-neutral-400">
          Move or touch anywhere across the grid canvas to part the particle field, or switch disaster profiles below.
        </p>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {['Flood', 'Earthquake', 'Power Shortage'].map((name) => {
            const active = simulation.scenario === name;
            return (
              <button
                key={name}
                type="button"
                disabled={loading}
                onClick={() => onSelectQuickScenario(name)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-cyan-400 text-black font-semibold shadow-[0_0_16px_rgba(34,211,238,0.3)]'
                    : 'bg-neutral-900 text-neutral-300 border border-cyan-500/20 hover:bg-neutral-800 hover:text-cyan-200'
                }`}
              >
                {name}
              </button>
            );
          })}
          <Link
            to="/scenario"
            className="px-3.5 py-2 rounded-lg text-xs font-medium bg-neutral-900 hover:bg-neutral-800 border border-cyan-500/20 text-cyan-200 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Configure Custom</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <KPISection simulation={simulation} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DemandVsAllocationChart simulation={simulation} />
        <AllocationPieChart simulation={simulation} />
      </div>

      {/* Allocation Table & Dependency Risks */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <AllocationTable simulation={simulation} />
        </div>
        <div className="xl:col-span-1">
          <DependencyPanel simulation={simulation} />
        </div>
      </div>

      {/* Validator Warnings & Strategic Recommendations */}
      <RecommendationPanel simulation={simulation} />

      {/* Saved Cloud Simulation Ledger (when signed in) */}
      {user && (
        <div className="bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                Saved Simulation History
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Persisted disaster negotiation snapshots for {user.email}
              </p>
            </div>
            <button
              type="button"
              disabled={savingToCloud}
              onClick={onSaveSimulation}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-400 hover:bg-cyan-300 text-black flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingToCloud ? 'Saving...' : 'Save Current Run'}</span>
            </button>
          </div>

          {cloudSimulations.length === 0 ? (
            <div className="p-6 text-xs text-neutral-400">
              No saved simulation runs yet. Click "Save Current Run" to persist the active allocation snapshot.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-cyan-500/20 text-xs text-neutral-400 bg-black/60">
                    <th className="py-3 px-6 font-medium">Scenario</th>
                    <th className="py-3 px-4 font-medium text-right">Supply / Demand</th>
                    <th className="py-3 px-4 font-medium text-right">Allocated (H / W / E / T)</th>
                    <th className="py-3 px-4 font-medium">Safety Outcome</th>
                    <th className="py-3 px-4 font-medium">Operator Notes</th>
                    <th className="py-3 px-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10 text-sm">
                  {cloudSimulations.map((rec) => (
                    <tr key={rec.id} className="hover:bg-cyan-500/5 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-white">
                        {rec.scenario}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs text-neutral-300">
                        {rec.supply} MW / {rec.totalDemand} MW
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs text-cyan-400">
                        {rec.hospitalAllocated} / {rec.waterAllocated} / {rec.emergencyAllocated} / {rec.telecomAllocated} MW
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono tabular-nums">
                        <span className={rec.safe ? 'text-cyan-400' : 'text-red-400'}>
                          {rec.statusMessage}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-neutral-300">
                        {editingId === rec.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              maxLength={300}
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder="Add dispatch note..."
                              className="px-2 py-1 rounded bg-black border border-cyan-500/30 text-xs text-white focus:outline-none focus:border-cyan-400"
                            />
                            <button
                              type="button"
                              onClick={() => commitEditNote(rec.id)}
                              className="p-1 rounded bg-cyan-400 text-black hover:bg-cyan-300 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-xs">
                              {rec.notes || 'No notes'}
                            </span>
                            <button
                              type="button"
                              onClick={() => startEditNote(rec)}
                              className="text-neutral-500 hover:text-cyan-300 cursor-pointer"
                              title="Edit Note"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onRestoreCloudSimulation(rec)}
                            className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-cyan-500/20 text-xs text-cyan-200 flex items-center gap-1 cursor-pointer"
                            title="Re-run this scenario"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Load</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCloudSimulation(rec.id)}
                            className="p-1.5 rounded bg-neutral-900 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 cursor-pointer"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Quick Navigation Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/negotiation"
          className="p-4 rounded-xl bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-400/60 transition-colors flex items-center justify-between"
        >
          <div>
            <div className="text-sm font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              Inspect Agent Negotiation Logs
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              {simulation.logs?.length || 0} protocol rounds recorded
            </div>
          </div>
          <MessageSquareCode className="w-5 h-5 text-cyan-400 shrink-0" />
        </Link>

        <Link
          to="/results"
          className="p-4 rounded-xl bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-400/60 transition-colors flex items-center justify-between"
        >
          <div>
            <div className="text-sm font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              Full Allocation & Safety Audit
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              Supply utilization {simulation.utilization_rate}% · {simulation.warnings?.length || 0} warnings
            </div>
          </div>
          <Play className="w-5 h-5 text-emerald-400 shrink-0" />
        </Link>

        <Link
          to="/comparison"
          className="p-4 rounded-xl bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-400/60 transition-colors flex items-center justify-between"
        >
          <div>
            <div className="text-sm font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              Benchmark Allocation Strategies
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              Compare Equal vs. Fixed Priority vs. CrisisGrid AI
            </div>
          </div>
          <Scale className="w-5 h-5 text-sky-400 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
