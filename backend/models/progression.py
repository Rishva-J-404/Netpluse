"""
NETPULSE - Progression, Leaderboard & History Models
Course: Probability and Statistics for Computer Science (25CS203)
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class GameCompletionRequest(BaseModel):
    game_id: str = Field(..., description="Educational game identifier (e.g. traffic_controller, zscore_challenge)")
    scenario_id: str = Field(..., description="Curriculum scenario identifier")
    user_decision: Optional[str] = Field(default=None, description="Categorical or textual answer submitted by student")
    user_z_score: Optional[float] = Field(default=None, description="Numeric standard score calculated by student")
    step: Optional[int] = Field(default=None, description="Mission step number for multi-step emergencies")
    idempotency_key: Optional[str] = Field(default=None, description="Unique client-generated completion UUID to prevent duplicate rewards")


class UnlockedAchievement(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    xp_reward: int


class GameCompletionResponse(BaseModel):
    is_correct: bool
    score: int
    accuracy: float
    xp_awarded: int
    total_xp: int
    level: int
    correct_answer: str
    ground_truth: Dict[str, Any]
    explanation: str
    technical_analysis: Dict[str, Any]
    newly_unlocked_achievements: List[UnlockedAchievement] = []
    already_completed: bool = False


class SaveAnalysisRequest(BaseModel):
    network_load: float = Field(..., ge=0.0, description="Observed throughput in Mbps")
    dataset: Optional[str] = Field(default="campus_network", description="Dataset identifier")
    custom_data: Optional[List[float]] = Field(default=None, description="Optional custom telemetry observations")


class SaveAnalysisResponse(BaseModel):
    history_id: str
    saved: bool
    analysis: Dict[str, Any]
    newly_unlocked_achievements: List[UnlockedAchievement] = []


class AnalysisHistoryItem(BaseModel):
    id: str
    dataset_name: str
    current_load: float
    mean: float
    variance: float
    std_deviation: float
    z_score: float
    probability: float
    status: str
    health_score: int
    created_at: str


class AnalysisHistoryResponse(BaseModel):
    records: List[AnalysisHistoryItem]
    total_count: int


class ProgressionResponse(BaseModel):
    user_id: str
    username: str
    level: int
    total_xp: int
    games_completed_count: int
    achievements_count: int
    analyses_count: int
    unlocked_achievements: List[str] = []


class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    level: int
    total_xp: int


class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]
    total_count: int
