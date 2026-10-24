"""
Unit Tests for statistics.py
NetPulse - Course Code: 25CS203
"""

import sys
from pathlib import Path
import pytest
import numpy as np

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from services.statistics import (
    calculate_mean,
    calculate_variance,
    calculate_std_dev,
    calculate_z_score,
    compute_telemetry_summary,
    validate_telemetry_data,
    EmptyDatasetError
)


class TestMeanCalculation:
    """Tests for arithmetic mean."""

    def test_known_mean_integers(self):
        data = [10, 20, 30, 40, 50]
        # (10+20+30+40+50)/5 = 30.0
        assert calculate_mean(data) == pytest.approx(30.0)

    def test_known_mean_floats(self):
        data = [42.0, 45.5, 49.0, 51.5]
        expected = (42.0 + 45.5 + 49.0 + 51.5) / 4.0  # 47.0
        assert calculate_mean(data) == pytest.approx(expected)

    def test_single_element_mean(self):
        assert calculate_mean([75.5]) == pytest.approx(75.5)

    def test_empty_dataset_raises_empty_error(self):
        with pytest.raises(EmptyDatasetError):
            calculate_mean([])

    def test_none_dataset_raises_empty_error(self):
        with pytest.raises(EmptyDatasetError):
            calculate_mean(None)

    def test_nan_values_raise_value_error(self):
        with pytest.raises(ValueError, match="NaN"):
            calculate_mean([10.0, np.nan, 30.0])

    def test_infinite_values_raise_value_error(self):
        with pytest.raises(ValueError, match="infinite"):
            calculate_mean([10.0, np.inf, 30.0])


class TestVarianceAndStdDev:
    """Tests for sample and population variance and standard deviation."""

    def test_sample_variance_ddof_1(self):
        # Known textbook sample: [2, 4, 4, 4, 5, 5, 7, 9]
        # n = 8, mean = 5.0
        # deviations: [-3, -1, -1, -1, 0, 0, 2, 4]
        # squared: [9, 1, 1, 1, 0, 0, 4, 16] -> sum = 32
        # sample variance = 32 / (8 - 1) = 32 / 7 ≈ 4.57142857
        # sample std = √(32/7) ≈ 2.1380899
        data = [2, 4, 4, 4, 5, 5, 7, 9]
        s_var = calculate_variance(data, sample=True)
        s_std = calculate_std_dev(data, sample=True)
        
        assert s_var == pytest.approx(32.0 / 7.0, rel=1e-5)
        assert s_std == pytest.approx(np.sqrt(32.0 / 7.0), rel=1e-5)

    def test_population_variance_ddof_0(self):
        # Same data, population variance = 32 / 8 = 4.0
        # population std = √4.0 = 2.0
        data = [2, 4, 4, 4, 5, 5, 7, 9]
        p_var = calculate_variance(data, sample=False)
        p_std = calculate_std_dev(data, sample=False)
        
        assert p_var == pytest.approx(4.0)
        assert p_std == pytest.approx(2.0)

    def test_single_element_sample_variance(self):
        # Single element has n=1, should return 0.0 safely
        assert calculate_variance([42.0], sample=True) == 0.0
        assert calculate_std_dev([42.0], sample=True) == 0.0

    def test_identical_values_zero_variance(self):
        data = [50.0, 50.0, 50.0, 50.0]
        assert calculate_variance(data, sample=True) == pytest.approx(0.0)
        assert calculate_std_dev(data, sample=True) == pytest.approx(0.0)


class TestZScoreCalculation:
    """Tests for standardized score Z = (X - μ) / σ."""

    def test_known_z_score_positive(self):
        # Master example: Current Load = 62 Mbps, Mean = 50 Mbps, SD = 5 Mbps
        # Z = (62 - 50) / 5 = 2.4
        z = calculate_z_score(62.0, 50.0, 5.0)
        assert z == pytest.approx(2.4, rel=1e-6)

    def test_known_z_score_negative(self):
        # Current Load = 38 Mbps, Mean = 50 Mbps, SD = 5 Mbps
        # Z = (38 - 50) / 5 = -2.4
        z = calculate_z_score(38.0, 50.0, 5.0)
        assert z == pytest.approx(-2.4, rel=1e-6)

    def test_zero_deviation_z_score(self):
        # When load equals the mean, Z = 0.0
        z = calculate_z_score(50.0, 50.0, 5.0)
        assert z == pytest.approx(0.0)

    def test_zero_variance_protection(self):
        # When std_dev = 0 (all values identical), must return 0.0 safely without error
        z = calculate_z_score(50.0, 50.0, 0.0)
        assert z == 0.0

    def test_negative_std_dev_raises_error(self):
        with pytest.raises(ValueError, match="negative"):
            calculate_z_score(62.0, 50.0, -5.0)

    def test_none_input_raises_error(self):
        with pytest.raises(ValueError):
            calculate_z_score(None, 50.0, 5.0)


class TestTelemetrySummary:
    """Tests for aggregate statistical profile dictionary."""

    def test_summary_dictionary_keys(self):
        data = [42.0, 48.0, 50.0, 52.0, 58.0]
        summary = compute_telemetry_summary(data, current_load=58.0)
        
        assert summary["count"] == 5
        assert summary["mean"] == pytest.approx(50.0)
        assert summary["min"] == 42.0
        assert summary["max"] == 58.0
        assert summary["current_load"] == 58.0
        assert "sample_variance" in summary
        assert "sample_std_dev" in summary
        assert "z_score" in summary
