"""
NETPULSE - Final Frontend/Backend/Database Integration Workflow Tests
Course: Probability and Statistics for Computer Science (25CS203)
Testing:
  - Workflow 1: Dataset Retrieval (GET /api/dataset)
  - Workflow 2: Technical Lab Analysis (POST /api/analyze)
  - Workflow 3: Probability Lab Solver (POST /api/probability)
  - Workflow 4: What-If Simulator (POST /api/simulation)
  - Workflow 5: All 5 Games Graded on Backend (POST /api/games/check-answer)
  - Workflow 6: Authenticated Game Completion with Idempotent Single XP Award (POST /api/games/complete)
  - Workflow 7: Analysis History Saving and Golden Bridge Restore (POST /api/analysis/save, GET /api/analysis/history)
  - Workflow 8: User Isolation (User B cannot access User A's history)
  - Workflow 9: Leaderboard Privacy (Only rank, username, level, total_xp exposed)
"""

import pytest
import math
from pathlib import Path
from fastapi import HTTPException

from routes.dataset import get_dataset, list_scenarios
from routes.analysis import analyze_network_load, save_analysis_snapshot, get_user_history
from routes.probability import solve_probability
from routes.simulation import run_simulation
from routes.games import check_game_answer
from routes.progression import complete_game_authoritative, get_leaderboard, get_progression
from models.network import (
    NetworkLoadRequest,
    ProbabilityRequest,
    SimulationRequest,
    GameCheckAnswerRequest
)
from models.progression import (
    GameCompletionRequest,
    SaveAnalysisRequest
)
from services.supabase_client import get_memory_db


def run_async(coro):
    """Executes a synchronous generator pump for in-memory coroutines."""
    try:
        coro.send(None)
    except StopIteration as exc:
        return exc.value


