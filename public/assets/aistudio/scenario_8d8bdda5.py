"""
scenario.py
CrisisGrid AI - Disaster Scenario Management Module

Defines the DisasterScenario class which manages predefined disaster scenarios
(Flood, Earthquake, Power Shortage) and returns scenario parameters—including
available electricity supply and sector-specific power demands—as clean
Python dictionaries.
"""

from typing import Dict, List, Optional, Union

ScenarioDict = Dict[str, Union[str, int, float, Dict[str, int]]]


class DisasterScenario:
    """
    Manages predefined disaster electricity scenarios for CrisisGrid AI.

    Each scenario contains:
        - name (str): Scenario name ("Flood", "Earthquake", "Power Shortage")
        - supply (int): Available electricity supply (MW)
        - hospital (int): Hospital power demand (MW)
        - water (int): Water infrastructure power demand (MW)
        - emergency (int): Emergency services power demand (MW)
        - telecom (int): Telecommunications power demand (MW)
    """

    def __init__(self) -> None:
        """
        Initializes the DisasterScenario manager with the three predefined
        CrisisGrid AI disaster scenarios.
        """
        self._scenarios: Dict[str, Dict[str, Union[str, int]]] = {
            "Flood": {
                "name": "Flood",
                "supply": 100,
                "hospital": 40,
                "water": 30,
                "emergency": 20,
                "telecom": 30,
            },
            "Earthquake": {
                "name": "Earthquake",
                "supply": 80,
                "hospital": 45,
                "water": 35,
                "emergency": 30,
                "telecom": 25,
            },
            "Power Shortage": {
                "name": "Power Shortage",
                "supply": 60,
                "hospital": 40,
                "water": 30,
                "emergency": 20,
                "telecom": 30,
            },
        }

    def get_scenario(self, name: str) -> Optional[Dict[str, Union[str, int]]]:
        """
        Retrieves a specific disaster scenario by name as a clean Python dictionary.
        Performs a case-insensitive lookup if an exact match is not found.

        Args:
            name (str): Name of the scenario (e.g., "Flood", "Earthquake", "Power Shortage").

        Returns:
            dict | None: A dictionary containing the scenario's name, supply, and
            sector demands (hospital, water, emergency, telecom), or None if not found.
        """
        # Direct match check
        if name in self._scenarios:
            return dict(self._scenarios[name])

        # Case-insensitive fallback check
        normalized = name.strip().lower()
        for key, data in self._scenarios.items():
            if key.lower() == normalized:
                return dict(data)

        return None

    def list_scenarios(self) -> List[Dict[str, Union[str, int]]]:
        """
        Returns a list of all available disaster scenarios as clean Python dictionaries.

        Returns:
            list[dict]: List of dictionaries for all predefined scenarios.
        """
        return [dict(scenario) for scenario in self._scenarios.values()]


# =====================================================================
# Test Section
# =====================================================================
if __name__ == "__main__":
    # Instantiate the DisasterScenario manager
    scenario_manager = DisasterScenario()

    # 1. Print all available scenarios using list_scenarios()
    print("=== CrisisGrid AI: All Available Disaster Scenarios ===")
    for scenario in scenario_manager.list_scenarios():
        print(scenario)

    # 2. Verify retrieving individual scenarios using get_scenario(name)
    print("\n=== CrisisGrid AI: Individual Scenario Lookup Test ===")
    for scenario_name in ["Flood", "Earthquake", "Power Shortage"]:
        details = scenario_manager.get_scenario(scenario_name)
        total_demand = (
            details["hospital"]
            + details["water"]
            + details["emergency"]
            + details["telecom"]
        )
        deficit = total_demand - details["supply"]
        print(
            f"{details['name']:<15} | Supply: {details['supply']:>3} MW | "
            f"Total Demand: {total_demand:>3} MW | Deficit: {deficit:>2} MW | "
            f"Data: {details}"
        )
