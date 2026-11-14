"""
recommendation.py
CrisisGrid AI - Strategic Recommendation Engine

Generates actionable recommendations including:
- Maintaining hospital allocation
- Renegotiation suggestions
- Cascading dependency and risk mitigation advice
"""

from typing import List
from agent import Agent


def generate_recommendations(
    agents: List[Agent],
    supply: float,
    safe: bool,
    scenario_name: str,
) -> List[str]:
    """
    Produces prioritized operational recommendations based on simulation state.
    """
    recommendations: List[str] = []
    agent_map = {a.name: a for a in agents}

    hospital = agent_map.get("Hospital")
    water = agent_map.get("Water")
    emergency = agent_map.get("Emergency")
    telecom = agent_map.get("Telecom")

    total_demand = sum(a.demand for a in agents)
    total_min_safe = sum(a.minimum_safe for a in agents)

    # 1. Maintain Hospital Allocation
    if hospital:
        if hospital.allocated_power >= hospital.minimum_safe:
            recommendations.append(
                f"Maintain Hospital Allocation: Lock Hospital feed at {hospital.allocated_power:.0f} MW "
                f"(>= {hospital.minimum_safe:.0f} MW safety floor) to protect ICU life-support, trauma operating theaters, and cold-chain storage."
            )
        else:
            deficit = hospital.minimum_safe - hospital.allocated_power
            recommendations.append(
                f"URGENT — Restore Hospital Safety Floor: Immediately dispatch +{deficit:.0f} MW mobile diesel generation "
                f"to bring Hospital from {hospital.allocated_power:.0f} MW up to its {hospital.minimum_safe:.0f} MW minimum safe threshold."
            )

    # 2. Renegotiation Suggestions
    if not safe or total_min_safe > supply:
        shortfall = max(0.0, total_min_safe - supply)
        recommendations.append(
            f"Emergency Renegotiation Required: Grid supply ({supply:.0f} MW) is {shortfall:.0f} MW below aggregate minimum safety ({total_min_safe:.0f} MW). "
            f"Activate microgrid islanding and request {shortfall:.0f} MW emergency interconnect transfer before re-running multi-agent negotiation."
        )
    elif total_demand > supply:
        unmet_total = total_demand - supply
        recommendations.append(
            f"Multi-Agent Renegotiation Advice: {unmet_total:.0f} MW of non-critical demand remains shed. "
            f"Maintain dynamic priority×unmet_need scoring and schedule automated renegotiation every 15 minutes as hospital surge loads fluctuate."
        )
    else:
        recommendations.append(
            "Optimal Equilibrium Reached: All critical infrastructure demands are 100% satisfied. "
            "Reserve excess capacity in spinning battery storage for sudden aftershock or surge events."
        )

    # 3. Dependency & Risk Mitigation Advice
    if water and hospital:
        if water.allocated_power <= water.minimum_safe:
            recommendations.append(
                f"Mitigate [Water → Hospital] Dependency Risk: Water Supply is pinned at {water.allocated_power:.0f} MW. "
                f"Prioritize high-elevation hospital feed valves so surgical sterilization and cooling loops do not lose pressure."
            )

    if telecom and emergency:
        if telecom.allocated_power <= telecom.minimum_safe:
            recommendations.append(
                f"Mitigate [Telecom → Emergency] Dependency Risk: Telecom is at {telecom.allocated_power:.0f} MW. "
                f"Throttle commercial data traffic on cell towers to guarantee 100% bandwidth for Emergency Services first-responder dispatch."
            )

    if emergency and emergency.unmet_need() > 0:
        recommendations.append(
            f"Risk Mitigation ({scenario_name} Scenario): Emergency Services has {emergency.unmet_need():.0f} MW unmet demand. "
            f"Pre-charge fleet backup batteries during low-hospital-surge windows."
        )

    return recommendations
