import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sliders,
  MessageSquareCode,
  BarChart3,
  Scale,
  ShieldAlert,
  LogIn,
  LogOut,
  Save,
} from 'lucide-react';
import EmergencyButton from './EmergencyButton.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/scenario', label: 'Scenario Setup', icon: Sliders, end: false },
  { to: '/negotiation', label: 'Negotiation', icon: MessageSquareCode, end: false },
  { to: '/results', label: 'Results', icon: BarChart3, end: false },
  { to: '/comparison', label: 'Comparison', icon: Scale, end: false },
];

export default function Sidebar({
  simulation,
  onEmergency,
  emergencyLoading,
  user,
  authReady,
  onSignIn,
  onSignOut,
  onSaveSimulation,
  savingToCloud,
}) {
  const isSafe = simulation?.safe ?? true;

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-black/85 backdrop-blur-sm border-b lg:border-b-0 lg:border-r border-cyan-500/20 flex flex-col justify-between">
      <div>
        {/* Brand Zone */}
        <div className="px-6 py-5 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-400 flex items-center justify-center text-black font-bold text-sm tracking-tight shadow-[0_0_16px_rgba(34,211,238,0.4)]">
              CG
            </div>
            <div>
              <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent whitespace-nowrap">
                CrisisGrid AI
              </span>
              <p className="text-xs text-neutral-400">
                Disaster Power Dispatch
              </p>
            </div>
          </div>
        </div>

        {/* Active Scenario Summary Strip */}
        {simulation && (
          <div className="px-6 py-3.5 border-b border-cyan-500/20 bg-neutral-950/60">
            <div className="text-xs text-neutral-400 flex items-center justify-between">
              <span>Scenario</span>
              <span className="font-mono tabular-nums text-cyan-200 font-medium">
                {simulation.scenario}
              </span>
            </div>
            <div className="mt-1.5 text-xs text-neutral-400 flex items-center justify-between">
              <span>Grid State</span>
              <span
                className={`font-mono tabular-nums font-medium ${
                  isSafe ? 'text-cyan-400' : 'text-red-400'
                }`}
              >
                {isSafe ? 'SAFE EQUILIBRIUM' : 'DEFICIT ALERT'}
              </span>
            </div>
          </div>
        )}

        {/* Primary Navigation */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-400 text-black font-semibold shadow-[0_0_18px_rgba(34,211,238,0.28)]'
                    : 'text-neutral-400 hover:text-cyan-200 hover:bg-cyan-500/10'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Account & Emergency Action Zone */}
      <div className="p-4 border-t border-cyan-500/20 space-y-4">
        {/* Operator Account & Cloud Persistence */}
        {authReady && (
          <div className="p-3 rounded-lg bg-neutral-950/75 border border-cyan-500/20 space-y-2.5">
            {user ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-white truncate">
                      {user.displayName || 'Grid Operator'}
                    </div>
                    <div className="text-xs text-neutral-400 truncate">
                      {user.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onSignOut}
                    title="Sign Out"
                    className="p-1.5 rounded-md text-neutral-400 hover:text-cyan-300 hover:bg-neutral-900 transition-colors cursor-pointer shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={savingToCloud}
                  onClick={onSaveSimulation}
                  className="w-full px-3 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-cyan-500/25 text-xs font-medium text-cyan-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Save className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{savingToCloud ? 'Saving Run...' : 'Save Run to Cloud'}</span>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-neutral-400">
                  Sign in with Google to save simulation runs and operator notes to Firebase.
                </div>
                <button
                  type="button"
                  onClick={onSignIn}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-cyan-500/25 text-xs font-medium text-cyan-200 flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Sign In with Google</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2.5">
          <div className="text-xs text-neutral-400 leading-relaxed">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Emergency Surge Drill</span>
            </div>
            <span>
              Injects +15 MW Hospital trauma surge and triggers autonomous renegotiation.
            </span>
          </div>
          <EmergencyButton
            onEmergency={onEmergency}
            loading={emergencyLoading}
          />
        </div>
      </div>
    </aside>
  );
}
