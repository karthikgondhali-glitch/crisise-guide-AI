import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CrisisGrid AI — Agent, Scenario, Negotiation, Validator, Dependency,
// Recommendation & Strategy Comparison Engine (Mirrors backend/*.py 1:1)
// ============================================================================

export class Agent {
  name: string;
  demand: number;
  minimum_safe: number;
  priority: number;
  allocated_power: number;

  constructor(
    name: string,
    demand: number,
    minimum_safe: number,
    priority: number,
    allocated_power = 0
  ) {
    this.name = name;
    this.demand = Number(demand);
    this.minimum_safe = Number(minimum_safe);
    this.priority = Number(priority);
    this.allocated_power = Number(allocated_power);
  }

  unmet_need(): number {
    return Number(Math.max(0, this.demand - this.allocated_power).toFixed(2));
  }

  evaluate_proposal(power: number): 'ACCEPT' | 'REJECT' {
    return power >= this.minimum_safe ? 'ACCEPT' : 'REJECT';
  }

  status() {
    return {
      name: this.name,
      demand: Number(this.demand.toFixed(2)),
      minimum_safe: Number(this.minimum_safe.toFixed(2)),
      priority: this.priority,
      allocated_power: Number(this.allocated_power.toFixed(2)),
      unmet_demand: this.unmet_need(),
      proposal_evaluation: this.evaluate_proposal(this.allocated_power),
      is_safe: this.allocated_power >= this.minimum_safe,
    };
  }
}

export interface ScenarioData {
  name: string;
  description?: string;
  supply: number;
  hospital: number;
  water: number;
  emergency: number;
  telecom: number;
  hospital_min?: number;
  water_min?: number;
  emergency_min?: number;
  telecom_min?: number;
}

