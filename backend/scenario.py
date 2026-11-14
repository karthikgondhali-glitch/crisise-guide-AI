"""
scenario.py
CrisisGrid AI - Disaster Scenario Management Module

Defines the DisasterScenario class which manages predefined disaster scenarios
(Flood, Earthquake, Power Shortage, Custom) and returns scenario parameters.
"""

from typing import Dict, List, Optional, Union


class DisasterScenario:
    """
    Manages predefined and custom disaster electricity scenarios for CrisisGrid AI.
    """

    def __init__(self) -> None:
        self._scenarios: Dict[str, Dict[str, Union[str, int, float]]] = {
            "Flood": {
                "name": "Flood",
                "description": "Severe coastal flooding submerges secondary substation transformers. High hospital and water pumping demand.",
                "supply": 100,
                "hospital": 40,
                "water": 30,
                "emergency": 20,
                "telecom": 30,
            },
            "Earthquake": {
                "name": "Earthquake",
                "description": "Magnitude 7.1 seismic event damages main transmission lines. Surge in trauma care and emergency dispatch.",
                "supply": 80,
                "hospital": 45,
                "water": 35,
                "emergency": 30,
                "telecom": 25,
            },
            "Power Shortage": {
                "name": "Power Shortage",
                "description": "Regional generation failure causes severe grid brownout below aggregate minimum safety thresholds.",
                "supply": 60,
                "hospital": 40,
                "water": 30,
                "emergency": 20,
                "telecom": 30,
            },
            "Custom": {
                "name": "Custom",
                "description": "User-configured disaster simulation parameters for stress-testing autonomous multi-agent negotiation.",
                "supply": 95,
                "hospital": 42,
                "water": 28,
                "emergency": 22,
                "telecom": 26,
            },
        }

    def get_scenario(self, name: str) -> Optional[Dict[str, Union[str, int, float]]]:
        """
        Retrieves a specific disaster scenario by name as a dictionary.
        """
        if name in self._scenarios:
            return dict(self._scenarios[name])

        normalized = name.strip().lower()
        for key, data in self._scenarios.items():
            if key.lower() == normalized:
                return dict(data)

        return None

    def update_custom_scenario(
        self,
        supply: Union[int, float],
        hospital: Union[int, float],
        water: Union[int, float],
        emergency: Union[int, float],
        telecom: Union[int, float],
        name: str = "Custom",
    ) -> Dict[str, Union[str, int, float]]:
        """
        Updates or registers custom scenario parameters.
        """
        custom_data: Dict[str, Union[str, int, float]] = {
            "name": name,
            "description": "User-defined custom disaster scenario parameters.",
            "supply": float(supply),
            "hospital": float(hospital),
            "water": float(water),
            "emergency": float(emergency),
            "telecom": float(telecom),
        }
        self._scenarios["Custom"] = custom_data
        return dict(custom_data)

    def list_scenarios(self) -> List[Dict[str, Union[str, int, float]]]:
        """
        Returns a list of all available disaster scenarios.
        """
        return [dict(scenario) for scenario in self._scenarios.values()]
