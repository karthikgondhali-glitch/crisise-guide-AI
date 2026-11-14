"""
validator.py
CrisisGrid AI - Safety Validator Module

Verifies:
- allocation >= minimum_safe for every critical infrastructure service
- total allocation <= available supply
Generates detailed safety warnings.
"""

from typing import Any, Dict, List
from agent import Agent


def validate_allocation(agents: List[Agent], supply: float) -> Dict[str, Any]:
    """
    Validates whether the current power allocation meets all safety constraints.
    """
    warnings: List[str] = []
    safe = True

    total_allocated = round(sum(a.allocated_power for a in agents), 2)
    total_min_safe = round(sum(a.minimum_safe for a in agents), 2)

    if total_min_safe > supply:
        safe = False
        warnings.append(
            f"No Safe Allocation Possible: Aggregate minimum safe demand ({total_min_safe:.0f} MW) "
            f"exceeds total grid supply ({supply:.0f} MW)."
        )

    if total_allocated > supply + 1e-6:
        safe = False
        warnings.append(
            f"Grid Overload Violation: Total allocated power ({total_allocated:.1f} MW) "
            f"exceeds available supply ({supply:.1f} MW)."
        )

    for agent in agents:
        if agent.allocated_power < agent.minimum_safe:
            safe = False
            deficit = agent.minimum_safe - agent.allocated_power
            warnings.append(
                f"Safety Threshold Violation: {agent.name} received {agent.allocated_power:.1f} MW, "
                f"which is {deficit:.1f} MW below its minimum safe threshold of {agent.minimum_safe:.1f} MW."
            )
        elif agent.allocated_power == agent.minimum_safe and agent.demand > agent.minimum_safe:
            warnings.append(
                f"Zero Safety Margin: {agent.name} is operating strictly at its minimum safe floor "
                f"({agent.minimum_safe:.0f} MW) with {agent.unmet_need():.0f} MW unmet nominal demand."
            )

    return {
        "safe": safe,
        "total_allocated": total_allocated,
        "warnings": warnings,
    }
