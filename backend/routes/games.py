"""
NETPULSE - Games Router
Endpoint: POST /api/games/check-answer
Course: Probability and Statistics for Computer Science (25CS203)
"""

from fastapi import APIRouter, HTTPException, status
from pathlib import Path
import json

from models.network import GameCheckAnswerRequest
from models.results import GameCheckAnswerResponse
from services.statistics import calculate_z_score
from services.probability import calculate_cdf
from services.anomaly import classify_z_score
from services.health import calculate_health_score, get_health_band

router = APIRouter(prefix="/api/games", tags=["Games"])

SCENARIOS_PATH = Path(__file__).resolve().parent.parent / "data" / "scenarios.json"


def load_all_scenarios():
    if not SCENARIOS_PATH.exists():
        return []
    with open(SCENARIOS_PATH, mode="r", encoding="utf-8") as f:
        return json.load(f)


@router.post(
    "/check-answer",
    response_model=GameCheckAnswerResponse,
    summary="Validate Educational Game Answer",
    description="Validates student decision/calculation against the backend statistical engine, awards XP, and returns Technical Lab bridge payload."
)
async def check_game_answer(req: GameCheckAnswerRequest):
    scenarios = load_all_scenarios()
    
    # 1. Locate scenario
    scenario = next((s for s in scenarios if s.get("id") == req.scenario_id), None)
    if not scenario:
        # Fallback to first scenario matching game_id
        scenario = next((s for s in scenarios if s.get("game") == req.game_id), None)
        
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario '{req.scenario_id}' or game '{req.game_id}' not found."
        )

    is_correct = False
    xp_awarded = 0
    correct_answer_str = ""
    ground_truth = {}
    
    mean = float(scenario.get("mean", scenario.get("baseline_mean", 50.0)))
    std = float(scenario.get("std_dev", scenario.get("baseline_std", 5.0)))
    load = float(scenario.get("current_load", 62.0))
    
    # Real-time backend calculation of ground truth
    actual_z = calculate_z_score(load, mean, std)
    actual_cdf = calculate_cdf(load, mean, std)
    actual_status = classify_z_score(actual_z)
    actual_health = calculate_health_score(actual_z)
    actual_band = get_health_band(actual_health)

    # 2. Game-specific ground-truth verification
    game_id = req.game_id.lower().strip()
    
    if game_id == "traffic_controller":
        correct_answer_str = scenario.get("correct_option", "Emergency Response")
        is_correct = (req.user_decision and req.user_decision.strip() == correct_answer_str)
        xp_awarded = 10 if is_correct else 2
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
        # Accept either string match or numeric value within 0.05
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
            is_correct = (req.user_decision and req.user_decision.strip() == correct_answer_str)
            
        xp_awarded = 15 if is_correct else 3
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
            ground_truth = {
                "step": 1,
                "mean": mean,
                "std_dev": std,
                "current_load": load,
                "calculated_z": round(actual_z, 2),
                "formula": f"Z = ({load} - {mean}) / {std} = {actual_z:.2f}"
            }
        elif req.step == 2:
            step2_meta = steps[1] if len(steps) > 1 else {}
            correct_status = step2_meta.get("correct", "UNUSUALLY HIGH")
            correct_answer_str = correct_status
            is_correct = bool(req.user_decision and req.user_decision.strip().upper() == correct_status.upper())
            xp_awarded = 10 if is_correct else 2
            ground_truth = {
                "step": 2,
                "calculated_z": round(actual_z, 2),
                "status": actual_status,
                "correct_status": correct_status
            }
        elif req.step == 3:
            step3_meta = steps[2] if len(steps) > 2 else {}
            correct_action = step3_meta.get("correct", "Activate rate-limiting and DDoS scrubbers")
            correct_answer_str = correct_action
            is_correct = bool(req.user_decision and req.user_decision.strip() == correct_action)
            xp_awarded = 15 if is_correct else 3
            ground_truth = {
                "step": 3,
                "recommended_action": correct_action,
                "status": actual_status
            }
        else:
            # Backward-compatible fallback for overall mission completion
            correct_action = "Activate rate-limiting and DDoS scrubbers"
            correct_answer_str = correct_action
            is_correct = (req.user_decision and req.user_decision.strip() == correct_action)
            if req.user_z_score is not None:
                is_correct = is_correct and (abs(req.user_z_score - actual_z) < 0.1)
            xp_awarded = 25 if is_correct else 5
            ground_truth = {
                "mean": mean,
                "std_dev": std,
                "current_load": load,
                "calculated_z": round(actual_z, 2),
                "status": actual_status,
                "recommended_action": correct_action
            }

    else:
        correct_answer_str = scenario.get("correct_answer", scenario.get("correct_option", "Verified"))
        is_correct = (req.user_decision and req.user_decision.strip() == correct_answer_str)
        xp_awarded = 10 if is_correct else 2
        ground_truth = {"status": actual_status, "z_score": round(actual_z, 2)}

    # 3. Compile Golden Bridge payload
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

    return GameCheckAnswerResponse(
        is_correct=is_correct,
        correct_answer=correct_answer_str,
        ground_truth=ground_truth,
        xp_awarded=xp_awarded,
        explanation=scenario.get("explanation", ""),
        technical_analysis=technical_payload
    )
