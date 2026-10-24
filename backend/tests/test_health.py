"""
Unit Tests for health.py
NetPulse - Course Code: 25CS203
"""

import sys
from pathlib import Path
import pytest

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from services.health import (
    calculate_health_score,
    get_health_band,
    evaluate_network_health,
    BAND_EXCELLENT,
    BAND_HEALTHY,
    BAND_WARNING,
    BAND_POOR,
    BAND_CRITICAL
)


class TestHealthScoreFormula:
    """
    Tests for formula: H = max(0, min(100, round(100 - 25 * max(0, |Z| - 1))))
    """

    def test_within_one_sigma_perfect_score(self):
        # |Z| <= 1.0 -> 100 points
        assert calculate_health_score(0.0) == 100
        assert calculate_health_score(0.5) == 100
        assert calculate_health_score(-0.5) == 100
        assert calculate_health_score(1.0) == 100
        assert calculate_health_score(-1.0) == 100

    def test_known_master_z_2_4(self):
        # Z = 2.40:
        # Excess = 2.4 - 1.0 = 1.4
        # Penalty = 25 * 1.4 = 35
        # Health = 100 - 35 = 65
        assert calculate_health_score(2.4) == 65
        assert calculate_health_score(-2.4) == 65

    def test_healthy_band_z_2_0(self):
        # Z = 2.0 -> Excess = 1.0 -> Penalty = 25 -> Health = 75
        assert calculate_health_score(2.0) == 75
        assert calculate_health_score(-2.0) == 75

    def test_clamping_to_zero_at_high_z(self):
        # At Z >= 5.0, raw score <= 100 - 25*4 = 0
        assert calculate_health_score(5.0) == 0
        assert calculate_health_score(8.2) == 0
        assert calculate_health_score(-6.0) == 0


class TestHealthBands:
    """Tests for classification into the 5 operational bands."""

    def test_excellent_band_90_to_100(self):
        assert get_health_band(100) == BAND_EXCELLENT
        assert get_health_band(95) == BAND_EXCELLENT
        assert get_health_band(90) == BAND_EXCELLENT

    def test_healthy_band_70_to_89(self):
        assert get_health_band(89) == BAND_HEALTHY
        assert get_health_band(75) == BAND_HEALTHY
        assert get_health_band(70) == BAND_HEALTHY

    def test_warning_band_50_to_69(self):
        assert get_health_band(69) == BAND_WARNING
        assert get_health_band(65) == BAND_WARNING
        assert get_health_band(50) == BAND_WARNING

    def test_poor_band_30_to_49(self):
        assert get_health_band(49) == BAND_POOR
        assert get_health_band(40) == BAND_POOR
        assert get_health_band(30) == BAND_POOR

    def test_critical_band_0_to_29(self):
        assert get_health_band(29) == BAND_CRITICAL
        assert get_health_band(10) == BAND_CRITICAL
        assert get_health_band(0) == BAND_CRITICAL

    def test_invalid_score_raises_error(self):
        with pytest.raises(ValueError):
            get_health_band(101)
        with pytest.raises(ValueError):
            get_health_band(-5)


class TestEvaluateNetworkHealth:
    """Tests for aggregate evaluation payload."""

    def test_evaluate_master_scenario(self):
        result = evaluate_network_health(2.4)
        assert result["health_score"] == 65
        assert result["band"] == BAND_WARNING
        assert result["color_token"] == "amber"
        assert "academic_disclaimer" in result
