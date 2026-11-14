import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, RotateCcw, Sliders, CheckCircle2, AlertTriangle } from 'lucide-react';
import ParticleCloakPlate from '../components/ParticleCloakPlate.jsx';

const PRESET_SCENARIOS = {
  Flood: {
    name: 'Flood',
    description:
      'Severe coastal flooding submerges secondary substation transformers. High hospital and water pumping demand.',
    supply: 100,
    hospital: 40,
    water: 30,
    emergency: 20,
    telecom: 30,
  },
  Earthquake: {
    name: 'Earthquake',
    description:
      'Magnitude 7.1 seismic event damages main transmission lines. Surge in trauma care and emergency dispatch.',
    supply: 80,
    hospital: 45,
    water: 35,
    emergency: 30,
    telecom: 25,
  },
  'Power Shortage': {
    name: 'Power Shortage',
    description:
      'Regional generation failure causes severe grid brownout below aggregate minimum safety thresholds.',
    supply: 60,
    hospital: 40,
    water: 30,
    emergency: 20,
    telecom: 30,
  },
  Custom: {
    name: 'Custom',
    description:
      'User-configured disaster simulation parameters for stress-testing autonomous multi-agent negotiation.',
    supply: 95,
    hospital: 42,
    water: 28,
    emergency: 22,
    telecom: 26,
  },
};

