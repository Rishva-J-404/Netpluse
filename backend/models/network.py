"""
NETPULSE - Pydantic Request Models
Course: Probability and Statistics for Computer Science (25CS203)
"""

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class NetworkLoadRequest(BaseModel):
    network_load: float = Field(
        ...,
        ge=0.0,
        description="Observed network throughput/load in Mbps (must be non-negative)",
        examples=[62.0]
    )
    dataset: Optional[str] = Field(
        default="campus_network",
        description="Dataset identifier (default: 'campus_network')",
        examples=["campus_network"]
    )
    custom_data: Optional[List[float]] = Field(
        default=None,
        description="Optional custom telemetry sample series (must contain at least 2 numeric values if provided)",
        examples=[[42.0, 48.0, 50.0, 52.0, 58.0, 62.0]]
    )

    @field_validator("custom_data")
    @classmethod
    def validate_custom_data(cls, v):
        if v is not None:
            if len(v) == 0:
                raise ValueError("Custom telemetry data cannot be an empty list.")
            for val in v:
                if val < 0:
                    raise ValueError(f"Telemetry load values must be non-negative: {val}")
        return v


class ProbabilityRequest(BaseModel):
    mean: float = Field(
        ...,
        description="Baseline distribution mean (μ) in Mbps",
        examples=[50.0]
    )
    std_dev: float = Field(
        ...,
        gt=0.0,
        description="Baseline standard deviation (σ > 0) in Mbps",
        examples=[5.0]
    )
    lower_val: Optional[float] = Field(
        default=None,
        description="Lower bound (a) for interval P(a ≤ X ≤ b) or upper tail P(X ≥ a)",
        examples=[40.0]
    )
    upper_val: Optional[float] = Field(
        default=None,
        description="Upper bound (b) for interval P(a ≤ X ≤ b) or lower tail P(X ≤ b)",
        examples=[60.0]
    )
    calculation_type: str = Field(
        default="below",
        description="Probability region: 'below' (X ≤ b), 'above' (X ≥ a), or 'between' (a ≤ X ≤ b)",
        examples=["below", "above", "between"]
    )

    @field_validator("calculation_type")
    @classmethod
    def validate_calc_type(cls, v):
        allowed = {"below", "above", "between"}
        normalized = v.lower().strip()
        if normalized not in allowed:
            raise ValueError(f"Invalid calculation_type '{v}'. Must be one of: {sorted(allowed)}")
        return normalized


class SimulationRequest(BaseModel):
    current_load: float = Field(
        ...,
        ge=0.0,
        description="Simulated network load in Mbps",
        examples=[62.0]
    )
    mean: Optional[float] = Field(
        default=50.0,
        description="Baseline mean throughput",
        examples=[50.0]
    )
    std_dev: Optional[float] = Field(
        default=5.0,
        gt=0.0,
        description="Baseline standard deviation (must be strictly positive)",
        examples=[5.0]
    )


class GameCheckAnswerRequest(BaseModel):
    game_id: str = Field(
        ...,
        description="Identifier of game: 'traffic_controller', 'zscore_challenge', 'normal_curve', 'anomaly_hunter', 'emergency_mission'",
        examples=["traffic_controller"]
    )
    scenario_id: str = Field(
        ...,
        description="Unique scenario identifier",
        examples=["traffic_controller_01"]
    )
    user_decision: Optional[str] = Field(
        default=None,
        description="Decision option or answer string selected by the player",
        examples=["Emergency Response"]
    )
    user_z_score: Optional[float] = Field(
        default=None,
        description="Player-calculated Z-score value",
        examples=[2.4]
    )
    step: Optional[int] = Field(
        default=None,
        description="Stage/step index for multi-step mission workflows (e.g. 1, 2, 3)",
        examples=[1]
    )
