"""
dependency.py
CrisisGrid AI - Infrastructure Dependency Risk Engine

Models critical inter-sector dependencies:
- Telecom -> Emergency (Emergency dispatch & coordination rely on Telecom network)
- Water -> Hospital (Hospital sterilization, cooling & sanitation rely on Water supply)

Generates cascading-failure warnings and structured dependency risk assessments.
"""

from typing import Any, Dict, List
from agent import Agent


def analyze_dependencies(agents: List[Agent]) -> Dict[str, Any]:
    """
    Evaluates cascading failure risks across dependent infrastructure services.
    """
    agent_map: Dict[str, Agent] = {a.name: a for a in agents}
    cascading_warnings: List[str] = []
    dependency_risks: List[Dict[str, str]] = []

    # Dependency 1: Telecom -> Emergency
    telecom = agent_map.get("Telecom")
    emergency = agent_map.get("Emergency")
    if telecom and emergency:
        if telecom.allocated_power < telecom.minimum_safe:
            msg = (
                f"CASCADING FAILURE RISK [Telecom → Emergency]: Telecom is below minimum safe power "
                f"({telecom.allocated_power:.0f}/{telecom.minimum_safe:.0f} MW). Emergency dispatch and "
                f"first-responder communications face immediate blackout even if Emergency holds {emergency.allocated_power:.0f} MW."
            )
            cascading_warnings.append(msg)
            dependency_risks.append({
                "source": "Telecom",
                "target": "Emergency",
                "relationship": "Telecom → Emergency",
                "status": "CRITICAL CASCADE RISK",
                "severity": "critical",
                "message": msg,
            })
        elif telecom.allocated_power < telecom.demand * 0.65:
            msg = (
                f"DEGRADED DEPENDENCY [Telecom → Emergency]: Telecom operating at reduced capacity "
                f"({telecom.allocated_power:.0f}/{telecom.demand:.0f} MW). Cell tower load-shedding may "
                f"increase 911 dispatch latency for Emergency Services."
            )
            cascading_warnings.append(msg)
            dependency_risks.append({
                "source": "Telecom",
                "target": "Emergency",
                "relationship": "Telecom → Emergency",
                "status": "LATENCY WARNING",
                "severity": "warning",
                "message": msg,
            })
        else:
            dependency_risks.append({
                "source": "Telecom",
                "target": "Emergency",
                "relationship": "Telecom → Emergency",
                "status": "NOMINAL LINK",
                "severity": "safe",
                "message": (
                    f"Telecom backbone stable at {telecom.allocated_power:.0f} MW; "
                    f"Emergency dispatch channels fully operational."
                ),
            })

    # Dependency 2: Water -> Hospital
    water = agent_map.get("Water")
    hospital = agent_map.get("Hospital")
    if water and hospital:
        if water.allocated_power < water.minimum_safe:
            msg = (
                f"CASCADING FAILURE RISK [Water → Hospital]: Water Supply is below minimum safe power "
                f"({water.allocated_power:.0f}/{water.minimum_safe:.0f} MW). Loss of water pressure compromises "
                f"Hospital surgical sterilization, HVAC cooling, and ICU sanitation despite Hospital receiving {hospital.allocated_power:.0f} MW."
            )
            cascading_warnings.append(msg)
            dependency_risks.append({
                "source": "Water",
                "target": "Hospital",
                "relationship": "Water → Hospital",
                "status": "CRITICAL CASCADE RISK",
                "severity": "critical",
                "message": msg,
            })
        elif water.allocated_power < water.demand * 0.75:
            msg = (
                f"PRESSURE BUFFER WARNING [Water → Hospital]: Water pumping at {water.allocated_power:.0f}/{water.demand:.0f} MW "
                f"(minimum safe floor). Secondary booster pumps offline; Hospital must monitor backup water reserve tanks."
            )
            cascading_warnings.append(msg)
            dependency_risks.append({
                "source": "Water",
                "target": "Hospital",
                "relationship": "Water → Hospital",
                "status": "BUFFER THIN",
                "severity": "warning",
                "message": msg,
            })
        else:
            dependency_risks.append({
                "source": "Water",
                "target": "Hospital",
                "relationship": "Water → Hospital",
                "status": "NOMINAL LINK",
                "severity": "safe",
                "message": (
                    f"Water treatment and pressurization stable at {water.allocated_power:.0f} MW; "
                    f"Hospital critical water feed secured."
                ),
            })

    return {
        "warnings": cascading_warnings,
        "dependency_risks": dependency_risks,
    }
