"""
NETPULSE - Phase 10 Final Integration & Statistical Ground Truth Tests
Course: Probability and Statistics for Computer Science (25CS203)
Testing:
  - Exact Statistical Benchmark (network_load.csv, 24 records, mean 39.7667, var 195.2380, std 13.9728)
  - Golden Case 62.0 Mbps (Z = +1.5912, CDF = 0.944217, Exceedance = 0.055783, Status = NORMAL, Health = 85)
  - 5-Tier Level Progression & Titles
  - 7 Curriculum Achievements Definitions & Milestones
  - Leaderboard Privacy & Column Scoping
  - All 5 Games Authoritative Verification
  - Analysis History & Golden Bridge Data Integrity
"""

import pytest
import math
from pathlib import Path
import numpy as np

from services.statistics import (
    calculate_mean,
    calculate_variance,
    calculate_std_dev,
    calculate_z_score,
    load_telemetry_from_csv
)
from services.probability import (
    calculate_cdf,
    calculate_upper_tail
)
from services.anomaly import classify_z_score
from services.health import calculate_health_score, get_health_band
from services.progression_engine import (
    calculate_level,
    get_level_title,
    ACHIEVEMENTS_CATALOG,
    evaluate_achievement_eligibility
)
from services.supabase_client import (
    record_authoritative_game_completion,
    get_authoritative_leaderboard,
    save_authoritative_analysis,
    get_user_analysis_history,
    get_memory_db
)
from models.progression import GameCompletionRequest
from routes.progression import complete_game_authoritative, get_leaderboard
from routes.analysis import analyze_network_load, save_analysis_snapshot
from models.network import NetworkLoadRequest
from models.progression import SaveAnalysisRequest


DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "network_load.csv"


def run_async(coro):
    """Executes a synchronous generator pump for in-memory coroutines."""
    try:
        coro.send(None)
    except StopIteration as exc:
        return exc.value


class TestPhase10StatisticalGroundTruth:
    """
    Validates statistical correctness using the actual 24-record dataset
    against mathematical ground truth for Course 25CS203.
    """

    def test_dataset_record_count_and_extrema(self):
        telemetry = load_telemetry_from_csv(DATA_PATH)
        assert len(telemetry) == 24
        assert math.isclose(float(np.min(telemetry)), 16.4, abs_tol=1e-4)
        assert math.isclose(float(np.max(telemetry)), 62.0, abs_tol=1e-4)

    def test_dataset_moments_mean_variance_std(self):
        telemetry = load_telemetry_from_csv(DATA_PATH)
        mean_val = calculate_mean(telemetry)
        var_val = calculate_variance(telemetry, sample=True)
        std_val = calculate_std_dev(telemetry, sample=True)

        # Expected reference values:
        # Mean ≈ 39.7667 Mbps
        # Sample variance ≈ 195.2380 (ddof=1)
        # Sample standard deviation ≈ 13.9728 Mbps (ddof=1)
        assert math.isclose(mean_val, 39.7667, abs_tol=1e-3)
        assert math.isclose(var_val, 195.2380, abs_tol=1e-2)
        assert math.isclose(std_val, 13.9728, abs_tol=1e-3)

    def test_golden_benchmark_62_mbps(self):
        """
        Comprehensive test of the 62.0 Mbps master golden case:
        Z = (62.0 - 39.7667) / 13.9728 ≈ +1.5912
        P(X <= 62) ≈ 0.944217
        P(X >= 62) ≈ 0.055783
        Classification: NORMAL
        Health Score: 85/100 (Band: Healthy)
        """
        telemetry = load_telemetry_from_csv(DATA_PATH)
        mean_val = calculate_mean(telemetry)
        std_val = calculate_std_dev(telemetry, sample=True)

        load = 62.0
        z_val = calculate_z_score(load, mean_val, std_val)
        cdf_val = calculate_cdf(load, mean_val, std_val)
        exceed_val = calculate_upper_tail(load, mean_val, std_val)
        status_val = classify_z_score(z_val)
        health_val = calculate_health_score(z_val)
        band_val = get_health_band(health_val)

        assert math.isclose(z_val, 1.5912, abs_tol=1e-3)
        assert math.isclose(cdf_val, 0.944217, abs_tol=1e-3)
        assert math.isclose(exceed_val, 0.055783, abs_tol=1e-3)
        assert math.isclose(cdf_val + exceed_val, 1.0, abs_tol=1e-6)
        assert status_val == "NORMAL"
        assert health_val == 85
        assert band_val == "Healthy"


