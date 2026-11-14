"""
main.py
CrisisGrid AI - FastAPI Backend Entry Point

Endpoints:
- GET /
- GET /health
- GET /scenarios
- POST /simulate
- POST /emergency
- POST /compare-strategies
"""

from typing import Any, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from agent import build_agents_from_scenario
from scenario import DisasterScenario
from negotiation import run_negotiation
from validator import validate_allocation
from dependency import analyze_dependencies
from recommendation import generate_recommendations
from comparison import compare_all_strategies
from models import SimulateRequest, EmergencyRequest, CompareRequest

app = FastAPI(
    title="CrisisGrid AI API",
    description="Autonomous Multi-Agent Disaster Electricity Negotiation & Allocation Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory state manager
scenario_manager = DisasterScenario()
ACTIVE_STATE: Dict[str, Any] = {
    "current_scenario": dict(scenario_manager.get_scenario("Flood")),
    "last_simulation": None,
    "emergency_events_count": 0,
}


def execute_simulation_pipeline(scenario_data: Dict[str, Any], extra_log: str = "") -> Dict[str, Any]:
    """
    Runs the complete CrisisGrid AI multi-agent simulation pipeline:
    1. Instantiate infrastructure agents
    2. Run autonomous negotiation engine
    3. Run safety validator
    4. Run cascading dependency risk analyzer
    5. Run strategic recommendation engine
    """
    supply = float(scenario_data["supply"])
    scenario_name = str(scenario_data.get("name", "Flood"))

    agents = build_agents_from_scenario(scenario_data)
    negotiation_res = run_negotiation(agents, supply)
    validation_res = validate_allocation(agents, supply)
    dependency_res = analyze_dependencies(agents)

    all_warnings = list(validation_res["warnings"]) + list(dependency_res["warnings"])
    logs = list(negotiation_res["logs"])
    if extra_log:
        logs.insert(0, extra_log)

    is_safe = bool(validation_res["safe"] and negotiation_res["feasible"])
    recommendations = generate_recommendations(agents, supply, is_safe, scenario_name)

    total_demand = round(sum(a.demand for a in agents), 2)
    total_min_safe = round(sum(a.minimum_safe for a in agents), 2)
    total_allocated = round(sum(a.allocated_power for a in agents), 2)
    utilization_rate = round((total_allocated / supply) * 100.0, 1) if supply > 0 else 0.0
    services_online = sum(1 for a in agents if a.allocated_power >= a.minimum_safe)

    result = {
        "scenario": scenario_name,
        "supply": supply,
        "total_demand": total_demand,
        "total_minimum_safe": total_min_safe,
        "allocation": negotiation_res["allocation"],
        "agents": [a.status() for a in agents],
        "warnings": all_warnings,
        "dependency_risks": dependency_res["dependency_risks"],
        "logs": logs,
        "safe": is_safe,
        "status_message": negotiation_res["status"],
        "recommendations": recommendations,
        "utilization_rate": utilization_rate,
        "services_online": services_online,
    }

    ACTIVE_STATE["current_scenario"] = dict(scenario_data)
    ACTIVE_STATE["last_simulation"] = result
    return result


# Pre-populate initial Flood simulation on startup
execute_simulation_pipeline(ACTIVE_STATE["current_scenario"])


@app.get("/")
def root() -> Dict[str, Any]:
    return {
        "service": "CrisisGrid AI",
        "status": "operational",
        "active_scenario": ACTIVE_STATE["current_scenario"]["name"],
        "endpoints": [
            "GET /",
            "GET /health",
            "GET /scenarios",
            "POST /simulate",
            "POST /emergency",
            "POST /compare-strategies",
        ],
    }


@app.get("/health")
def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "engine": "CrisisGrid Multi-Agent Negotiation Engine v1.0",
        "active_scenario": ACTIVE_STATE["current_scenario"]["name"],
    }


@app.get("/scenarios")
def get_scenarios() -> Dict[str, Any]:
    return {
        "scenarios": scenario_manager.list_scenarios(),
        "active": ACTIVE_STATE["current_scenario"],
    }


@app.post("/simulate")
def simulate_scenario(payload: SimulateRequest) -> Dict[str, Any]:
    base = scenario_manager.get_scenario(payload.scenario)
    if not base:
        base = {
            "name": payload.scenario or "Custom",
            "supply": 100,
            "hospital": 40,
            "water": 30,
            "emergency": 20,
            "telecom": 30,
        }

    scenario_data = dict(base)
    if payload.supply is not None:
        scenario_data["supply"] = float(payload.supply)
    if payload.hospital is not None:
        scenario_data["hospital"] = float(payload.hospital)
    if payload.water is not None:
        scenario_data["water"] = float(payload.water)
    if payload.emergency is not None:
        scenario_data["emergency"] = float(payload.emergency)
    if payload.telecom is not None:
        scenario_data["telecom"] = float(payload.telecom)

    if payload.scenario.strip().lower() == "custom":
        scenario_manager.update_custom_scenario(
            supply=scenario_data["supply"],
            hospital=scenario_data["hospital"],
            water=scenario_data["water"],
            emergency=scenario_data["emergency"],
            telecom=scenario_data["telecom"],
        )

    ACTIVE_STATE["emergency_events_count"] = 0
    return execute_simulation_pipeline(scenario_data)


@app.post("/emergency")
def trigger_emergency(payload: EmergencyRequest) -> Dict[str, Any]:
    current = dict(ACTIVE_STATE["current_scenario"])
    additional = float(payload.additional_demand if payload.additional_demand is not None else 15.0)
    previous_hospital = float(current["hospital"])
    current["hospital"] = round(previous_hospital + additional, 2)
    ACTIVE_STATE["emergency_events_count"] += 1

    emergency_banner = (
        f"EMERGENCY RENEGOTIATION TRIGGERED (#{ACTIVE_STATE['emergency_events_count']}): "
        f"Hospital trauma surge increased demand by +{additional:.0f} MW "
        f"(from {previous_hospital:.0f} MW to {current['hospital']:.0f} MW)."
    )
    return execute_simulation_pipeline(current, extra_log=emergency_banner)


@app.post("/compare-strategies")
def compare_strategies_endpoint(payload: CompareRequest = CompareRequest()) -> Dict[str, Any]:
    if payload and payload.scenario:
        found = scenario_manager.get_scenario(payload.scenario)
        target_scenario = dict(found) if found else dict(ACTIVE_STATE["current_scenario"])
    else:
        target_scenario = dict(ACTIVE_STATE["current_scenario"])

    if payload.supply is not None:
        target_scenario["supply"] = float(payload.supply)
    if payload.hospital is not None:
        target_scenario["hospital"] = float(payload.hospital)
    if payload.water is not None:
        target_scenario["water"] = float(payload.water)
    if payload.emergency is not None:
        target_scenario["emergency"] = float(payload.emergency)
    if payload.telecom is not None:
        target_scenario["telecom"] = float(payload.telecom)

    return compare_all_strategies(target_scenario)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
