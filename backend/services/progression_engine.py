"""
NETPULSE - Progression Engine & Achievement Rule Matrix
Course: Probability and Statistics for Computer Science (25CS203)
"""

from typing import Dict, Any, List, Set, Tuple, Optional


ACHIEVEMENTS_CATALOG = [
    {
        "id": "first_analysis",
        "name": "First Telemetry Analysis",
        "description": "Execute your first network load statistical analysis through the FastAPI statistical engine.",
        "icon": "Activity",
        "xp_reward": 50
    },
    {
        "id": "zscore_master",
        "name": "Z-Score Standardization Master",
        "description": "Calculate 5 standardized Z-scores with 100% mathematical accuracy.",
        "icon": "Target",
        "xp_reward": 100
    },
    {
        "id": "distribution_explorer",
        "name": "Gaussian Bell Explorer",
        "description": "Investigate all standard deviation intervals (±1σ, ±2σ, ±3σ) on the Gaussian probability curve.",
        "icon": "Compass",
        "xp_reward": 75
    },
    {
        "id": "anomaly_hunter",
        "name": "Outlier Sentinel",
        "description": "Identify and isolate 3 empirical burst anomalies (|Z| > 2.0) in raw campus telemetry.",
        "icon": "AlertTriangle",
        "xp_reward": 100
    },
    {
        "id": "probability_master",
        "name": "Cumulative Probability Solver",
        "description": "Evaluate 5 cumulative tail and interval probability queries using SciPy norm.cdf().",
        "icon": "Percent",
        "xp_reward": 125
    },
    {
        "id": "traffic_controller",
        "name": "Campus Traffic Controller",
        "description": "Successfully resolve 3 escalating congestion events in the Learn & Play simulator.",
        "icon": "Shield",
        "xp_reward": 100
    },
    {
        "id": "network_analyst",
        "name": "Senior NOC Analyst",
        "description": "Maintain a healthy campus network with >90 health score across 5 consecutive observation periods.",
        "icon": "Award",
        "xp_reward": 150
    }
]


def calculate_level(total_xp: Optional[int]) -> int:
    """
    Computes operator rank level based on verified cumulative experience points.
    - Level 1: Analyst Intern (0 - 99 XP)
    - Level 2: Junior NOC Operator (100 - 249 XP)
    - Level 3: Telemetry Specialist (250 - 449 XP)
    - Level 4: Senior Systems Analyst (450 - 699 XP)
    - Level 5: Chief Infrastructure Architect (700+ XP)
    """
    if total_xp is None:
        return 1
    xp = max(0, int(total_xp))
    if xp >= 700:
        return 5
    elif xp >= 450:
        return 4
    elif xp >= 250:
        return 3
    elif xp >= 100:
        return 2
    return 1


def get_level_title(level: int) -> str:
    titles = {
        1: "Analyst Intern",
        2: "Junior NOC Operator",
        3: "Telemetry Specialist",
        4: "Senior Systems Analyst",
        5: "Chief Infrastructure Architect"
    }
    return titles.get(level, "Analyst")


def evaluate_achievement_eligibility(
    event_type: str,
    context: Dict[str, Any],
    already_unlocked_ids: Set[str]
) -> List[Dict[str, Any]]:
    """
    Evaluates business criteria to determine if a student qualifies for any new achievements.
    Guarantees idempotency: never returns achievements that are already in already_unlocked_ids.
    """
    newly_unlocked = []

    def try_unlock(achievement_id: str):
        if achievement_id not in already_unlocked_ids:
            ach = next((a for a in ACHIEVEMENTS_CATALOG if a["id"] == achievement_id), None)
            if ach and ach not in newly_unlocked:
                newly_unlocked.append(ach)

    if event_type == "analysis_saved":
        try_unlock("first_analysis")

    elif event_type == "game_completed":
        game_id = context.get("game_id", "").lower().strip()
        is_correct = bool(context.get("is_correct", False))

        if is_correct:
            if game_id == "traffic_controller":
                try_unlock("traffic_controller")
            elif game_id == "zscore_challenge":
                try_unlock("zscore_master")
            elif game_id in {"normal_curve", "normal_curve_challenge"}:
                try_unlock("distribution_explorer")
            elif game_id == "anomaly_hunter":
                try_unlock("anomaly_hunter")
            elif game_id in {"emergency_mission", "network_emergency_mission"}:
                try_unlock("network_analyst")

    elif event_type == "probability_solved":
        try_unlock("probability_master")

    return newly_unlocked