class DisasterScenario {
  private scenarios: Record<string, ScenarioData> = {
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

  getScenario(name: string): ScenarioData | null {
    if (this.scenarios[name]) {
      return { ...this.scenarios[name] };
    }
    const normalized = name.trim().toLowerCase();
    for (const [key, data] of Object.entries(this.scenarios)) {
      if (key.toLowerCase() === normalized) {
        return { ...data };
      }
    }
    return null;
  }

  updateCustomScenario(params: Partial<ScenarioData>): ScenarioData {
    this.scenarios.Custom = {
      name: 'Custom',
      description: 'User-defined custom disaster scenario parameters.',
      supply: Number(params.supply ?? 95),
      hospital: Number(params.hospital ?? 42),
      water: Number(params.water ?? 28),
      emergency: Number(params.emergency ?? 22),
      telecom: Number(params.telecom ?? 26),
    };
    return { ...this.scenarios.Custom };
  }

  listScenarios(): ScenarioData[] {
    return Object.values(this.scenarios).map((s) => ({ ...s }));
  }
}

function buildAgentsFromScenario(scenarioData: ScenarioData): Agent[] {
  const hospitalDemand = Number(scenarioData.hospital ?? 40);
  const waterDemand = Number(scenarioData.water ?? 30);
  const emergencyDemand = Number(scenarioData.emergency ?? 20);
  const telecomDemand = Number(scenarioData.telecom ?? 30);

  const hospitalMin = Math.min(hospitalDemand, Number(scenarioData.hospital_min ?? 30));
  const waterMin = Math.min(waterDemand, Number(scenarioData.water_min ?? 20));
  const emergencyMin = Math.min(emergencyDemand, Number(scenarioData.emergency_min ?? 15));
  const telecomMin = Math.min(telecomDemand, Number(scenarioData.telecom_min ?? 15));

  return [
    new Agent('Hospital', hospitalDemand, hospitalMin, 10),
    new Agent('Water', waterDemand, waterMin, 8),
    new Agent('Emergency', emergencyDemand, emergencyMin, 9),
    new Agent('Telecom', telecomDemand, telecomMin, 7),
  ];
}

function runNegotiation(agents: Agent[], supply: number) {
  const logs: string[] = [];
  const totalDemand = agents.reduce((acc, a) => acc + a.demand, 0);
  const totalMinSafe = agents.reduce((acc, a) => acc + a.minimum_safe, 0);

  logs.push(
    `Grid Controller initialized negotiation: Available Supply = ${supply.toFixed(0)} MW, Total Demand = ${totalDemand.toFixed(0)} MW, Minimum Safe Threshold = ${totalMinSafe.toFixed(0)} MW.`
  );

  for (const a of agents) {
    logs.push(
      `${a.name} Agent requests ${a.demand.toFixed(0)} MW (Minimum Safe: ${a.minimum_safe.toFixed(0)} MW, Priority: ${a.priority}).`
    );
  }

  // Step 1 & 2: Check feasibility against total minimum safe power
  if (totalMinSafe > supply) {
    logs.push(
      `CRITICAL DEFICIT: Aggregate minimum safe requirement (${totalMinSafe.toFixed(0)} MW) exceeds available grid supply (${supply.toFixed(0)} MW) by ${(totalMinSafe - supply).toFixed(0)} MW.`
    );
    logs.push('No Safe Allocation Possible');

    let remaining = Number(supply);
    const sortedByPriority = [...agents].sort((a, b) => b.priority - a.priority);
    for (const a of sortedByPriority) {
      const allocated = Math.min(a.minimum_safe, remaining);
      a.allocated_power = Number(allocated.toFixed(2));
      remaining = Number(Math.max(0, remaining - allocated).toFixed(2));
      const decision = a.evaluate_proposal(a.allocated_power);
      logs.push(
        `Emergency Rationing -> ${a.name} allocated ${a.allocated_power.toFixed(0)} MW (Min Safe: ${a.minimum_safe.toFixed(0)} MW) — Agent Decision: ${decision}.`
      );
    }

    const allocationMap: Record<string, number> = {};
    for (const a of agents) {
      allocationMap[a.name] = Number(a.allocated_power.toFixed(2));
    }

    return {
      status: 'No Safe Allocation Possible',
      feasible: false,
      allocation: allocationMap,
      logs,
      remaining_supply: remaining,
    };
  }

  // Step 1: Allocate minimum safe power
  let remainingSupply = Number(supply);
  for (const a of agents) {
    a.allocated_power = Number(a.minimum_safe);
    remainingSupply -= a.minimum_safe;
  }
  remainingSupply = Number(Math.max(0, remainingSupply).toFixed(2));

  logs.push(
    `Phase 1 Baseline Complete: All 4 critical services secured minimum safe power (${totalMinSafe.toFixed(0)} MW allocated, ${remainingSupply.toFixed(0)} MW surplus remaining for negotiation).`
  );

  if (remainingSupply <= 0) {
    logs.push(
      'Zero surplus power remaining after baseline safety allocation. All agents hold at minimum safe levels.'
    );
  } else {
    logs.push(
      `Phase 2 Dynamic Negotiation started for ${remainingSupply.toFixed(0)} MW surplus using utility function: score = priority × unmet_demand.`
    );
  }

  let roundStep = 0;
  while (remainingSupply > 0) {
    const candidates = agents.filter((a) => a.unmet_need() > 0);
    if (candidates.length === 0) {
      logs.push('All infrastructure agents have reached 100% nominal demand.');
      break;
    }

    const scoredCandidates = [...candidates].sort((a, b) => {
      const scoreDiff = b.priority * b.unmet_need() - a.priority * a.unmet_need();
      if (Math.abs(scoreDiff) > 1e-6) return scoreDiff;
      return b.priority - a.priority;
    });

    const winner = scoredCandidates[0];
    const topScore = winner.priority * winner.unmet_need();
    const stepPower = Math.min(1.0, remainingSupply, winner.unmet_need());
    const previousUnmet = winner.unmet_need();

    winner.allocated_power = Number((winner.allocated_power + stepPower).toFixed(2));
    remainingSupply = Number((remainingSupply - stepPower).toFixed(2));
    roundStep += 1;

    if (roundStep === 1 || roundStep % 5 === 0 || remainingSupply === 0) {
      let runnerUpInfo = '';
      if (scoredCandidates.length > 1) {
        const ru = scoredCandidates[1];
        runnerUpInfo = ` vs ${ru.name} (score ${(ru.priority * ru.unmet_need()).toFixed(0)})`;
      }
      logs.push(
        `Round ${roundStep}: ${winner.name} wins +${stepPower.toFixed(0)} MW [score = ${winner.priority} × ${previousUnmet.toFixed(0)} = ${topScore.toFixed(0)}${runnerUpInfo}] → Now at ${winner.allocated_power.toFixed(0)}/${winner.demand.toFixed(0)} MW.`
      );
    }
  }

  for (const a of agents) {
    const decision = a.evaluate_proposal(a.allocated_power);
    const flexibilityNote =
      a.unmet_need() === 0
        ? 'full nominal capacity achieved'
        : `offers ${a.unmet_need().toFixed(0)} MW load flexibility above safety floor`;
    logs.push(
      `${a.name} reviews final proposal (${a.allocated_power.toFixed(0)} MW): ${decision} — ${flexibilityNote}.`
    );
  }

  logs.push('Autonomous multi-agent negotiation completed successfully.');

  const allocationMap: Record<string, number> = {};
  for (const a of agents) {
    allocationMap[a.name] = Number(a.allocated_power.toFixed(2));
  }

  return {
    status: 'Safe Allocation Achieved',
    feasible: true,
    allocation: allocationMap,
    logs,
    remaining_supply: remainingSupply,
  };
}

function validateAllocation(agents: Agent[], supply: number) {
  const warnings: string[] = [];
  let safe = true;

  const totalAllocated = Number(
    agents.reduce((acc, a) => acc + a.allocated_power, 0).toFixed(2)
  );
  const totalMinSafe = Number(
    agents.reduce((acc, a) => acc + a.minimum_safe, 0).toFixed(2)
  );

  if (totalMinSafe > supply) {
    safe = false;
    warnings.push(
      `No Safe Allocation Possible: Aggregate minimum safe demand (${totalMinSafe.toFixed(0)} MW) exceeds total grid supply (${supply.toFixed(0)} MW).`
    );
  }

  if (totalAllocated > supply + 1e-6) {
    safe = false;
    warnings.push(
      `Grid Overload Violation: Total allocated power (${totalAllocated.toFixed(1)} MW) exceeds available supply (${supply.toFixed(1)} MW).`
    );
  }

  for (const agent of agents) {
    if (agent.allocated_power < agent.minimum_safe) {
      safe = false;
      const deficit = agent.minimum_safe - agent.allocated_power;
      warnings.push(
        `Safety Threshold Violation: ${agent.name} received ${agent.allocated_power.toFixed(1)} MW, which is ${deficit.toFixed(1)} MW below its minimum safe threshold of ${agent.minimum_safe.toFixed(1)} MW.`
      );
    } else if (
      agent.allocated_power === agent.minimum_safe &&
      agent.demand > agent.minimum_safe
    ) {
      warnings.push(
        `Zero Safety Margin: ${agent.name} is operating strictly at its minimum safe floor (${agent.minimum_safe.toFixed(0)} MW) with ${agent.unmet_need().toFixed(0)} MW unmet nominal demand.`
      );
    }
  }

  return {
    safe,
    total_allocated: totalAllocated,
    warnings,
  };
}

function analyzeDependencies(agents: Agent[]) {
  const agentMap = Object.fromEntries(agents.map((a) => [a.name, a]));
  const cascadingWarnings: string[] = [];
  const dependencyRisks: Array<{
    source: string;
    target: string;
    relationship: string;
    status: string;
    severity: string;
    message: string;
  }> = [];

  const telecom = agentMap.Telecom;
  const emergency = agentMap.Emergency;
  if (telecom && emergency) {
    if (telecom.allocated_power < telecom.minimum_safe) {
      const msg = `CASCADING FAILURE RISK [Telecom → Emergency]: Telecom is below minimum safe power (${telecom.allocated_power.toFixed(0)}/${telecom.minimum_safe.toFixed(0)} MW). Emergency dispatch and first-responder communications face immediate blackout even if Emergency holds ${emergency.allocated_power.toFixed(0)} MW.`;
      cascadingWarnings.push(msg);
      dependencyRisks.push({
        source: 'Telecom',
        target: 'Emergency',
        relationship: 'Telecom → Emergency',
        status: 'CRITICAL CASCADE RISK',
        severity: 'critical',
        message: msg,
      });
    } else if (telecom.allocated_power < telecom.demand * 0.65) {
      const msg = `DEGRADED DEPENDENCY [Telecom → Emergency]: Telecom operating at reduced capacity (${telecom.allocated_power.toFixed(0)}/${telecom.demand.toFixed(0)} MW). Cell tower load-shedding may increase 911 dispatch latency for Emergency Services.`;
      cascadingWarnings.push(msg);
      dependencyRisks.push({
        source: 'Telecom',
        target: 'Emergency',
        relationship: 'Telecom → Emergency',
        status: 'LATENCY WARNING',
        severity: 'warning',
        message: msg,
      });
    } else {
      dependencyRisks.push({
        source: 'Telecom',
        target: 'Emergency',
        relationship: 'Telecom → Emergency',
        status: 'NOMINAL LINK',
        severity: 'safe',
        message: `Telecom backbone stable at ${telecom.allocated_power.toFixed(0)} MW; Emergency dispatch channels fully operational.`,
      });
    }
  }

  const water = agentMap.Water;
  const hospital = agentMap.Hospital;
  if (water && hospital) {
    if (water.allocated_power < water.minimum_safe) {
      const msg = `CASCADING FAILURE RISK [Water → Hospital]: Water Supply is below minimum safe power (${water.allocated_power.toFixed(0)}/${water.minimum_safe.toFixed(0)} MW). Loss of water pressure compromises Hospital surgical sterilization, HVAC cooling, and ICU sanitation despite Hospital receiving ${hospital.allocated_power.toFixed(0)} MW.`;
      cascadingWarnings.push(msg);
      dependencyRisks.push({
        source: 'Water',
        target: 'Hospital',
        relationship: 'Water → Hospital',
        status: 'CRITICAL CASCADE RISK',
        severity: 'critical',
        message: msg,
      });
    } else if (water.allocated_power < water.demand * 0.75) {
      const msg = `PRESSURE BUFFER WARNING [Water → Hospital]: Water pumping at ${water.allocated_power.toFixed(0)}/${water.demand.toFixed(0)} MW (minimum safe floor). Secondary booster pumps offline; Hospital must monitor backup water reserve tanks.`;
      cascadingWarnings.push(msg);
      dependencyRisks.push({
        source: 'Water',
        target: 'Hospital',
        relationship: 'Water → Hospital',
        status: 'BUFFER THIN',
        severity: 'warning',
        message: msg,
      });
    } else {
      dependencyRisks.push({
        source: 'Water',
        target: 'Hospital',
        relationship: 'Water → Hospital',
        status: 'NOMINAL LINK',
        severity: 'safe',
        message: `Water treatment and pressurization stable at ${water.allocated_power.toFixed(0)} MW; Hospital critical water feed secured.`,
      });
    }
  }

  return {
    warnings: cascadingWarnings,
    dependency_risks: dependencyRisks,
  };
}

function generateRecommendations(
  agents: Agent[],
  supply: number,
  safe: boolean,
  scenarioName: string
): string[] {
  const recommendations: string[] = [];
  const agentMap = Object.fromEntries(agents.map((a) => [a.name, a]));

  const hospital = agentMap.Hospital;
  const water = agentMap.Water;
  const emergency = agentMap.Emergency;
  const telecom = agentMap.Telecom;

  const totalDemand = agents.reduce((acc, a) => acc + a.demand, 0);
  const totalMinSafe = agents.reduce((acc, a) => acc + a.minimum_safe, 0);

  if (hospital) {
    if (hospital.allocated_power >= hospital.minimum_safe) {
      recommendations.push(
        `Maintain Hospital Allocation: Lock Hospital feed at ${hospital.allocated_power.toFixed(0)} MW (>= ${hospital.minimum_safe.toFixed(0)} MW safety floor) to protect ICU life-support, trauma operating theaters, and cold-chain storage.`
      );
    } else {
      const deficit = hospital.minimum_safe - hospital.allocated_power;
      recommendations.push(
        `URGENT — Restore Hospital Safety Floor: Immediately dispatch +${deficit.toFixed(0)} MW mobile diesel generation to bring Hospital from ${hospital.allocated_power.toFixed(0)} MW up to its ${hospital.minimum_safe.toFixed(0)} MW minimum safe threshold.`
      );
    }
  }

  if (!safe || totalMinSafe > supply) {
    const shortfall = Math.max(0, totalMinSafe - supply);
    recommendations.push(
      `Emergency Renegotiation Required: Grid supply (${supply.toFixed(0)} MW) is ${shortfall.toFixed(0)} MW below aggregate minimum safety (${totalMinSafe.toFixed(0)} MW). Activate microgrid islanding and request ${shortfall.toFixed(0)} MW emergency interconnect transfer before re-running multi-agent negotiation.`
    );
  } else if (totalDemand > supply) {
    const unmetTotal = totalDemand - supply;
    recommendations.push(
      `Multi-Agent Renegotiation Advice: ${unmetTotal.toFixed(0)} MW of non-critical demand remains shed. Maintain dynamic priority×unmet_need scoring and schedule automated renegotiation every 15 minutes as hospital surge loads fluctuate.`
    );
  } else {
    recommendations.push(
      'Optimal Equilibrium Reached: All critical infrastructure demands are 100% satisfied. Reserve excess capacity in spinning battery storage for sudden aftershock or surge events.'
    );
  }

  if (water && hospital && water.allocated_power <= water.minimum_safe) {
    recommendations.push(
      `Mitigate [Water → Hospital] Dependency Risk: Water Supply is pinned at ${water.allocated_power.toFixed(0)} MW. Prioritize high-elevation hospital feed valves so surgical sterilization and cooling loops do not lose pressure.`
    );
  }

  if (telecom && emergency && telecom.allocated_power <= telecom.minimum_safe) {
    recommendations.push(
      `Mitigate [Telecom → Emergency] Dependency Risk: Telecom is at ${telecom.allocated_power.toFixed(0)} MW. Throttle commercial data traffic on cell towers to guarantee 100% bandwidth for Emergency Services first-responder dispatch.`
    );
  }

  if (emergency && emergency.unmet_need() > 0) {
    recommendations.push(
      `Risk Mitigation (${scenarioName} Scenario): Emergency Services has ${emergency.unmet_need().toFixed(0)} MW unmet demand. Pre-charge fleet backup batteries during low-hospital-surge windows.`
    );
  }

  return recommendations;
}

function allocateEqual(agents: Agent[], supply: number): Record<string, number> {
  const alloc: Record<string, number> = {};
  const demands: Record<string, number> = {};
  for (const a of agents) {
    alloc[a.name] = 0;
    demands[a.name] = a.demand;
  }
  let remaining = Number(supply);
  let active = agents.map((a) => a.name);

  while (remaining > 1e-6 && active.length > 0) {
    const share = remaining / active.length;
    let progressed = false;
    const nextActive: string[] = [];
    for (const name of active) {
      const need = demands[name] - alloc[name];
      if (need <= share + 1e-6) {
        alloc[name] += need;
        remaining -= need;
        progressed = true;
      } else {
        nextActive.push(name);
      }
    }
    if (!progressed) {
      for (const name of nextActive) {
        alloc[name] += share;
        remaining -= share;
      }
      break;
    }
    active = nextActive;
  }

  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(alloc)) {
    out[k] = Number(v.toFixed(2));
  }
  return out;
}

