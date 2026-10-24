"""
NETPULSE - Pydantic Response Models
Course: Probability and Statistics for Computer Science (25CS203)
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class FormulaBreakdown(BaseModel):
    z_formula: str = Field(..., description="Z-score formula with substitutions")
    z_result: str = Field(..., description="Calculated standardized Z-score")
    mean_formula: Optional[str] = Field(None, description="Arithmetic mean formula")
    variance_formula: Optional[str] = Field(None, description="Sample variance formula")
    std_formula: Optional[str] = Field(None, description="Sample standard deviation formula")


class AnalysisResponse(BaseModel):
    mean: float = Field(..., description="Sample mean throughput (μ) in Mbps")
    variance: float = Field(..., description="Sample variance (s²) in (Mbps)² with ddof=1")
    std_dev: float = Field(..., description="Sample standard deviation (s) in Mbps with ddof=1")
    current_load: float = Field(..., description="Observed network load (X) in Mbps")
    z_score: float = Field(..., description="Standardized Z-score: Z = (X - μ) / σ")
    probability: float = Field(..., description="Cumulative probability P(X ≤ x) under Normal distribution")
    exceedance_probability: float = Field(..., description="Exceedance probability P(X ≥ x) under Normal distribution")
    status: str = Field(..., description="Anomaly classification: 'NORMAL', 'UNUSUALLY HIGH', or 'UNUSUALLY LOW'")
    health_score: int = Field(..., description="Application-level Network Health Score (0 - 100)")
    health_band: str = Field(..., description="Operational status band: 'Excellent', 'Healthy', 'Warning', 'Poor', 'Critical'")
    explanation: str = Field(..., description="Beginner-friendly step-by-step natural language explanation")
    formula_breakdown: FormulaBreakdown = Field(..., description="Detailed formula substitution breakdown")


class ProbabilityResponse(BaseModel):
    calculation_type: str = Field(..., description="Calculation region: 'below', 'above', or 'between'")
    probability: float = Field(..., description="Calculated normal probability value in [0, 1]")
    percentage: float = Field(..., description="Probability expressed as a percentage in [0, 100]%")
    z_lower: Optional[float] = Field(None, description="Standardized Z-score for lower bound")
    z_upper: Optional[float] = Field(None, description="Standardized Z-score for upper bound")
    interpretation: str = Field(..., description="Deterministic educational interpretation")


class CurvePoint(BaseModel):
    x: float = Field(..., description="Throughput value on X-axis (Mbps)")
    pdf: float = Field(..., description="Probability Density Function f(x) height")


class SimulationResponse(BaseModel):
    current_load: float = Field(..., description="Simulated load in Mbps")
    z_score: float = Field(..., description="Standardized Z-score")
    probability: float = Field(..., description="Cumulative normal probability P(X ≤ x)")
    status: str = Field(..., description="Anomaly classification status")
    health_score: int = Field(..., description="Network Health Score (0 - 100)")
    health_band: str = Field(..., description="Operational band")
    curve_points: List[CurvePoint] = Field(..., description="Coordinates along Gaussian bell curve for charting")
    markers: Dict[str, Any] = Field(..., description="Markers for μ, ±1σ, ±2σ, ±3σ, and current load")


class GameCheckAnswerResponse(BaseModel):
    is_correct: bool = Field(..., description="Whether user's answer matched statistical ground truth")
    correct_answer: str = Field(..., description="Ground truth answer string")
    ground_truth: Dict[str, Any] = Field(..., description="Full ground truth statistical metrics from backend engine")
    xp_awarded: int = Field(..., description="Experience points awarded")
    explanation: str = Field(..., description="Step-by-step academic explanation")
    technical_analysis: Dict[str, Any] = Field(..., description="Golden Bridge payload to load scenario in Technical Lab")


class DatasetRecord(BaseModel):
    timestamp: str = Field(..., description="Observation timestamp (HH:MM)")
    network_load: float = Field(..., description="Observed load in Mbps")


class DatasetResponse(BaseModel):
    name: str = Field(..., description="Dataset name identifier")
    total_records: int = Field(..., description="Number of telemetry observations")
    mean: float = Field(..., description="Sample mean (μ)")
    variance: float = Field(..., description="Sample variance (s², ddof=1)")
    std_dev: float = Field(..., description="Sample standard deviation (s, ddof=1)")
    min: float = Field(..., description="Minimum throughput observed")
    max: float = Field(..., description="Maximum throughput observed")
    data: List[DatasetRecord] = Field(..., description="Complete time-series telemetry records")


class ScenariosListResponse(BaseModel):
    total_scenarios: int = Field(..., description="Count of active challenge scenarios")
    scenarios: List[Dict[str, Any]] = Field(..., description="List of game and triage scenarios")
