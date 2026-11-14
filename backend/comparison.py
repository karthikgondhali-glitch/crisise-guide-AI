"""
comparison.py
CrisisGrid AI - Allocation Strategy Comparison Engine

Compares three distinct power allocation algorithms on the active scenario:
1. Equal Allocation: Divides supply equally (supply / 4), capped at each agent's demand, redistributing surplus.
2. Fixed Priority: Strictly satisfies full demand in priority order:
   Hospital -> Emergency -> Water -> Telecom.
3. CrisisGrid AI: Autonomous multi-agent negotiation (secures minimum safe baseline first,
   then allocates surplus via score = priority * unmet_demand).

Metrics Computed:
- Operational Services (count of services with allocated >= minimum_safe)
- Safety Violations (count of services with allocated < minimum_safe)
- Unmet Demand (MW)
- Resource Utilization (%)
- Fairness Score (0-100, Jain's fairness index over satisfaction ratios)
- Overall Score (0-100 composite performance index)
"""

from typing import Any, Dict, List
from agent import Agent, build_agents_from_scenario
from negotiation import run_negotiation


def _allocate_equal(agents: List[Agent], supply: float) -> Dict[str, float]:
    """
    Divides available supply equally among agents, capping at each agent's demand
    and redistributing any unused excess equally among remaining unsaturated agents.
    """
    alloc = {a.name: 0.0 for a in agents}
    demands = {a.name: a.demand for a in agents}
    remaining = float(supply)
    active = [a.name for a in agents]

    while remaining > 1e-6 and active:
        share = remaining / len(active)
        progressed = False
        next_active = []
        for name in active:
            need = demands[name] - alloc[name]
            if need <= share + 1e-6:
                alloc[name] += need
                remaining -= need
                progressed = True
            else:
                next_active.append(name)
        if not progressed:
            for name in next_active:
                alloc[name] += share
                remaining -= share
            break
        active = next_active

    return {k: round(v, 2) for k, v in alloc.items()}


def _allocate_fixed_priority(agents: List[Agent], supply: float) -> Dict[str, float]:
    """
    Allocates full nominal demand in strict priority order:
    Hospital (10) -> Emergency (9) -> Water (8) -> Telecom (7)
    without reserving minimum safe baselines for lower-priority interdependent services.
    """
    priority_order = ["Hospital", "Emergency", "Water", "Telecom"]
    agent_map = {a.name: a for a in agents}
    remaining = float(supply)
    alloc: Dict[str, float] = {}

    for name in priority_order:
        agent = agent_map.get(name)
        if not agent:
            continue
        granted = min(agent.demand, remaining)
        alloc[name] = round(granted, 2)
        remaining = max(0.0, remaining - granted)

    return alloc


def _evaluate_metrics(
    strategy_name: str,
    agents: List[Agent],
    allocation: Dict[str, float],
    supply: float,
) -> Dict[str, Any]:
    """
    Computes all 6 evaluation metrics for a given strategy's allocation.
    """
    total_demand = sum(a.demand for a in agents)
    total_allocated = sum(allocation.get(a.name, 0.0) for a in agents)

    operational_services = 0
    safety_violations = 0
    satisfaction_ratios: List[float] = []

    for a in agents:
        alloc_val = allocation.get(a.name, 0.0)
        if alloc_val >= a.minimum_safe - 1e-6:
            operational_services += 1
        else:
            safety_violations += 1
        ratio = (alloc_val / a.demand) if a.demand > 0 else 1.0
        satisfaction_ratios.append(ratio)

    unmet_demand = round(max(0.0, total_demand - total_allocated), 2)
    effective_capacity = min(supply, total_demand)
    resource_utilization = (
        round((total_allocated / effective_capacity) * 100.0, 1)
        if effective_capacity > 0
        else 100.0
    )

    # Jain's Fairness Index over demand satisfaction ratios: (sum(x_i))^2 / (n * sum(x_i^2))
    n = len(satisfaction_ratios)
    denom = n * sum(r * r for r in satisfaction_ratios)
    jains_index = (sum(satisfaction_ratios) ** 2) / denom if denom > 0 else 1.0
    fairness_score = round(jains_index * 100.0, 1)

    # Dependency penalty: check if Water < min_safe or Telecom < min_safe
    agent_map = {a.name: a for a in agents}
    dep_Broken = 0
    if "Water" in agent_map and allocation.get("Water", 0.0) < agent_map["Water"].minimum_safe:
        dep_Broken += 1
    if "Telecom" in agent_map and allocation.get("Telecom", 0.0) < agent_map["Telecom"].minimum_safe:
        dep_Broken += 1

    # Priority-weighted safety and utility score
    safety_ratio = operational_services / len(agents)
    safety_component = safety_ratio * 45.0
    violation_penalty = safety_violations * 12.0 + dep_Broken * 8.0
    utilization_component = (resource_utilization / 100.0) * 25.0
    fairness_component = (fairness_score / 100.0) * 20.0

    # Priority alignment bonus (protecting highest priority while respecting safety floors)
    hosp_safe = (
        1.0
        if "Hospital" in agent_map
        and allocation.get("Hospital", 0.0) >= agent_map["Hospital"].minimum_safe
        else 0.0
    )
    priority_component = hosp_safe * 10.0

    raw_overall = (
        safety_component
        + utilization_component
        + fairness_component
        + priority_component
        - violation_penalty
    )
    overall_score = round(max(5.0, min(100.0, raw_overall)), 1)

    return {
        "strategy": strategy_name,
        "allocation": allocation,
        "operational_services": operational_services,
        "total_services": len(agents),
        "safety_violations": safety_violations,
        "cascading_risks": dep_Broken,
        "unmet_demand": unmet_demand,
        "resource_utilization": resource_utilization,
        "fairness_score": fairness_score,
        "overall_score": overall_score,
    }


def compare_all_strategies(scenario_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Runs Equal Allocation, Fixed Priority, and CrisisGrid AI on the given scenario
    and returns comparative metrics and the recommended winner.
    """
    supply = float(scenario_data.get("supply", 100))

    # 1. Equal Allocation
    agents_equal = build_agents_from_scenario(scenario_data)
    alloc_equal = _allocate_equal(agents_equal, supply)
    metrics_equal = _evaluate_metrics("Equal Allocation", agents_equal, alloc_equal, supply)

    # 2. Fixed Priority
    agents_fixed = build_agents_from_scenario(scenario_data)
    alloc_fixed = _allocate_fixed_priority(agents_fixed, supply)
    metrics_fixed = _evaluate_metrics("Fixed Priority", agents_fixed, alloc_fixed, supply)

    # 3. CrisisGrid AI
    agents_ai = build_agents_from_scenario(scenario_data)
    neg_result = run_negotiation(agents_ai, supply)
    alloc_ai = neg_result["allocation"]
    metrics_ai = _evaluate_metrics("CrisisGrid AI", agents_ai, alloc_ai, supply)

    strategies = [metrics_equal, metrics_fixed, metrics_ai]
    best = max(strategies, key=lambda s: (s["overall_score"], s["operational_services"], -s["safety_violations"]))

    return {
        "scenario": scenario_data.get("name", "Flood"),
        "supply": supply,
        "total_demand": sum(a.demand for a in agents_ai),
        "strategies": strategies,
        "recommended_strategy": best["strategy"],
        "summary": (
            f"{best['strategy']} achieves the highest Overall Score ({best['overall_score']}/100) "
            f"with {best['operational_services']}/4 operational services and {best['safety_violations']} safety violations."
        ),
    }
