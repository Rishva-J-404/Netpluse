"""
NETPULSE - API Endpoint Integration Tests
Course: Probability and Statistics for Computer Science (25CS203)
Testing: FastAPI REST API route handlers, Pydantic contracts, and mathematical responses
"""

import pytest
import math
from fastapi import HTTPException
from pydantic import ValidationError

from main import root, health_check
from routes.analysis import analyze_network_load
from routes.probability import solve_probability
from routes.simulation import run_simulation
from routes.games import check_game_answer
from routes.dataset import get_dataset, list_scenarios
from models.network import (
    NetworkLoadRequest,
    ProbabilityRequest,
    SimulationRequest,
    GameCheckAnswerRequest
)
from models.results import (
    AnalysisResponse,
    ProbabilityResponse,
    SimulationResponse,
    GameCheckAnswerResponse,
    DatasetResponse,
    ScenariosListResponse
)


def run_async(coro):
    """
    Executes a coroutine that completes synchronously without yielding to an external event loop.
    All NETPULSE routes perform purely in-memory statistical evaluations and synchronous file reads.
    """
    try:
        coro.send(None)
    except StopIteration as exc:
        return exc.value


class TestHealthEndpoints:
    """Verifies basic service discovery and heartbeat."""

    def test_root_endpoint(self):
        data = run_async(root())
        assert data["project"] == "NETPULSE"
        assert data["status"] == "operational"
        assert "25CS203" in data["course"]
        assert data["version"] == "1.0.0"

    def test_health_check_endpoint(self):
        data = run_async(health_check())
        assert data["status"] == "healthy"
        assert data["service"] == "netpulse-fastapi"
        assert data["statistical_engine"] == "online"


class TestAnalyzeEndpoint:
    """
    Tests POST /api/analyze route handler.
    Evaluates baseline dataset analysis (Golden Test Case) and custom telemetry payloads.
    """

    def test_analyze_standard_baseline_golden_case(self):
        """
        Golden Case:
        network_load = 62.0 Mbps
        baseline network_load.csv (24 observations):
        mean ≈ 39.7667, variance ≈ 195.2380, std_dev ≈ 13.9728
        Z = (62.0 - 39.7667) / 13.9728 ≈ 1.5912
        Status = NORMAL (|Z| <= 2.0)
        Health Score = 85 (Healthy)
        P(X <= 62) ≈ 0.9442
        P(X >= 62) ≈ 0.0558
        """
        req = NetworkLoadRequest(network_load=62.0, dataset="campus_network")
        res = run_async(analyze_network_load(req))

        assert isinstance(res, AnalysisResponse)
        assert math.isclose(res.current_load, 62.0, abs_tol=1e-4)
        assert math.isclose(res.mean, 39.7667, abs_tol=1e-2)
        assert math.isclose(res.variance, 195.2380, abs_tol=1e-1)
        assert math.isclose(res.std_dev, 13.9728, abs_tol=1e-2)
        assert math.isclose(res.z_score, 1.5912, abs_tol=1e-2)
        assert math.isclose(res.probability, 0.9442, abs_tol=1e-2)
        assert math.isclose(res.exceedance_probability, 0.0558, abs_tol=1e-2)
        assert res.status == "NORMAL"
        assert res.health_score == 85
        assert res.health_band == "Healthy"
        assert len(res.explanation) > 20
        assert "62.0" in res.explanation

        fb = res.formula_breakdown
        assert "Z =" in fb.z_formula
        assert "+1.5912" in fb.z_result or "1.59" in fb.z_result
        assert "μ" in fb.mean_formula
        assert "Bessel's Correction" in fb.variance_formula

    def test_analyze_with_custom_telemetry(self):
        req = NetworkLoadRequest(
            network_load=70.0,
            custom_data=[50.0, 55.0, 60.0, 65.0, 70.0]
        )
        res = run_async(analyze_network_load(req))

        # Custom data: mean = 60.0, s = 7.9057, Z = (70 - 60) / 7.9057 ≈ 1.2649
        assert res.mean == 60.0
        assert math.isclose(res.std_dev, 7.9057, abs_tol=1e-2)
        assert math.isclose(res.z_score, 1.2649, abs_tol=1e-2)
        assert res.status == "NORMAL"
        # Health score: 100 - 25*(1.2649 - 1) = 93.38 -> 93 (Excellent)
        assert res.health_score == 93
        assert res.health_band == "Excellent"

    def test_analyze_zero_variance_protection(self):
        req = NetworkLoadRequest(
            network_load=50.0,
            custom_data=[50.0, 50.0, 50.0, 50.0]
        )
        res = run_async(analyze_network_load(req))

        assert res.mean == 50.0
        assert res.variance == 0.0
        assert res.std_dev == 0.0
        assert res.z_score == 0.0
        assert res.status == "NORMAL"
        assert res.health_score == 100
        assert res.health_band == "Excellent"

    def test_analyze_single_item_custom_telemetry_safe_variance(self):
        req = NetworkLoadRequest(network_load=50.0, custom_data=[50.0])
        res = run_async(analyze_network_load(req))

        assert res.mean == 50.0
        assert res.variance == 0.0
        assert res.std_dev == 0.0
        assert res.z_score == 0.0
        assert res.status == "NORMAL"
        assert res.health_score == 100

    def test_analyze_validation_missing_load(self):
        with pytest.raises(ValidationError):
            NetworkLoadRequest()

    def test_analyze_validation_negative_load(self):
        with pytest.raises(ValidationError):
            NetworkLoadRequest(network_load=-12.5)

    def test_analyze_validation_empty_custom_data(self):
        with pytest.raises(ValidationError):
            NetworkLoadRequest(network_load=50.0, custom_data=[])

    def test_analyze_validation_negative_custom_data(self):
        with pytest.raises(ValidationError):
            NetworkLoadRequest(network_load=50.0, custom_data=[50.0, -5.0])