class TestFinalIntegrationWorkflows:
    """Verifies all end-to-end frontend/backend workflows."""

    def setup_method(self):
        get_memory_db().reset()

    # 1. Dataset Retrieval
    def test_workflow_01_dataset_retrieval(self):
        res = run_async(get_dataset("campus_network"))
        assert res.name == "campus_network"
        assert res.total_records == 24
        assert len(res.data) == 24
        assert math.isclose(res.mean, 39.7667, abs_tol=1e-2)
        assert math.isclose(res.variance, 195.2380, abs_tol=1e-1)
        assert math.isclose(res.std_dev, 13.9728, abs_tol=1e-2)

    # 2. Technical Lab Analysis
    def test_workflow_02_technical_lab_analysis(self):
        req = NetworkLoadRequest(network_load=62.0, dataset="campus_network")
        res = run_async(analyze_network_load(req))
        assert math.isclose(res.current_load, 62.0, abs_tol=1e-4)
        assert math.isclose(res.z_score, 1.5912, abs_tol=1e-2)
        assert math.isclose(res.probability, 0.9442, abs_tol=1e-2)
        assert res.status == "NORMAL"
        assert res.health_score == 85
        assert res.health_band == "Healthy"

    # 3. Probability Lab Solver
    def test_workflow_03_probability_lab_solver(self):
        # P(X <= 60) for mu=50, sigma=5 -> Z = +2.0 -> CDF ≈ 0.9772
        req = ProbabilityRequest(
            calculation_type="below",
            upper_val=60.0,
            mean=50.0,
            std_dev=5.0
        )
        res = run_async(solve_probability(req))
        assert math.isclose(res.z_upper, 2.0, abs_tol=1e-2)
        assert math.isclose(res.probability, 0.9772, abs_tol=1e-2)

    # 4. What-If Simulator
    def test_workflow_04_what_if_simulator(self):
        req = SimulationRequest(
            current_load=62.0,
            mean=50.0,
            std_dev=5.0
        )
        res = run_async(run_simulation(req))
        assert math.isclose(res.z_score, 2.40, abs_tol=1e-2)
        assert res.status == "UNUSUALLY HIGH"
        assert res.health_score == 65
        assert len(res.curve_points) == 60

    # 5. All 5 Games Graded on Backend
    def test_workflow_05_all_five_games_backend_grading(self):
        # 5.1 Traffic Controller
        tc_req = GameCheckAnswerRequest(
            game_id="traffic_controller",
            scenario_id="traffic_baseline_01",
            user_decision="Emergency Response"
        )
        tc_res = run_async(check_game_answer(tc_req))
        assert tc_res.is_correct is True

        # 5.2 Z-Score Challenge
        zc_req = GameCheckAnswerRequest(
            game_id="zscore_challenge",
            scenario_id="zscore_challenge_01",
            user_decision="2.4"
        )
        zc_res = run_async(check_game_answer(zc_req))
        assert zc_res.is_correct is True

        # 5.3 Normal Curve Challenge
        nc_req = GameCheckAnswerRequest(
            game_id="normal_curve_challenge",
            scenario_id="normal_curve_01",
            user_z_score=2.0
        )
        nc_res = run_async(check_game_answer(nc_req))
        assert nc_res.is_correct is True

        # 5.4 Anomaly Hunter
        ah_req = GameCheckAnswerRequest(
            game_id="anomaly_hunter",
            scenario_id="anomaly_hunter_01",
            user_decision="91"
        )
        ah_res = run_async(check_game_answer(ah_req))
        assert ah_res.is_correct is True

        # 5.5 Emergency Mission
        em_req = GameCheckAnswerRequest(
            game_id="emergency_mission",
            scenario_id="emergency_mission_01",
            step=3,
            user_decision="Activate rate-limiting and DDoS scrubbers"
        )
        em_res = run_async(check_game_answer(em_req))
        assert em_res.is_correct is True

    # 6. Authenticated Game Completion with Idempotent Single XP Award
    def test_workflow_06_authenticated_game_completion_idempotency(self):
        user = {"id": "int-user-1", "email": "pilot1@karunya.edu.in", "user_metadata": {"username": "pilot_01"}}
        req = GameCompletionRequest(
            game_id="traffic_controller",
            scenario_id="traffic_baseline_01",
            user_decision="Emergency Response",
            idempotency_key="int-key-001"
        )

        # First completion: awards XP + achievement bonus
        res1 = run_async(complete_game_authoritative(req, current_user=user))
        assert res1.is_correct is True
        assert res1.xp_awarded > 0
        total_xp_first = res1.total_xp
        assert res1.already_completed is False

        # Duplicate completion: should return same score, NOT award double XP
        res2 = run_async(complete_game_authoritative(req, current_user=user))
        assert res2.total_xp == total_xp_first
        assert res2.already_completed is True

    # 7. Analysis History Saving and Golden Bridge Restore
    def test_workflow_07_analysis_history_saving_and_restore(self):
        user = {"id": "int-user-hist", "email": "hist@karunya.edu.in", "user_metadata": {"username": "hist_analyst"}}
        save_req = SaveAnalysisRequest(
            network_load=62.0,
            dataset="campus_network"
        )
        save_res = run_async(save_analysis_snapshot(save_req, current_user=user))
        assert save_res.saved is True
        assert save_res.history_id is not None
        assert math.isclose(save_res.analysis["z_score"], 1.5912, abs_tol=1e-2)

        # Retrieve history
        hist_res = run_async(get_user_history(limit=10, offset=0, current_user=user))
        assert hist_res.total_count == 1
        record = hist_res.records[0]
        assert math.isclose(record.current_load, 62.0, abs_tol=1e-2)
        assert math.isclose(record.z_score, 1.5912, abs_tol=1e-2)
        assert record.status == "NORMAL"
        assert record.health_score == 85

    # 8. User Isolation (User B cannot access User A's history)
    def test_workflow_08_user_history_isolation(self):
        user_a = {"id": "user-a-uuid", "email": "a@karunya.edu.in", "user_metadata": {"username": "user_a"}}
        user_b = {"id": "user-b-uuid", "email": "b@karunya.edu.in", "user_metadata": {"username": "user_b"}}

        # User A saves an analysis
        save_req = SaveAnalysisRequest(network_load=48.0, dataset="campus_network")
        run_async(save_analysis_snapshot(save_req, current_user=user_a))

        # User A reads history -> 1 record
        hist_a = run_async(get_user_history(limit=10, offset=0, current_user=user_a))
        assert hist_a.total_count == 1

        # User B reads history -> 0 records (isolated)
        hist_b = run_async(get_user_history(limit=10, offset=0, current_user=user_b))
        assert hist_b.total_count == 0

    # 9. Leaderboard Privacy (Only rank, username, level, total_xp exposed)
    def test_workflow_09_leaderboard_privacy(self):
        # Create users with XP
        user_1 = {"id": "u1", "email": "u1@karunya.edu.in", "user_metadata": {"username": "student_alpha"}}
        user_2 = {"id": "u2", "email": "u2@karunya.edu.in", "user_metadata": {"username": "student_beta"}}

        req1 = GameCompletionRequest(
            game_id="traffic_controller",
            scenario_id="traffic_baseline_01",
            user_decision="Emergency Response",
            idempotency_key="lb-key-1"
        )
        run_async(complete_game_authoritative(req1, current_user=user_1))

        lb_res = run_async(get_leaderboard(limit=10))
        assert lb_res.total_count >= 1
        for entry in lb_res.entries:
            # Only public fields present
            assert hasattr(entry, "rank")
            assert hasattr(entry, "username")
            assert hasattr(entry, "level")
            assert hasattr(entry, "total_xp")
            # Private fields absent
            assert not hasattr(entry, "email")
            assert not hasattr(entry, "id")
            assert not hasattr(entry, "password")