function allocateFixedPriority(agents: Agent[], supply: number): Record<string, number> {
  const priorityOrder = ['Hospital', 'Emergency', 'Water', 'Telecom'];
  const agentMap = Object.fromEntries(agents.map((a) => [a.name, a]));
  let remaining = Number(supply);
  const alloc: Record<string, number> = {};

  for (const name of priorityOrder) {
    const agent = agentMap[name];
    if (!agent) continue;
    const granted = Math.min(agent.demand, remaining);
    alloc[name] = Number(granted.toFixed(2));
    remaining = Math.max(0, remaining - granted);
  }
  return alloc;
}

function evaluateMetrics(
  strategyName: string,
  agents: Agent[],
  allocation: Record<string, number>,
  supply: number
) {
  const totalDemand = agents.reduce((acc, a) => acc + a.demand, 0);
  const totalAllocated = agents.reduce((acc, a) => acc + (allocation[a.name] ?? 0), 0);

  let operationalServices = 0;
  let safetyViolations = 0;
  const satisfactionRatios: number[] = [];

  for (const a of agents) {
    const allocVal = allocation[a.name] ?? 0;
    if (allocVal >= a.minimum_safe - 1e-6) {
      operationalServices += 1;
    } else {
      safetyViolations += 1;
    }
    const ratio = a.demand > 0 ? allocVal / a.demand : 1.0;
    satisfactionRatios.push(ratio);
  }

  const unmetDemand = Number(Math.max(0, totalDemand - totalAllocated).toFixed(2));
  const effectiveCapacity = Math.min(supply, totalDemand);
  const resourceUtilization =
    effectiveCapacity > 0
      ? Number(((totalAllocated / effectiveCapacity) * 100.0).toFixed(1))
      : 100.0;

  const n = satisfactionRatios.length;
  const sumR = satisfactionRatios.reduce((acc, r) => acc + r, 0);
  const sumSq = satisfactionRatios.reduce((acc, r) => acc + r * r, 0);
  const jainsIndex = n * sumSq > 0 ? (sumR * sumR) / (n * sumSq) : 1.0;
  const fairnessScore = Number((jainsIndex * 100.0).toFixed(1));

  const agentMap = Object.fromEntries(agents.map((a) => [a.name, a]));
  let depBroken = 0;
  if (agentMap.Water && (allocation.Water ?? 0) < agentMap.Water.minimum_safe) {
    depBroken += 1;
  }
  if (agentMap.Telecom && (allocation.Telecom ?? 0) < agentMap.Telecom.minimum_safe) {
    depBroken += 1;
  }

  const safetyRatio = operationalServices / agents.length;
  const safetyComponent = safetyRatio * 45.0;
  const violationPenalty = safetyViolations * 12.0 + depBroken * 8.0;
  const utilizationComponent = (resourceUtilization / 100.0) * 25.0;
  const fairnessComponent = (fairnessScore / 100.0) * 20.0;
  const hospSafe =
    agentMap.Hospital && (allocation.Hospital ?? 0) >= agentMap.Hospital.minimum_safe
      ? 1.0
      : 0.0;
  const priorityComponent = hospSafe * 10.0;

  const rawOverall =
    safetyComponent +
    utilizationComponent +
    fairnessComponent +
    priorityComponent -
    violationPenalty;
  const overallScore = Number(Math.max(5.0, Math.min(100.0, rawOverall)).toFixed(1));

  return {
    strategy: strategyName,
    allocation,
    operational_services: operationalServices,
    total_services: agents.length,
    safety_violations: safetyViolations,
    cascading_risks: depBroken,
    unmet_demand: unmetDemand,
    resource_utilization: resourceUtilization,
    fairness_score: fairnessScore,
    overall_score: overallScore,
  };
}