class TestProbabilityEndpoint:
    """
    Tests POST /api/probability route handler.
    Evaluates lower-tail, upper-tail, and interval normal cumulative probabilities.
    """

    def test_lower_tail_probability(self):
        """P(X <= 62) where μ = 50, σ = 5 -> Z = 2.4, CDF ≈ 0.991802"""
        req = ProbabilityRequest(
            mean=50.0,
            std_dev=5.0,
            upper_val=62.0,
            calculation_type="below"
        )
        res = run_async(solve_probability(req))

        assert isinstance(res, ProbabilityResponse)
        assert res.calculation_type == "below"
        assert math.isclose(res.probability, 0.991802, abs_tol=1e-4)
        assert math.isclose(res.percentage, 99.18, abs_tol=1e-1)
        assert math.isclose(res.z_upper, 2.4, abs_tol=1e-2)
        assert res.z_lower is None
        assert "99.18%" in res.interpretation

    def test_upper_tail_probability(self):
        """P(X >= 62) where μ = 50, σ = 5 -> Z = 2.4, Upper tail ≈ 0.008198"""
        req = ProbabilityRequest(
            mean=50.0,
            std_dev=5.0,
            lower_val=62.0,
            calculation_type="above"
        )
        res = run_async(solve_probability(req))

        assert isinstance(res, ProbabilityResponse)
        assert res.calculation_type == "above"
        assert math.isclose(res.probability, 0.008198, abs_tol=1e-4)
        assert math.isclose(res.percentage, 0.82, abs_tol=1e-1)
        assert math.isclose(res.z_lower, 2.4, abs_tol=1e-2)
        assert "0.82%" in res.interpretation

    def test_interval_probability(self):
        """P(45 <= X <= 55) where μ = 50, σ = 5 -> Z in [-1, +1], prob ≈ 0.682689"""
        req = ProbabilityRequest(
            mean=50.0,
            std_dev=5.0,
            lower_val=45.0,
            upper_val=55.0,
            calculation_type="between"
        )
        res = run_async(solve_probability(req))

        assert isinstance(res, ProbabilityResponse)
        assert res.calculation_type == "between"
        assert math.isclose(res.probability, 0.682689, abs_tol=1e-4)
        assert math.isclose(res.percentage, 68.27, abs_tol=1e-1)
        assert res.z_lower == -1.0
        assert res.z_upper == 1.0

    def test_invalid_interval_bounds_raises_400(self):
        """lower_val > upper_val must trigger 400 Bad Request"""
        req = ProbabilityRequest(
            mean=50.0,
            std_dev=5.0,
            lower_val=65.0,
            upper_val=45.0,
            calculation_type="between"
        )
        with pytest.raises(HTTPException) as exc_info:
            run_async(solve_probability(req))
        assert exc_info.value.status_code == 400
        assert "cannot be strictly greater than" in str(exc_info.value.detail)

    def test_missing_upper_val_for_below_raises_400(self):
        req = ProbabilityRequest(
            mean=50.0,
            std_dev=5.0,
            calculation_type="below"
        )
        with pytest.raises(HTTPException) as exc_info:
            run_async(solve_probability(req))
        assert exc_info.value.status_code == 400
        assert "requires an 'upper_val'" in str(exc_info.value.detail)

    def test_missing_lower_val_for_above_raises_400(self):
        req = ProbabilityRequest(
            mean=50.0,
            std_dev=5.0,
            calculation_type="above"
        )
        with pytest.raises(HTTPException) as exc_info:
            run_async(solve_probability(req))
        assert exc_info.value.status_code == 400
        assert "requires a 'lower_val'" in str(exc_info.value.detail)

    def test_invalid_calculation_type_validation(self):
        with pytest.raises(ValidationError):
            ProbabilityRequest(
                mean=50.0,
                std_dev=5.0,
                upper_val=60.0,
                calculation_type="diagonal"
            )

    def test_non_positive_std_dev_validation(self):
        with pytest.raises(ValidationError):
            ProbabilityRequest(
                mean=50.0,
                std_dev=0.0,
                upper_val=60.0,
                calculation_type="below"
            )


