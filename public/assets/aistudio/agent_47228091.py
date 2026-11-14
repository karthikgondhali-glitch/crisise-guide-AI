"""
agent.py
Disaster Electricity Allocation Simulation - Agent Module

Defines the Agent class representing a critical infrastructure sector
(e.g., Hospital, Water, Emergency, Telecom) competing or negotiating
for limited electrical power during a disaster scenario.
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
        """
        Initializes a new Agent instance.

        Args:
            name: Name of the agent.
            demand: Optimal power demand required by the agent.
            minimum_safe: Minimum safe operating power threshold.
            priority: Priority score for allocation decisions.
            allocated_power: Initial power allocated to the agent (defaults to 0).
        """
        self.name = name
        self.demand = demand
        self.minimum_safe = minimum_safe
        self.priority = priority
        self.allocated_power = allocated_power

    def unmet_need(self) -> Union[int, float]:
        """
        Calculates the remaining power needed to reach full demand.

        Returns:
            demand - allocated_power
        """
        return self.demand - self.allocated_power

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

        Returns:
            Dictionary containing name, demand, minimum_safe, priority, and allocated_power.
        """
        return {
            "name": self.name,
            "demand": self.demand,
            "minimum_safe": self.minimum_safe,
            "priority": self.priority,
            "allocated_power": self.allocated_power,
        }


# =====================================================================
# Sample Agents & Test Section
# =====================================================================
if __name__ == "__main__":
    # Create the four sample infrastructure agents with specified parameters
    hospital = Agent(name="Hospital", demand=40, minimum_safe=30, priority=10)
    water = Agent(name="Water", demand=30, minimum_safe=20, priority=8)
    emergency = Agent(name="Emergency", demand=20, minimum_safe=15, priority=9)
    telecom = Agent(name="Telecom", demand=30, minimum_safe=15, priority=7)

    # Group all sample agents into a list for testing
    agents = [hospital, water, emergency, telecom]

    # Print the status of all agents
    print("=== Disaster Electricity Allocation: Initial Agent Status ===")
    for agent in agents:
        print(agent.status())

    # Optional verification of unmet_need() and evaluate_proposal()
    print("\n=== Proposal Evaluation & Unmet Need Check ===")
    for agent in agents:
        sample_proposal = 20
        decision = agent.evaluate_proposal(sample_proposal)
        print(
            f"{agent.name:<10} | Unmet Need: {agent.unmet_need():>2} MW | "
            f"Proposal ({sample_proposal} MW): {decision}"
        )