function compareAllStrategies(scenarioData: ScenarioData) {
  const supply = Number(scenarioData.supply ?? 100);

  const agentsEqual = buildAgentsFromScenario(scenarioData);
  const allocEqual = allocateEqual(agentsEqual, supply);
  const metricsEqual = evaluateMetrics('Equal Allocation', agentsEqual, allocEqual, supply);

  const agentsFixed = buildAgentsFromScenario(scenarioData);
  const allocFixed = allocateFixedPriority(agentsFixed, supply);
  const metricsFixed = evaluateMetrics('Fixed Priority', agentsFixed, allocFixed, supply);

  const agentsAi = buildAgentsFromScenario(scenarioData);
  const negResult = runNegotiation(agentsAi, supply);
  const allocAi = negResult.allocation;
  const metricsAi = evaluateMetrics('CrisisGrid AI', agentsAi, allocAi, supply);

  const strategies = [metricsEqual, metricsFixed, metricsAi];
  const best = [...strategies].sort((a, b) => {
    if (b.overall_score !== a.overall_score) return b.overall_score - a.overall_score;
    if (b.operational_services !== a.operational_services)
      return b.operational_services - a.operational_services;
    return a.safety_violations - b.safety_violations;
  })[0];

  return {
    scenario: scenarioData.name ?? 'Flood',
    supply,
    total_demand: agentsAi.reduce((acc, a) => acc + a.demand, 0),
    strategies,
    recommended_strategy: best.strategy,
    summary: `${best.strategy} achieves the highest Overall Score (${best.overall_score}/100) with ${best.operational_services}/4 operational services and ${best.safety_violations} safety violations.`,
  };
}