export default function Scenario({ simulation, onRunSimulation, loading }) {
  const navigate = useNavigate();
  const [selectedName, setSelectedName] = useState(simulation?.scenario || 'Flood');
  const [form, setForm] = useState({
    supply: 100,
    hospital: 40,
    water: 30,
    emergency: 20,
    telecom: 30,
  });

  useEffect(() => {
    if (simulation) {
      setSelectedName(simulation.scenario || 'Flood');
      const agentsMap = {};
      if (simulation.agents) {
        simulation.agents.forEach((a) => {
          agentsMap[a.name.toLowerCase()] = a.demand;
        });
      }
      setForm({
        supply: simulation.supply ?? 100,
        hospital: agentsMap.hospital ?? 40,
        water: agentsMap.water ?? 30,
        emergency: agentsMap.emergency ?? 20,
        telecom: agentsMap.telecom ?? 30,
      });
    }
  }, [simulation]);

  const handleSelectPreset = (name) => {
    setSelectedName(name);
    const preset = PRESET_SCENARIOS[name] || PRESET_SCENARIOS.Flood;
    setForm({
      supply: preset.supply,
      hospital: preset.hospital,
      water: preset.water,
      emergency: preset.emergency,
      telecom: preset.telecom,
    });
  };

  const handleParamChange = (field, value) => {
    const numVal = Math.max(0, Number(value) || 0);
    setForm((prev) => ({
      ...prev,
      [field]: numVal,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onRunSimulation({
      scenario: selectedName,
      supply: Number(form.supply),
      hospital: Number(form.hospital),
      water: Number(form.water),
      emergency: Number(form.emergency),
      telecom: Number(form.telecom),
    });
    navigate('/results');
  };

  const totalDemand =
    Number(form.hospital) +
    Number(form.water) +
    Number(form.emergency) +
    Number(form.telecom);
  const minSafeSum =
    Math.min(Number(form.hospital), 30) +
    Math.min(Number(form.water), 20) +
    Math.min(Number(form.emergency), 15) +
    Math.min(Number(form.telecom), 15);
  const isFeasible = Number(form.supply) >= minSafeSum;

  return (
    <div className="space-y-6">
      <ParticleCloakPlate
        headline={`Scenario Setup · ${selectedName}`}
        caption={`${form.supply} MW Supply · ${totalDemand} MW Demand · ${minSafeSum} MW Minimum Safe Floor`}
        safe={isFeasible}
        className="min-h-[190px] md:min-h-[210px]"
      />

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(PRESET_SCENARIOS).map((preset) => {
          const isSelected = selectedName === preset.name;
          const presetDemand =
            preset.hospital + preset.water + preset.emergency + preset.telecom;
          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(preset.name)}
              className={`text-left p-5 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between backdrop-blur-sm ${
                isSelected
                  ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.18)]'
                  : 'bg-neutral-950/80 border-cyan-500/20 hover:border-cyan-400/50 text-neutral-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
                    {preset.name}
                  </span>
                  <span className="text-xs font-mono tabular-nums text-cyan-400">
                    {preset.supply} MW Supply
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-cyan-500/15 text-xs font-mono tabular-nums text-neutral-400 flex items-center justify-between">
                <span>Demand: {presetDemand} MW</span>
                <span>
                  Deficit: {Math.max(0, presetDemand - preset.supply)} MW
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Parameter Editor */}
      <form
        onSubmit={handleSubmit}
        className="bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                Configure Grid Supply & Critical Sector Demands ({selectedName})
              </h2>
              <p className="text-xs text-neutral-400">
                Adjust sliders or numeric inputs below before running autonomous multi-agent negotiation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSelectPreset(selectedName)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 hover:bg-neutral-800 border border-cyan-500/20 text-cyan-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Preset Values</span>
          </button>
        </div>

        {/* Supply Input */}
        <div className="p-5 rounded-xl bg-black/75 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="text-sm font-bold text-cyan-200">
                Available Grid Electricity Supply (MW)
              </label>
              <p className="text-xs text-neutral-400">
                Aggregate minimum safe floor across all 4 services is {minSafeSum} MW
              </p>
            </div>
            <input
              type="number"
              min="10"
              max="250"
              value={form.supply}
              onChange={(e) => handleParamChange('supply', e.target.value)}
              className="w-24 px-3 py-1.5 rounded-lg bg-neutral-950 border border-cyan-500/30 text-right font-mono tabular-nums text-sm text-cyan-200 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <input
            type="range"
            min="20"
            max="200"
            value={form.supply}
            onChange={(e) => handleParamChange('supply', e.target.value)}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* 4 Sector Demand Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              key: 'hospital',
              label: 'Hospital Demand (MW)',
              meta: 'Priority 10 · Minimum Safe: 30 MW · Depends on Water',
              minSafe: 30,
            },
            {
              key: 'water',
              label: 'Water Supply Demand (MW)',
              meta: 'Priority 8 · Minimum Safe: 20 MW · Feeds Hospital',
              minSafe: 20,
            },
            {
              key: 'emergency',
              label: 'Emergency Services Demand (MW)',
              meta: 'Priority 9 · Minimum Safe: 15 MW · Depends on Telecom',
              minSafe: 15,
            },
            {
              key: 'telecom',
              label: 'Telecom Network Demand (MW)',
              meta: 'Priority 7 · Minimum Safe: 15 MW · Feeds Emergency',
              minSafe: 15,
            },
          ].map((item) => (
            <div
              key={item.key}
              className="p-4 rounded-xl bg-black/75 border border-cyan-500/20 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-cyan-100">
                    {item.label}
                  </label>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    {item.meta}
                  </div>
                </div>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={form[item.key]}
                  onChange={(e) => handleParamChange(item.key, e.target.value)}
                  className="w-20 px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-cyan-500/30 text-right font-mono tabular-nums text-sm text-cyan-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={form[item.key]}
                onChange={(e) => handleParamChange(item.key, e.target.value)}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          ))}
        </div>

        {/* Pre-flight Feasibility Check & Submit Button */}
        <div className="pt-4 border-t border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            {isFeasible ? (
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="font-mono tabular-nums text-neutral-300">
              Supply: {form.supply} MW · Total Demand: {totalDemand} MW · Min Safe Floor: {minSafeSum} MW —{' '}
              <strong className={isFeasible ? 'text-cyan-400' : 'text-red-400'}>
                {isFeasible
                  ? 'Safe Baseline Feasible'
                  : 'No Safe Allocation Possible (Supply < Min Safe)'}
              </strong>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.28)]"
          >
            <Play className="w-4 h-4" />
            <span>{loading ? 'Running Simulation...' : 'Run Simulation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
