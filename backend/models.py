"""
models.py
CrisisGrid AI - Pydantic Request and Response Models
"""

from typing import Dict, List, Optional, Union
from pydantic import BaseModel, Field


class SimulateRequest(BaseModel):
    scenario: str = Field(default="Flood", description="Scenario name: Flood, Earthquake, Power Shortage, or Custom")
    supply: Optional[float] = Field(default=None, description="Optional override for available supply (MW)")
    hospital: Optional[float] = Field(default=None, description="Optional override for Hospital demand (MW)")
    water: Optional[float] = Field(default=None, description="Optional override for Water demand (MW)")
    emergency: Optional[float] = Field(default=None, description="Optional override for Emergency demand (MW)")
    telecom: Optional[float] = Field(default=None, description="Optional override for Telecom demand (MW)")


class EmergencyRequest(BaseModel):
    additional_demand: float = Field(default=15.0, description="Additional emergency Hospital demand in MW")
    scenario: Optional[str] = Field(default=None, description="Optional scenario name context")


class CompareRequest(BaseModel):
    scenario: Optional[str] = Field(default=None, description="Scenario to compare strategies on")
    supply: Optional[float] = None
    hospital: Optional[float] = None
    water: Optional[float] = None
    emergency: Optional[float] = None
    telecom: Optional[float] = None


class AgentDetail(BaseModel):
    name: str
    demand: float
    minimum_safe: float
    priority: int
    allocated_power: float
    unmet_demand: float
    proposal_evaluation: str
    is_safe: bool


class DependencyRisk(BaseModel):
    source: str
    target: str
    relationship: str
    status: str
    severity: str
    message: str


class SimulationResponse(BaseModel):
    scenario: str
    supply: float
    total_demand: float
    total_minimum_safe: float
    allocation: Dict[str, float]
    agents: List[AgentDetail]
    warnings: List[str]
    dependency_risks: List[DependencyRisk]
    logs: List[str]
    safe: bool
    status_message: str
    recommendations: List[str]
    utilization_rate: float
    services_online: int
