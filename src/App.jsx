import React, { useState, useEffect, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import EmergencyButton from './components/EmergencyButton.jsx';
import ParticleBackground from './components/ParticleBackground.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Scenario from './pages/Scenario.jsx';
import Negotiation from './pages/Negotiation.jsx';
import Results from './pages/Results.jsx';
import Comparison from './pages/Comparison.jsx';
import DigitalTwinView from './pages/DigitalTwinView.jsx';
import {
  fetchScenarios,
  runSimulation,
  triggerEmergency,
} from './services/api.js';
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  signOutUser,
  saveSimulationToCloud,
  updateSimulationNotes,
  deleteSimulationFromCloud,
  subscribeToUserSimulations,
} from './services/firebase.js';

function TopBar({ simulation, onEmergency, emergencyLoading }) {
  const location = useLocation();
  const routeNames = {
    '/': 'Dashboard',
    '/digital-twin': '3D Digital Twin City',
    '/scenario': 'Scenario Setup',
    '/negotiation': 'Negotiation',
    '/results': 'Results',
    '/comparison': 'Comparison',
  };
  const currentSection = routeNames[location.pathname] || 'Dashboard';

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-cyan-500/20 bg-black/80 backdrop-blur-sm">
      {/* Contextual Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-neutral-400 whitespace-nowrap truncate">
        <span className="font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">CrisisGrid AI</span>
        <span>/</span>
        <span className="text-white font-semibold">{currentSection}</span>
        {simulation?.scenario && (
          <>
            <span>·</span>
            <span className="font-mono tabular-nums text-xs text-cyan-300">
              {simulation.scenario} ({simulation.supply} MW Supply / {simulation.total_demand} MW Demand)
            </span>
          </>
        )}
      </div>

      {/* Primary Action */}
      <div className="w-56 shrink-0">
        <EmergencyButton
          onEmergency={onEmergency}
          loading={emergencyLoading}
          compact={true}
        />
      </div>
    </header>
  );
}

export default function App() {
  const [simulation, setSimulation] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [toastBanner, setToastBanner] = useState(null);

  // Firebase Auth & Firestore state
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [cloudSimulations, setCloudSimulations] = useState([]);
  const [savingToCloud, setSavingToCloud] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !user) {
      setCloudSimulations([]);
      return;
    }
    const unsub = subscribeToUserSimulations(user.uid, (items) => {
      setCloudSimulations(items);
    });
    return () => unsub();
  }, [authReady, user]);

  const loadInitialState = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchScenarios();
      if (data.scenarios) {
        setScenarios(data.scenarios);
      }
      if (data.last_simulation) {
        setSimulation(data.last_simulation);
      } else {
        const sim = await runSimulation({ scenario: 'Flood' });
        setSimulation(sim);
      }
    } catch (err) {
      console.error('Failed to initialize CrisisGrid AI:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialState();
  }, [loadInitialState]);

  const handleRunSimulation = async (payload) => {
    setLoading(true);
    try {
      const res = await runSimulation(payload);
      setSimulation(res);
      setToastBanner(
        `Simulated ${res.scenario} Scenario: ${res.supply} MW Supply vs ${res.total_demand} MW Demand — ${res.status_message}`
      );
      setTimeout(() => setToastBanner(null), 4500);
      return res;
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickScenario = async (scenarioName) => {
    await handleRunSimulation({ scenario: scenarioName });
  };

  const handleTriggerEmergency = async (additionalDemand = 15) => {
    setEmergencyLoading(true);
    try {
      const res = await triggerEmergency(additionalDemand);
      setSimulation(res);
      setToastBanner(
        `Emergency Surge Processed: Hospital demand increased by +${additionalDemand} MW (Now ${
          res.agents?.find((a) => a.name === 'Hospital')?.demand ?? ''
        } MW). Grid re-negotiated.`
      );
      setTimeout(() => setToastBanner(null), 5000);
      return res;
    } catch (err) {
      console.error('Emergency renegotiation error:', err);
    } finally {
      setEmergencyLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign-In failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Sign-Out failed:', err);
    }
  };

  const handleSaveToCloud = async () => {
    if (!user || !simulation) return;
    setSavingToCloud(true);
    try {
      await saveSimulationToCloud(
        simulation,
        `${simulation.scenario} dispatch (${simulation.supply} MW supply)`
      );
      setToastBanner('Simulation run saved to Firebase Firestore.');
      setTimeout(() => setToastBanner(null), 4000);
    } catch (err) {
      console.error('Failed to save simulation to Firestore:', err);
    } finally {
      setSavingToCloud(false);
    }
  };

  const handleUpdateCloudNote = async (simId, notes) => {
    try {
      await updateSimulationNotes(simId, notes);
    } catch (err) {
      console.error('Failed to update simulation notes:', err);
    }
  };

  const handleDeleteCloudSimulation = async (simId) => {
    try {
      await deleteSimulationFromCloud(simId);
    } catch (err) {
      console.error('Failed to delete simulation:', err);
    }
  };

  const handleRestoreCloudSimulation = async (rec) => {
    await handleRunSimulation({
      scenario: rec.scenario || 'Custom',
      supply: rec.supply,
    });
  };

  return (
    <Router>
      <div className="relative min-h-screen bg-black text-cyan-50">
        <ParticleBackground />
        <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
          <Sidebar
            simulation={simulation}
            onEmergency={handleTriggerEmergency}
            emergencyLoading={emergencyLoading}
            user={user}
            authReady={authReady}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            onSaveSimulation={handleSaveToCloud}
            savingToCloud={savingToCloud}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <TopBar
              simulation={simulation}
              onEmergency={handleTriggerEmergency}
              emergencyLoading={emergencyLoading}
            />

            {toastBanner && (
              <div className="mx-6 mt-4 px-4 py-2.5 rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-xs text-cyan-100 flex items-center justify-between backdrop-blur-sm">
                <span>{toastBanner}</span>
                <button
                  type="button"
                  onClick={() => setToastBanner(null)}
                  className="text-cyan-300 hover:text-white ml-4 font-mono cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    simulation={simulation}
                    scenarios={scenarios}
                    onSelectQuickScenario={handleQuickScenario}
                    loading={loading}
                    user={user}
                    cloudSimulations={cloudSimulations}
                    onSaveSimulation={handleSaveToCloud}
                    onUpdateCloudNote={handleUpdateCloudNote}
                    onDeleteCloudSimulation={handleDeleteCloudSimulation}
                    onRestoreCloudSimulation={handleRestoreCloudSimulation}
                    savingToCloud={savingToCloud}
                  />
                }
              />
              <Route
                path="/digital-twin"
                element={<DigitalTwinView simulation={simulation} />}
              />
              <Route
                path="/scenario"
                element={
                  <Scenario
                    simulation={simulation}
                    onRunSimulation={handleRunSimulation}
                    loading={loading}
                  />
                }
              />
              <Route
                path="/negotiation"
                element={<Negotiation simulation={simulation} />}
              />
              <Route
                path="/results"
                element={<Results simulation={simulation} />}
              />
              <Route
                path="/comparison"
                element={<Comparison simulation={simulation} />}
              />
            </Routes>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
}