class TestPhase10ProgressionTiersAndRules:
    """Validates 5-tier level progression mathematically across boundaries."""

    def test_level_progression_thresholds(self):
        # Level 1: 0 - 99 XP -> Analyst Intern
        assert calculate_level(0) == 1
        assert calculate_level(99) == 1
        assert get_level_title(1) == "Analyst Intern"

        # Level 2: 100 - 249 XP -> Junior NOC Operator
        assert calculate_level(100) == 2
        assert calculate_level(249) == 2
        assert get_level_title(2) == "Junior NOC Operator"

        # Level 3: 250 - 449 XP -> Telemetry Specialist
        assert calculate_level(250) == 3
        assert calculate_level(449) == 3
        assert get_level_title(3) == "Telemetry Specialist"

        # Level 4: 450 - 699 XP -> Senior Systems Analyst
        assert calculate_level(450) == 4
        assert calculate_level(699) == 4
        assert get_level_title(4) == "Senior Systems Analyst"

        # Level 5: 700+ XP -> Chief Infrastructure Architect
        assert calculate_level(700) == 5
        assert calculate_level(1500) == 5
        assert get_level_title(5) == "Chief Infrastructure Architect"

    def test_negative_xp_resilience(self):
        assert calculate_level(-10) == 1
        assert calculate_level(None) == 1


class TestPhase10LeaderboardPrivacy:
    """Verifies leaderboard privacy guarantees and non-exposure of private data."""

    def test_leaderboard_contains_only_public_fields(self):
        res = run_async(get_leaderboard(limit=10))
        assert hasattr(res, "entries")
        for entry in res.entries:
            # Entry must expose only rank, username, level, total_xp
            assert hasattr(entry, "rank")
            assert hasattr(entry, "username")
            assert hasattr(entry, "level")
            assert hasattr(entry, "total_xp")
            # Must NOT expose confidential attributes
            assert not hasattr(entry, "email")
            assert not hasattr(entry, "user_id")
            assert not hasattr(entry, "id")
            assert not hasattr(entry, "password")


class TestPhase10AllFiveGamesVerification:
    """Verifies that all 5 educational games are authoritatively graded."""

    def setup_method(self):
        get_memory_db().reset()

    def test_01_traffic_controller(self):
        user = {"id": "p10-u1", "email": "u1@karunya.edu.in", "user_metadata": {"username": "pilot_01"}}
        req = GameCompletionRequest(
            game_id="traffic_controller",
            scenario_id="traffic_baseline_01",
            user_decision="Emergency Response",
            idempotency_key="p10-key-tc-1"
        )
        res = run_async(complete_game_authoritative(req, current_user=user))
        assert res.is_correct is True
        assert res.score == 100
        assert res.xp_awarded > 0

    def test_02_zscore_challenge(self):
        user = {"id": "p10-u2", "email": "u2@karunya.edu.in", "user_metadata": {"username": "pilot_02"}}
        req = GameCompletionRequest(
            game_id="zscore_challenge",
            scenario_id="zscore_challenge_01",
            user_decision="2.4",
            user_z_score=2.4,
            idempotency_key="p10-key-zc-1"
        )
        res = run_async(complete_game_authoritative(req, current_user=user))
        assert res.is_correct is True
        assert res.score == 100

    def test_03_normal_curve_challenge(self):
        user = {"id": "p10-u3", "email": "u3@karunya.edu.in", "user_metadata": {"username": "pilot_03"}}
        req = GameCompletionRequest(
            game_id="normal_curve_challenge",
            scenario_id="normal_curve_01",
            user_decision="2.0",
            user_z_score=2.0,
            idempotency_key="p10-key-nc-1"
        )
        res = run_async(complete_game_authoritative(req, current_user=user))
        assert res.is_correct is True

    def test_04_anomaly_hunter(self):
        user = {"id": "p10-u4", "email": "u4@karunya.edu.in", "user_metadata": {"username": "pilot_04"}}
        req = GameCompletionRequest(
            game_id="anomaly_hunter",
            scenario_id="anomaly_hunter_01",
            user_decision="91",
            idempotency_key="p10-key-ah-1"
        )
        res = run_async(complete_game_authoritative(req, current_user=user))
        assert res.is_correct is True

    def test_05_emergency_mission(self):
        user = {"id": "p10-u5", "email": "u5@karunya.edu.in", "user_metadata": {"username": "pilot_05"}}
        req = GameCompletionRequest(
            game_id="emergency_mission",
            scenario_id="emergency_mission_01",
            step=3,
            user_decision="Activate rate-limiting and DDoS scrubbers",
            idempotency_key="p10-key-em-3"
        )
        res = run_async(complete_game_authoritative(req, current_user=user))
        assert res.is_correct is True


class TestPhase10GoldenBridgeAndHistory:
    """Verifies Technical Lab Save & History Golden Bridge integrity."""

    def setup_method(self):
        get_memory_db().reset()

    def test_save_and_retrieve_audit_snapshot(self):
        user = {"id": "p10-hist-u", "email": "hist@karunya.edu.in", "user_metadata": {"username": "hist_analyst"}}
        req = SaveAnalysisRequest(
            network_load=62.0,
            dataset="campus_network"
        )
        res = run_async(save_analysis_snapshot(req, current_user=user))
        assert res.saved is True
        assert res.history_id is not None
        assert math.isclose(res.analysis["z_score"], 1.5912, abs_tol=1e-2)

        # Retrieve user history
        records, total = run_async(get_user_analysis_history(user["id"]))
        assert total == 1
        assert math.isclose(float(records[0]["current_load"]), 62.0, abs_tol=1e-2)