// ============================================================================
// In-Memory State & Express Server Setup
// ============================================================================

const scenarioManager = new DisasterScenario();
const ACTIVE_STATE: {
  current_scenario: ScenarioData;
  last_simulation: any;
  emergency_events_count: number;
} = {
  current_scenario: scenarioManager.getScenario('Flood')!,
  last_simulation: null,
  emergency_events_count: 0,
};

function executeSimulationPipeline(scenarioData: ScenarioData, extraLog = '') {
  const supply = Number(scenarioData.supply);
  const scenarioName = String(scenarioData.name || 'Flood');

  const agents = buildAgentsFromScenario(scenarioData);
  const negotiationRes = runNegotiation(agents, supply);
  const validationRes = validateAllocation(agents, supply);
  const dependencyRes = analyzeDependencies(agents);

  const allWarnings = [...validationRes.warnings, ...dependencyRes.warnings];
  const logs = [...negotiationRes.logs];
  if (extraLog) {
    logs.unshift(extraLog);
  }

  const isSafe = Boolean(validationRes.safe && negotiationRes.feasible);
  const recommendations = generateRecommendations(agents, supply, isSafe, scenarioName);

  const totalDemand = Number(agents.reduce((acc, a) => acc + a.demand, 0).toFixed(2));
  const totalMinSafe = Number(
    agents.reduce((acc, a) => acc + a.minimum_safe, 0).toFixed(2)
  );
  const totalAllocated = Number(
    agents.reduce((acc, a) => acc + a.allocated_power, 0).toFixed(2)
  );
  const utilizationRate =
    supply > 0 ? Number(((totalAllocated / supply) * 100.0).toFixed(1)) : 0.0;
  const servicesOnline = agents.filter((a) => a.allocated_power >= a.minimum_safe).length;

  const result = {
    scenario: scenarioName,
    supply,
    total_demand: totalDemand,
    total_minimum_safe: totalMinSafe,
    allocation: negotiationRes.allocation,
    agents: agents.map((a) => a.status()),
    warnings: allWarnings,
    dependency_risks: dependencyRes.dependency_risks,
    logs,
    safe: isSafe,
    status_message: negotiationRes.status,
    recommendations,
    utilization_rate: utilizationRate,
    services_online: servicesOnline,
  };

  ACTIVE_STATE.current_scenario = { ...scenarioData };
  ACTIVE_STATE.last_simulation = result;
  return result;
}

