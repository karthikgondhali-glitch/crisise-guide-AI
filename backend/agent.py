"""
agent.py
CrisisGrid AI - Disaster Electricity Allocation Simulation - Agent Module

Defines the Agent class representing a critical infrastructure sector
(Hospital, Water, Emergency, Telecom) competing and negotiating for
limited electrical power during a disaster scenario.
"""

from typing import Dict, Union


class Agent:
    """
    Represents an infrastructure agent in a disaster electricity allocation simulation.

    Attributes:
        name (str): Identifier for the infrastructure agent (e.g., "Hospital").
        demand (int | float): Total power required for full nominal operation (MW).
        minimum_safe (int | float): Minimum power threshold required to operate safely (MW).
        priority (int): Criticality ranking (higher value indicates higher priority).
        allocated_power (int | float): Amount of power currently allocated to the agent (MW).
    """

    def __init__(
        self,
        name: str,
        demand: Union[int, float],
        minimum_safe: Union[int, float],
        priority: int,
        allocated_power: Union[int, float] = 0,
    ) -> None:
        self.name = name
        self.demand = float(demand)
        self.minimum_safe = float(minimum_safe)
        self.priority = int(priority)
        self.allocated_power = float(allocated_power)

    def unmet_need(self) -> float:
        """
        Calculates the remaining power needed to reach full demand.

        Returns:
            max(0.0, demand - allocated_power)
        """
        return round(max(0.0, self.demand - self.allocated_power), 2)

    def evaluate_proposal(self, power: Union[int, float]) -> str:
        """
        Evaluates a proposed power allocation against the agent's minimum safe threshold.

        Args:
            power: Proposed amount of power to allocate.

        Returns:
            "ACCEPT" if power >= minimum_safe, otherwise "REJECT".
        """
        if power >= self.minimum_safe:
            return "ACCEPT"
        return "REJECT"

    def status(self) -> Dict[str, Union[str, int, float]]:
        """
        Returns a dictionary snapshot of the agent's current attributes and state.
        """
        return {
            "name": self.name,
            "demand": round(self.demand, 2),
            "minimum_safe": round(self.minimum_safe, 2),
            "priority": self.priority,
            "allocated_power": round(self.allocated_power, 2),
            "unmet_demand": self.unmet_need(),
            "proposal_evaluation": self.evaluate_proposal(self.allocated_power),
            "is_safe": self.allocated_power >= self.minimum_safe,
        }


def build_agents_from_scenario(scenario_data: Dict[str, Union[str, int, float]]) -> list[Agent]:
    """
    Constructs the four core infrastructure agents from a scenario dictionary.
    """
    hospital_demand = float(scenario_data.get("hospital", 40))
    water_demand = float(scenario_data.get("water", 30))
    emergency_demand = float(scenario_data.get("emergency", 20))
    telecom_demand = float(scenario_data.get("telecom", 30))

    # Standard minimum safe baselines (scaled down only if custom demand is set lower than baseline)
    hospital_min = min(hospital_demand, float(scenario_data.get("hospital_min", 30)))
    water_min = min(water_demand, float(scenario_data.get("water_min", 20)))
    emergency_min = min(emergency_demand, float(scenario_data.get("emergency_min", 15)))
    telecom_min = min(telecom_demand, float(scenario_data.get("telecom_min", 15)))

    return [
        Agent(name="Hospital", demand=hospital_demand, minimum_safe=hospital_min, priority=10),
        Agent(name="Water", demand=water_demand, minimum_safe=water_min, priority=8),
        Agent(name="Emergency", demand=emergency_demand, minimum_safe=emergency_min, priority=9),
        Agent(name="Telecom", demand=telecom_demand, minimum_safe=telecom_min, priority=7),
    ]
