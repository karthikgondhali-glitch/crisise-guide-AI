"""
negotiation.py
CrisisGrid AI - Autonomous Multi-Agent Negotiation Engine

Algorithm:
1. Allocate minimum safe power to each agent.
2. Check feasibility:
   If total minimum safe > supply:
   Record "No Safe Allocation Possible" and perform priority-based emergency rationing.
3. Allocate remaining power iteratively using:
   score = priority * unmet_demand
4. Highest score receives power unit until no supply remains or all demands are met.
5. Generate rich, step-by-step negotiation logs for the timeline view.
"""

from typing import Any, Dict, List
from agent import Agent


def run_negotiation(agents: List[Agent], supply: float) -> Dict[str, Any]:
    """
    Executes the multi-agent electricity negotiation protocol.
    """
    logs: List[str] = []
    total_demand = sum(a.demand for a in agents)
    total_min_safe = sum(a.minimum_safe for a in agents)

    logs.append(
        f"Grid Controller initialized negotiation: Available Supply = {supply:.0f} MW, "
        f"Total Demand = {total_demand:.0f} MW, Minimum Safe Threshold = {total_min_safe:.0f} MW."
    )

    for a in agents:
        logs.append(
            f"{a.name} Agent requests {a.demand:.0f} MW (Minimum Safe: {a.minimum_safe:.0f} MW, Priority: {a.priority})."
        )

    # Step 1 & 2: Check feasibility against total minimum safe power
    if total_min_safe > supply:
        logs.append(
            f"CRITICAL DEFICIT: Aggregate minimum safe requirement ({total_min_safe:.0f} MW) "
            f"exceeds available grid supply ({supply:.0f} MW) by {total_min_safe - supply:.0f} MW."
        )
        logs.append("No Safe Allocation Possible")

        # Perform emergency priority-based rationing of available supply so grid power is utilized
        remaining = float(supply)
        sorted_by_priority = sorted(agents, key=lambda x: x.priority, reverse=True)
        for a in sorted_by_priority:
            allocated = min(a.minimum_safe, remaining)
            a.allocated_power = round(allocated, 2)
            remaining = round(max(0.0, remaining - allocated), 2)
            decision = a.evaluate_proposal(a.allocated_power)
            logs.append(
                f"Emergency Rationing -> {a.name} allocated {a.allocated_power:.0f} MW "
                f"(Min Safe: {a.minimum_safe:.0f} MW) — Agent Decision: {decision}."
            )

        allocation_map = {a.name: round(a.allocated_power, 2) for a in agents}
        return {
            "status": "No Safe Allocation Possible",
            "feasible": False,
            "allocation": allocation_map,
            "logs": logs,
            "remaining_supply": remaining,
        }

    # Feasible: Step 1 - Allocate minimum safe power to all agents
    remaining_supply = float(supply)
    for a in agents:
        a.allocated_power = float(a.minimum_safe)
        remaining_supply -= a.minimum_safe

    remaining_supply = round(max(0.0, remaining_supply), 2)
    logs.append(
        f"Phase 1 Baseline Complete: All 4 critical services secured minimum safe power "
        f"({total_min_safe:.0f} MW allocated, {remaining_supply:.0f} MW surplus remaining for negotiation)."
    )

    # Step 3, 4, 5: Allocate remaining power using score = priority * unmet_demand
    if remaining_supply <= 0:
        logs.append(
            "Zero surplus power remaining after baseline safety allocation. All agents hold at minimum safe levels."
        )
    else:
        logs.append(
            f"Phase 2 Dynamic Negotiation started for {remaining_supply:.0f} MW surplus using utility function: "
            "score = priority × unmet_demand."
        )

    round_Step = 0
    bonus_tracker: Dict[str, float] = {a.name: 0.0 for a in agents}

    while remaining_supply > 0:
        # Filter agents with unmet need > 0
        candidates = [a for a in agents if a.unmet_need() > 0]
        if not candidates:
            logs.append("All infrastructure agents have reached 100% nominal demand.")
            break

        # Calculate score = priority * unmet_demand for each candidate
        scored_candidates = sorted(
            candidates,
            key=lambda a: (a.priority * a.unmet_need(), a.priority),
            reverse=True,
        )
        winner = scored_candidates[0]
        top_score = winner.priority * winner.unmet_need()

        step_power = min(1.0, remaining_supply, winner.unmet_need())
        winner.allocated_power = round(winner.allocated_power + step_power, 2)
        remaining_supply = round(remaining_supply - step_power, 2)
        bonus_tracker[winner.name] = round(bonus_tracker[winner.name] + step_power, 2)
        round_Step += 1

        # Log key negotiation milestones to keep logs informative and readable
        if round_Step == 1 or round_Step % 5 == 0 or remaining_supply == 0:
            runner_up_info = ""
            if len(scored_candidates) > 1:
                ru = scored_candidates[1]
                runner_up_info = f" vs {ru.name} (score {ru.priority * ru.unmet_need():.0f})"
            logs.append(
                f"Round {round_Step}: {winner.name} wins +{step_power:.0f} MW "
                f"[score = {winner.priority} × {winner.unmet_need() + step_power:.0f} = {top_score:.0f}{runner_up_info}] "
                f"→ Now at {winner.allocated_power:.0f}/{winner.demand:.0f} MW."
            )

    for a in agents:
        decision = a.evaluate_proposal(a.allocated_power)
        flexibility_note = (
            "full nominal capacity achieved"
            if a.unmet_need() == 0
            else f"offers {a.unmet_need():.0f} MW load flexibility above safety floor"
        )
        logs.append(
            f"{a.name} reviews final proposal ({a.allocated_power:.0f} MW): {decision} — {flexibility_note}."
        )

    logs.append("Autonomous multi-agent negotiation completed successfully.")

    allocation_map = {a.name: round(a.allocated_power, 2) for a in agents}
    return {
        "status": "Safe Allocation Achieved",
        "feasible": True,
        "allocation": allocation_map,
        "logs": logs,
        "remaining_supply": remaining_supply,
    }