// Initial boot simulation
executeSimulationPipeline(ACTIVE_STATE.current_scenario);

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health & Root Info Endpoints
  const healthHandler = (_req: express.Request, res: express.Response) => {
    res.json({
      status: 'healthy',
      engine: 'CrisisGrid Multi-Agent Negotiation Engine v1.0',
      active_scenario: ACTIVE_STATE.current_scenario.name,
    });
  };
  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // Scenarios Endpoint
  const scenariosHandler = (_req: express.Request, res: express.Response) => {
    res.json({
      scenarios: scenarioManager.listScenarios(),
      active: ACTIVE_STATE.current_scenario,
      last_simulation: ACTIVE_STATE.last_simulation,
    });
  };
  app.get('/scenarios', scenariosHandler);
  app.get('/api/scenarios', scenariosHandler);

  // Simulate Endpoint
  const simulateHandler = (req: express.Request, res: express.Response) => {
    const payload = req.body || {};
    const scenarioName = payload.scenario || 'Flood';
    let base = scenarioManager.getScenario(scenarioName);
    if (!base) {
      base = {
        name: scenarioName,
        supply: 100,
        hospital: 40,
        water: 30,
        emergency: 20,
        telecom: 30,
      };
    }

    const scenarioData: ScenarioData = { ...base };
    if (payload.supply !== undefined && payload.supply !== null)
      scenarioData.supply = Number(payload.supply);
    if (payload.hospital !== undefined && payload.hospital !== null)
      scenarioData.hospital = Number(payload.hospital);
    if (payload.water !== undefined && payload.water !== null)
      scenarioData.water = Number(payload.water);
    if (payload.emergency !== undefined && payload.emergency !== null)
      scenarioData.emergency = Number(payload.emergency);
    if (payload.telecom !== undefined && payload.telecom !== null)
      scenarioData.telecom = Number(payload.telecom);

    if (String(scenarioName).trim().toLowerCase() === 'custom') {
      scenarioManager.updateCustomScenario(scenarioData);
    }

    ACTIVE_STATE.emergency_events_count = 0;
    const result = executeSimulationPipeline(scenarioData);
    res.json(result);
  };
  app.post('/simulate', simulateHandler);
  app.post('/api/simulate', simulateHandler);

  // Emergency Endpoint
  const emergencyHandler = (req: express.Request, res: express.Response) => {
    const payload = req.body || {};
    const additional =
      payload.additional_demand !== undefined && payload.additional_demand !== null
        ? Number(payload.additional_demand)
        : 15;
    const current: ScenarioData = { ...ACTIVE_STATE.current_scenario };
    const previousHospital = Number(current.hospital);
    current.hospital = Number((previousHospital + additional).toFixed(2));
    ACTIVE_STATE.emergency_events_count += 1;

    const emergencyBanner = `EMERGENCY RENEGOTIATION TRIGGERED (#${ACTIVE_STATE.emergency_events_count}): Hospital trauma surge increased demand by +${additional.toFixed(0)} MW (from ${previousHospital.toFixed(0)} MW to ${current.hospital.toFixed(0)} MW).`;
    const result = executeSimulationPipeline(current, emergencyBanner);
    res.json(result);
  };
  app.post('/emergency', emergencyHandler);
  app.post('/api/emergency', emergencyHandler);

  // Compare Strategies Endpoint
  const compareHandler = (req: express.Request, res: express.Response) => {
    const payload = req.body || {};
    let targetScenario: ScenarioData = { ...ACTIVE_STATE.current_scenario };
    if (payload.scenario) {
      const found = scenarioManager.getScenario(payload.scenario);
      if (found) targetScenario = { ...found };
    }
    if (payload.supply !== undefined && payload.supply !== null)
      targetScenario.supply = Number(payload.supply);
    if (payload.hospital !== undefined && payload.hospital !== null)
      targetScenario.hospital = Number(payload.hospital);
    if (payload.water !== undefined && payload.water !== null)
      targetScenario.water = Number(payload.water);
    if (payload.emergency !== undefined && payload.emergency !== null)
      targetScenario.emergency = Number(payload.emergency);
    if (payload.telecom !== undefined && payload.telecom !== null)
      targetScenario.telecom = Number(payload.telecom);

    res.json(compareAllStrategies(targetScenario));
  };
  app.post('/compare-strategies', compareHandler);
  app.post('/api/compare-strategies', compareHandler);

  // Source Code Inspector Endpoint (exposes complete Python FastAPI backend files)
  app.get('/api/backend-source', (_req, res) => {
    const backendDir = path.join(__dirname, 'backend');
    const files = [
      'main.py',
      'models.py',
      'scenario.py',
      'agent.py',
      'negotiation.py',
      'validator.py',
      'dependency.py',
      'comparison.py',
      'recommendation.py',
      'requirements.txt',
    ];
    const contents: Record<string, string> = {};
    for (const f of files) {
      const fullPath = path.join(backendDir, f);
      if (fs.existsSync(fullPath)) {
        contents[f] = fs.readFileSync(fullPath, 'utf-8');
      }
    }
    res.json({ files: contents });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CrisisGrid AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
