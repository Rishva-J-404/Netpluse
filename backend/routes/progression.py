"""
NETPULSE - Progression & Leaderboard Router
Endpoints:
  POST /api/games/complete
  GET  /api/progression
  GET  /api/leaderboard
Course: Probability and Statistics for Computer Science (25CS203)
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from pathlib import Path
import json

from models.progression import (
    GameCompletionRequest,
    GameCompletionResponse,
    ProgressionResponse,
    LeaderboardResponse,
    LeaderboardEntry,
    UnlockedAchievement
)
from services.supabase_auth import get_current_user
from services.supabase_client import (
    record_authoritative_game_completion,
    get_authoritative_leaderboard,
    get_user_progression_summary
)
from services.statistics import calculate_z_score
from services.probability import calculate_cdf
from services.anomaly import classify_z_score
from services.health import calculate_health_score, get_health_band

router = APIRouter(prefix="/api", tags=["Progression"])

SCENARIOS_PATH = Path(__file__).resolve().parent.parent / "data" / "scenarios.json"


def load_all_scenarios():
    if not SCENARIOS_PATH.exists():
        return []
    with open(SCENARIOS_PATH, mode="r", encoding="utf-8") as f:
        return json.load(f)


@router.post(
    "/games/complete",
    response_model=GameCompletionResponse,
    summary="Complete Game & Authoritatively Record Progression",
    description="Authoritatively grades game submission, computes exact XP and accuracy, persists to game_results, atomically increments total XP, and evaluates achievement unlocks."
)
async def complete_game_authoritative(
    req: GameCompletionRequest,
    current_user: dict = Depends(get_current_user)
):
    scenarios = load_all_scenarios()
    scenario = next((s for s in scenarios if s.get("id") == req.scenario_id), None)
    if not scenario:
        scenario = next((s for s in scenarios if s.get("game") == req.game_id), None)

    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario '{req.scenario_id}' or game '{req.game_id}' not found."
        )

    # Statistical ground truth calculation via backend engine
    mean = float(scenario.get("mean", scenario.get("baseline_mean", 50.0)))
    std = float(scenario.get("std_dev", scenario.get("baseline_std", 5.0)))
    load = float(scenario.get("current_load", 62.0))

    actual_z = calculate_z_score(load, mean, std)
    actual_cdf = calculate_cdf(load, mean, std)
    actual_status = classify_z_score(actual_z)
    actual_health = calculate_health_score(actual_z)
    actual_band = get_health_band(actual_health)

    game_id = req.game_id.lower().strip()
    is_correct = False
    xp_awarded = 0
    correct_answer_str = ""
    ground_truth = {}

    if game_id == "traffic_controller":
        correct_answer_str = scenario.get("correct_option", "Emergency Response")
        is_correct = bool(req.user_decision and req.user_decision.strip() == correct_answer_str)
        xp_awarded = 10 if is_correct else 2
        score = 100 if is_correct else 20
        accuracy = 100.0 if is_correct else 20.0
        ground_truth = {
            "mean": mean,
            "std_dev": std,
            "current_load": load,
            "calculated_z": round(actual_z, 2),
            "status": actual_status,
            "correct_decision": correct_answer_str
        }

    elif game_id == "zscore_challenge":
        correct_answer_str = scenario.get("correct_answer", f"{actual_z:.1f}")
        user_num = None
        if req.user_decision:
            try:
                user_num = float(req.user_decision)
            except ValueError:
                pass
        if req.user_z_score is not None:
            user_num = req.user_z_score

        if user_num is not None:
            is_correct = (abs(user_num - actual_z) < 0.05) or (abs(user_num - float(correct_answer_str)) < 0.05)
        else:
            is_correct = bool(req.user_decision and req.user_decision.strip() == correct_answer_str)

        xp_awarded = 15 if is_correct else 3
        score = 100 if is_correct else 20
        accuracy = 100.0 if is_correct else 20.0
        ground_truth = {
            "mean": mean,
            "std_dev": std,
            "current_load": load,
            "calculated_z": round(actual_z, 2),
            "formula": f"Z = ({load} - {mean}) / {std} = {actual_z:.2f}"
        }

    elif game_id in {"normal_curve", "normal_curve_challenge"}:
        target_z = float(scenario.get("target_z", 2.0))
        correct_answer_str = f"Z = {target_z:+.1f}"
        tolerance = float(scenario.get("tolerance_z", 0.20))
        user_val = req.user_z_score
        if user_val is None and req.user_decision:
            try:
                user_val = float(req.user_decision.replace("Z", "").replace("=", "").strip())
            except ValueError:
                pass

        is_correct = (user_val is not None and abs(user_val - target_z) <= tolerance)
        xp_awarded = 15 if is_correct else 3
        score = 100 if is_correct else 20
        accuracy = 100.0 if is_correct else 20.0
        ground_truth = {
            "target_z": target_z,
            "target_load": mean + target_z * std,
            "tolerance": tolerance,
            "probability_below": round(calculate_cdf(mean + target_z * std, mean, std), 4)
        }

    elif game_id == "anomaly_hunter":
        suspicious_val = scenario.get("suspicious_value", 91.0)
        correct_answer_str = str(suspicious_val)
        user_choice = req.user_decision.strip() if req.user_decision else ""
        try:
            is_correct = (float(user_choice) == float(suspicious_val))
        except (ValueError, TypeError):
            is_correct = (user_choice == str(suspicious_val))

        xp_awarded = 20 if is_correct else 4
        score = 100 if is_correct else 20
        accuracy = 100.0 if is_correct else 20.0
        ground_truth = {
            "suspicious_value": suspicious_val,
            "calculated_z": round(actual_z, 2),
            "status": actual_status
        }

    elif game_id in {"emergency_mission", "network_emergency_mission"}:
        steps = scenario.get("steps", [])
        if req.step == 1:
            step1_meta = steps[0] if len(steps) > 0 else {}
            expected_z = float(step1_meta.get("expected_z", 3.6))
            correct_answer_str = f"Z = {expected_z:.1f}"
            user_val = req.user_z_score
            if user_val is None and req.user_decision:
                try:
                    user_val = float(req.user_decision)
                except ValueError:
                    pass
            is_correct = (user_val is not None and abs(user_val - expected_z) < 0.1)
            xp_awarded = 10 if is_correct else 2
            score = 33 if is_correct else 10
            accuracy = 100.0 if is_correct else 20.0
            ground_truth = {"step": 1, "calculated_z": round(actual_z, 2)}
        elif req.step == 2:
            step2_meta = steps[1] if len(steps) > 1 else {}
            correct_status = step2_meta.get("correct", "UNUSUALLY HIGH")
            correct_answer_str = correct_status
            is_correct = bool(req.user_decision and req.user_decision.strip().upper() == correct_status.upper())
            xp_awarded = 10 if is_correct else 2
            score = 66 if is_correct else 20
            accuracy = 100.0 if is_correct else 20.0
            ground_truth = {"step": 2, "status": actual_status}
        else:
            correct_action = "Activate rate-limiting and DDoS scrubbers"
            correct_answer_str = correct_action
            is_correct = bool(req.user_decision and req.user_decision.strip() == correct_action)
            xp_awarded = 35 if is_correct else 5
            score = 100 if is_correct else 20
            accuracy = 100.0 if is_correct else 20.0
            ground_truth = {"step": 3, "recommended_action": correct_action}
    else:
        correct_answer_str = scenario.get("correct_answer", "Verified")
        is_correct = bool(req.user_decision and req.user_decision.strip() == correct_answer_str)
        xp_awarded = 10 if is_correct else 2
        score = 100 if is_correct else 20
        accuracy = 100.0 if is_correct else 20.0
        ground_truth = {"status": actual_status, "z_score": round(actual_z, 2)}

    # Technical Lab bridge payload
    technical_payload = {
        "scenario_id": scenario.get("id"),
        "game_id": req.game_id,
        "title": scenario.get("title"),
        "current_load": load,
        "mean": mean,
        "std_dev": std,
        "z_score": round(actual_z, 2),
        "probability_below": round(actual_cdf, 4),
        "status": actual_status,
        "health_score": actual_health,
        "health_band": actual_band,
        "z_formula": f"Z = ({load:.1f} - {mean:.1f}) / {std:.1f} = {actual_z:.2f}",
        "explanation": scenario.get("explanation", "")
    }

    # Authoritative persistence with idempotency guarantee
    user_id = current_user["id"]
    username = current_user.get("user_metadata", {}).get("username") or current_user.get("email", "").split("@")[0] or "analyst"

    persist_res = await record_authoritative_game_completion(
        user_id=user_id,
        username=username,
        game_id=req.game_id,
        scenario_id=scenario.get("id", req.scenario_id),
        score=score,
        accuracy=accuracy,
        xp_earned=xp_awarded,
        is_correct=is_correct,
        idempotency_key=req.idempotency_key
    )

    unlocked_models = [
        UnlockedAchievement(
            id=a["id"],
            name=a["name"],
            description=a["description"],
            icon=a["icon"],
            xp_reward=a["xp_reward"]
        ) for a in persist_res.get("newly_unlocked_achievements", [])
    ]

    return GameCompletionResponse(
        is_correct=is_correct,
        score=persist_res["score"],
        accuracy=persist_res["accuracy"],
        xp_awarded=persist_res["xp_awarded"],
        total_xp=persist_res["total_xp"],
        level=persist_res["level"],
        correct_answer=correct_answer_str,
        ground_truth=ground_truth,
        explanation=scenario.get("explanation", ""),
        technical_analysis=technical_payload,
        newly_unlocked_achievements=unlocked_models,
        already_completed=persist_res.get("already_completed", False)
    )


@router.get(
    "/progression",
    response_model=ProgressionResponse,
    summary="Get Current User Progression",
    description="Retrieves the authenticated student's authoritative Level, Total XP, and unlocked badge counts."
)
async def get_progression(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    username = current_user.get("user_metadata", {}).get("username") or current_user.get("email", "").split("@")[0] or "analyst"
    data = await get_user_progression_summary(user_id, username)
    return ProgressionResponse(
        user_id=data["user_id"],
        username=data["username"],
        level=data["level"],
        total_xp=data["total_xp"],
        games_completed_count=data["games_completed_count"],
        achievements_count=data["achievements_count"],
        analyses_count=data["analyses_count"],
        unlocked_achievements=data["unlocked_achievements"]
    )


@router.get(
    "/leaderboard",
    response_model=LeaderboardResponse,
    summary="Get Global Class Leaderboard",
    description="Returns public ranked student analyst standings without exposing private emails or account details."
)
async def get_leaderboard(limit: int = Query(default=50, ge=1, le=100)):
    entries_data = await get_authoritative_leaderboard(limit)
    entries = [
        LeaderboardEntry(
            rank=e["rank"],
            username=e["username"],
            level=e["level"],
            total_xp=e["total_xp"]
        ) for e in entries_data
    ]
    return LeaderboardResponse(
        entries=entries,
        total_count=len(entries)
    )