class TestSimulationEndpoint:
    """
    Tests POST /api/simulation route handler.
    Evaluates real-time parameter swept Gaussian curve and anomaly metrics.
    """

    def test_simulation_high_load(self):
        req = SimulationRequest(
            current_load=62.0,
            mean=50.0,
            std_dev=5.0
        )
        res = run_async(run_simulation(req))

        assert isinstance(res, SimulationResponse)
        assert res.current_load == 62.0
        assert math.isclose(res.z_score, 2.4, abs_tol=1e-2)
        assert res.status == "UNUSUALLY HIGH"
        assert res.health_score == 65
        assert res.health_band == "Warning"
        assert len(res.curve_points) == 60
        assert "mean" in res.markers
        assert "plus_2sd" in res.markers
        assert "minus_2sd" in res.markers

    def test_simulation_default_distribution_parameters(self):
        req = SimulationRequest(current_load=50.0)
        res = run_async(run_simulation(req))

        assert res.z_score == 0.0
        assert res.status == "NORMAL"
        assert res.health_score == 100
        assert res.health_band == "Excellent"

    def test_simulation_negative_load_validation(self):
        with pytest.raises(ValidationError):
            SimulationRequest(current_load=-5.0)

    def test_simulation_non_positive_std_dev_validation(self):
        with pytest.raises(ValidationError):
            SimulationRequest(current_load=50.0, std_dev=0.0)


