import React, { useState } from 'react';
import {
  AlertTriangle,
  Zap,
  Activity,
  Camera,
  Play,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Radio,
  Droplets,
  ShieldAlert,
  Building2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Award,
} from 'lucide-react';

export default function ControlPanel({
  scenario = 'Flood',
  onSelectScenario,
  gridSupply = 100,
  gridDemand = 120,
  agents = [],
  warnings = [],
  recommendations = [],
  negotiationLogs = [],
  cameraMode = 'overview',
  onSelectCamera,
  isNegotiating = false,
  onStartNegotiation,
  isEmergency = false,
  onTriggerEmergency,
  onResetSimulation,
  isAutoDemo = false,
  autoDemoStep = 0,
  onStartAutoDemo,
  onStopAutoDemo,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('status'); // 'status', 'logs', 'recommendations'

  const scenariosList = [
    { id: 'Normal', name: 'Normal Grid', icon: '⚡', desc: 'Full generation capacity available' },
    { id: 'Flood', name: 'Flood', icon: '🌊', desc: 'Substation submerged. Pumping prioritized' },
    { id: 'Earthquake', name: 'Earthquake', icon: '🌋', desc: 'Lines damaged. Trauma care surge' },
    { id: 'Power Shortage', name: 'Power Shortage', icon: '⚠️', desc: 'Severe generation deficit' },
  ];

  const cameraOptions = [
    { id: 'overview', label: 'City Overview', icon: Building2 },
    { id: 'hospital', label: 'Hospital Focus', icon: Activity },
    { id: 'telecom', label: 'Telecom Spire', icon: Radio },
    { id: 'emergency', label: 'Emergency Bunker', icon: ShieldAlert },
    { id: 'auto-orbit', label: 'Auto Orbit Demo', icon: Camera },
  ];

  const autoDemoSteps = [
    'Show City Overview',
    'Trigger Disaster Scenario',
    'Simulate Power Shortage',
    'Initiate Multi-Agent Negotiation',
    'Optimize & Allocate Power',
    'Evaluate Cascading Dependencies',
    'Trigger Emergency Surge (+15 MW)',
    'Autonomous Re-negotiation',
    'Final Consensus & Metrics',
  ];

  return (
    <div
      className={`fixed top-18 right-4 bottom-4 z-40 flex transition-all duration-300 pointer-events-auto ${
        collapsed ? 'translate-x-[calc(100%-48px)]' : 'translate-x-0'
      }`}
    >
      {/* Collapse Toggle Tab */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-12 h-14 bg-neutral-950/90 border border-cyan-500/40 border-r-0 rounded-l-xl flex items-center justify-center text-cyan-300 hover:text-white backdrop-blur-md self-center shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
        title={collapsed ? 'Expand Control Panel' : 'Collapse Control Panel'}
      >
        {collapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      {/* Main Glassmorphic HUD Panel */}
      <div className="w-96 bg-neutral-950/95 border border-cyan-500/30 rounded-2xl p-4 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.9)] backdrop-blur-xl overflow-hidden">
        {/* Header Strip */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-xs">
              CG
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Digital Twin Command
              </h2>
              <span className="text-[10px] font-mono text-cyan-400">
                CYBER GRID DISPATCH HUD
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onResetSimulation}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-cyan-400 text-neutral-400 hover:text-cyan-300 text-xs transition cursor-pointer"
              title="Reset Simulation State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-3 text-xs custom-scrollbar">
          {/* JUDGE AUTO-DEMO BANNER */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-cyan-200">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Judge Mode: Auto Demo</span>
              </div>
              {isAutoDemo ? (
                <button
                  type="button"
                  onClick={onStopAutoDemo}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/30 text-rose-300 border border-rose-400 cursor-pointer"
                >
                  PAUSE
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onStartAutoDemo}
                  className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.6)] cursor-pointer flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  START DEMO
                </button>
              )}
            </div>

            {isAutoDemo && (
              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between text-[11px] font-mono text-cyan-300">
                  <span>Step {autoDemoStep + 1} / 9</span>
                  <span className="truncate ml-2 text-right">
                    {autoDemoSteps[autoDemoStep]}
                  </span>
                </div>
                <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full transition-all duration-300"
                    style={{
                      width: `${Math.round(((autoDemoStep + 1) / 9) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS: EMERGENCY & NEGOTIATION */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onTriggerEmergency}
              className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-lg ${
                isEmergency
                  ? 'bg-rose-950/80 border-rose-500 text-rose-200 animate-pulse ring-2 ring-rose-500/50'
                  : 'bg-neutral-900/90 border-rose-500/50 text-rose-300 hover:bg-rose-950/60 hover:border-rose-400'
              }`}
            >
              <div className="flex items-center gap-1 text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Simulate Emergency</span>
              </div>
              <span className="text-[10px] font-mono opacity-80">
                Hospital: 40 → 55 MW
              </span>
            </button>

            <button
              type="button"
              onClick={onStartNegotiation}
              disabled={isNegotiating}
              className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-lg ${
                isNegotiating
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/50'
                  : 'bg-neutral-900/90 border-cyan-500/50 text-cyan-300 hover:bg-cyan-950/60 hover:border-cyan-400'
              }`}
            >
              <div className="flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isNegotiating ? 'Negotiating...' : 'Run Negotiation'}</span>
              </div>
              <span className="text-[10px] font-mono opacity-80">
                Pareto Dispatch
              </span>
            </button>
          </div>

          {/* DISASTER SCENARIO SELECTOR */}
          <div>
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
              Disaster Scenario
            </label>
            <div className="grid grid-cols-2 gap-2">
              {scenariosList.map((sc) => {
                const isActive = scenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => onSelectScenario(sc.id)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-950/70 border-cyan-400 ring-1 ring-cyan-400/40 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'bg-neutral-900/60 border-neutral-800 hover:border-cyan-500/40 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs">
                      <span>{sc.icon}</span>
                      <span className="truncate">{sc.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* POWER TELEMETRY SUMMARY */}
          <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="font-bold uppercase tracking-wider text-[10px]">
                Grid Energy Telemetry
              </span>
              <span className="font-mono text-cyan-400 text-[10px]">50.0 Hz</span>
            </div>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <span className="text-neutral-400 block text-[10px]">Available Supply:</span>
                <span className="text-base font-bold text-cyan-300">{gridSupply} MW</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px]">Total Demand:</span>
                <span className="text-base font-bold text-amber-300">{gridDemand} MW</span>
              </div>
            </div>
            <div className="mt-2 w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  gridSupply >= gridDemand ? 'bg-emerald-400' : 'bg-rose-500'
                }`}
                style={{
                  width: `${Math.min(100, Math.round((gridSupply / Math.max(1, gridDemand)) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* CAMERA CONTROLS */}
          <div>
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
              Camera Vantage Points
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {cameraOptions.map((cam) => {
                const Icon = cam.icon;
                const isActive = cameraMode === cam.id;
                return (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => onSelectCamera(cam.id)}
                    className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-neutral-900/70 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium truncate w-full">
                      {cam.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TABS: AGENTS / WARNINGS / LOGS */}
          <div className="flex border-b border-neutral-800 gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('status')}
              className={`pb-1.5 font-bold text-xs cursor-pointer border-b-2 transition ${
                activeTab === 'status'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              Agent Nodes ({agents.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('warnings')}
              className={`pb-1.5 font-bold text-xs cursor-pointer border-b-2 transition ${
                activeTab === 'warnings'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              Alerts ({warnings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('logs')}
              className={`pb-1.5 font-bold text-xs cursor-pointer border-b-2 transition ${
                activeTab === 'logs'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              Negotiation Log
            </button>
          </div>

          {/* TAB 1: AGENT STATUS CARDS */}
          {activeTab === 'status' && (
            <div className="space-y-2">
              {agents.map((agent) => {
                const demand = Number(agent.demand || 0);
                const allocated = Number(agent.allocated || agent.allocated_power || 0);
                const pct = demand > 0 ? Math.round((allocated / demand) * 100) : 100;
                const isSafe = pct >= 90;

                return (
                  <div
                    key={agent.id}
                    className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <span>{agent.icon}</span>
                        <span>{agent.displayName || agent.name}</span>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isSafe
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : pct >= 70
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {pct}% Fulfilled
                      </span>
                    </div>

                    <div className="flex justify-between font-mono text-[11px] text-neutral-400">
                      <span>Demand: {demand} MW</span>
                      <span className="text-cyan-300 font-bold">
                        Allocated: {allocated} MW
                      </span>
                    </div>

                    <div className="w-full bg-neutral-800 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-full ${
                          isSafe
                            ? 'bg-emerald-400'
                            : pct >= 70
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: WARNINGS & RECOMMENDATIONS */}
          {activeTab === 'warnings' && (
            <div className="space-y-2">
              {warnings.length === 0 ? (
                <div className="p-3 text-center text-neutral-400 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  All critical service dependencies fully satisfied.
                </div>
              ) : (
                warnings.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-start gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[11px]">{w.title}</p>
                      <p className="text-[10px] text-neutral-300 font-mono mt-0.5">
                        {w.detail}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {/* Recommendations list */}
              {recommendations.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Dispatcher Recommendations
                  </span>
                  <div className="space-y-1.5">
                    {recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-[11px]"
                      >
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NEGOTIATION TERMINAL LOGS */}
          {activeTab === 'logs' && (
            <div className="p-2 rounded-xl bg-black/80 border border-neutral-800 font-mono text-[10px] text-cyan-300 space-y-1.5 max-h-56 overflow-y-auto">
              {negotiationLogs.length === 0 ? (
                <span className="text-neutral-500">
                  Ready. Click 'Run Negotiation' to view live agent protocol exchanges.
                </span>
              ) : (
                negotiationLogs.map((log, index) => (
                  <div key={index} className="leading-snug">
                    <span className="text-neutral-500">[{log.time}] </span>
                    <span className="text-amber-400 font-bold">{log.sender}: </span>
                    <span className="text-neutral-200">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
