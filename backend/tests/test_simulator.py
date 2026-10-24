"""
Unit Tests for simulator.py
NetPulse - Course Code: 25CS203
"""

import sys
from pathlib import Path
import pytest

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from services.simulator import simulate_load_point, generate_what_if_sweep


class TestSimulateLoadPoint:
    """Tests for single load point What-If evaluation."""

    def test_nominal_baseline_load(self):
        # Current load at baseline mean (50.0 Mbps)
        res = simulate_load_point(current_load=50.0, mean=50.0, std_dev=5.0)
        assert res["current_load"] == 50.0
        assert res["z_score"] == 0.0
        assert res["probability_below"] == pytest.approx(0.5, abs=1e-4)
        assert res["status"] == "NORMAL"
        assert res["health_score"] == 100
        assert res["health_band"] == "Excellent"
        assert len(res["curve_points"]) > 0
        assert "markers" in res
        assert res["markers"]["mean"]["x"] == 50.0

    def test_master_scenario_peak_load_62(self):
        # Current load = 62.0 Mbps
        res = simulate_load_point(current_load=62.0, mean=50.0, std_dev=5.0)
        assert res["current_load"] == 62.0
        assert res["z_score"] == 2.40
        assert res["status"] == "UNUSUALLY HIGH"
        assert res["health_score"] == 65
        assert res["health_band"] == "Warning"
        assert res["percentage_below"] == pytest.approx(99.18, abs=0.1)

    def test_low_outlier_load_25(self):
        # Current load = 25.0 Mbps -> Z = (25 - 50)/5 = -5.0
        res = simulate_load_point(current_load=25.0, mean=50.0, std_dev=5.0)
        assert res["z_score"] == -5.0
        assert res["status"] == "UNUSUALLY LOW"
        assert res["health_score"] == 0
        assert res["health_band"] == "Critical"


class TestWhatIfSweep:
    """Tests for parameterized range sweep."""

    def test_sweep_range_and_progression(self):
        sweep = generate_what_if_sweep(start_load=40.0, end_load=60.0, step=5.0, mean=50.0, std_dev=5.0)
        # Loads: 40, 45, 50, 55, 60 (5 rows)
        assert len(sweep) == 5
        
        loads = [item["load"] for item in sweep]
        assert loads == [40.0, 45.0, 50.0, 55.0, 60.0]
        
        # Z-scores: -2.0, -1.0, 0.0, +1.0, +2.0
        z_scores = [item["z_score"] for item in sweep]
        assert z_scores == [-2.0, -1.0, 0.0, 1.0, 2.0]
        
        # All of these are inside the [-2, +2] normal band
        for item in sweep:
            assert item["status"] == "NORMAL"

    def test_invalid_sweep_parameters(self):
        with pytest.raises(ValueError, match="strictly positive"):
            generate_what_if_sweep(start_load=20.0, end_load=100.0, step=0.0)
            
        with pytest.raises(ValueError, match="greater than"):
            generate_what_if_sweep(start_load=100.0, end_load=20.0, step=5.0)