class TestGamesEndpoint:
    """
    Tests POST /api/games/check-answer route handler.
    Evaluates educational verification and Golden Bridge payload generation.
    """

    def test_traffic_controller_correct_decision(self):
        req = GameCheckAnswerRequest(
            game_id="traffic_controller",
            scenario_id="traffic_controller_01",
            user_decision="Emergency Response"
        )
        res = run_async(check_game_answer(req))

        assert isinstance(res, GameCheckAnswerResponse)
        assert res.is_correct is True
        assert res.xp_awarded == 10
        assert res.correct_answer == "Emergency Response"

        # Verify Golden Bridge payload
        bridge = res.technical_analysis
        assert bridge is not None
        assert bridge["scenario_id"] == "traffic_controller_01"
        assert bridge["current_load"] == 91.0
        assert bridge["z_score"] == 8.2
        assert bridge["status"] == "UNUSUALLY HIGH"
        assert bridge["health_score"] == 0
        assert bridge["health_band"] == "Critical"

    def test_traffic_controller_incorrect_decision(self):
        req = GameCheckAnswerRequest(
            game_id="traffic_controller",
            scenario_id="traffic_controller_01",
            user_decision="Continue Monitoring"
        )
        res = run_async(check_game_answer(req))

        assert res.is_correct is False
        assert res.xp_awarded == 2
        assert res.technical_analysis is not None

    def test_zscore_challenge_numeric_answer(self):
        req = GameCheckAnswerRequest(
            game_id="zscore_challenge",
            scenario_id="zscore_challenge_01",
            user_z_score=2.4
        )
        res = run_async(check_game_answer(req))

        assert res.is_correct is True
        assert res.xp_awarded == 15
        assert res.correct_answer == "2.4"
        assert res.technical_analysis["current_load"] == 62.0

    def test_normal_curve_challenge_tolerance_match(self):
        req = GameCheckAnswerRequest(
            game_id="normal_curve",
            scenario_id="normal_curve_01",
            user_z_score=2.08
        )
        res = run_async(check_game_answer(req))

        assert res.is_correct is True
        assert res.xp_awarded == 15

    def test_anomaly_hunter_correct_identification(self):
        req = GameCheckAnswerRequest(
            game_id="anomaly_hunter",
            scenario_id="anomaly_hunter_01",
            user_decision="91"
        )
        res = run_async(check_game_answer(req))

        assert res.is_correct is True
        assert res.xp_awarded == 20

    def test_emergency_mission_mitigation(self):
        req = GameCheckAnswerRequest(
            game_id="emergency_mission",
            scenario_id="emergency_mission_01",
            user_decision="Activate rate-limiting and DDoS scrubbers",
            user_z_score=3.6
        )
        res = run_async(check_game_answer(req))

        assert res.is_correct is True
        assert res.xp_awarded == 25

    def test_emergency_mission_steps_grading(self):
        # Step 1: Z-score calculation
        req1 = GameCheckAnswerRequest(
            game_id="emergency_mission",
            scenario_id="emergency_mission_01",
            step=1,
            user_z_score=3.6
        )
        res1 = run_async(check_game_answer(req1))
        assert res1.is_correct is True
        assert res1.xp_awarded == 10
        assert res1.ground_truth["step"] == 1

        # Step 2: Classification
        req2 = GameCheckAnswerRequest(
            game_id="emergency_mission",
            scenario_id="emergency_mission_01",
            step=2,
            user_decision="UNUSUALLY HIGH"
        )
        res2 = run_async(check_game_answer(req2))
        assert res2.is_correct is True
        assert res2.xp_awarded == 10
        assert res2.ground_truth["step"] == 2

        # Step 3: Mitigation protocol
        req3 = GameCheckAnswerRequest(
            game_id="emergency_mission",
            scenario_id="emergency_mission_01",
            step=3,
            user_decision="Activate rate-limiting and DDoS scrubbers"
        )
        res3 = run_async(check_game_answer(req3))
        assert res3.is_correct is True
        assert res3.xp_awarded == 15
        assert res3.ground_truth["step"] == 3

    def test_check_answer_scenario_not_found_raises_404(self):
        req = GameCheckAnswerRequest(
            game_id="nonexistent_game_xyz",
            scenario_id="nonexistent_scenario_123"
        )
        with pytest.raises(HTTPException) as exc_info:
            run_async(check_game_answer(req))
        assert exc_info.value.status_code == 404
        assert "not found" in str(exc_info.value.detail)


class TestDatasetAndScenariosEndpoints:
    """
    Tests GET /api/dataset and GET /api/scenarios route handlers.
    """

    def test_get_baseline_dataset(self):
        res = run_async(get_dataset(name="campus_network"))

        assert isinstance(res, DatasetResponse)
        assert res.name == "campus_network"
        assert res.total_records == 24
        assert math.isclose(res.mean, 39.7667, abs_tol=1e-2)
        assert math.isclose(res.variance, 195.2380, abs_tol=1e-1)
        assert math.isclose(res.std_dev, 13.9728, abs_tol=1e-2)
        assert len(res.data) == 24
        assert res.data[0].timestamp != ""
        assert res.data[0].network_load > 0

    def test_get_educational_scenarios(self):
        res = run_async(list_scenarios())

        assert isinstance(res, ScenariosListResponse)
        assert res.total_scenarios == 5
        assert len(res.scenarios) == 5
        scenario_ids = [s["id"] for s in res.scenarios]
        assert "traffic_controller_01" in scenario_ids
        assert "zscore_challenge_01" in scenario_ids
        assert "normal_curve_01" in scenario_ids
        assert "anomaly_hunter_01" in scenario_ids
        assert "emergency_mission_01" in scenario_ids
