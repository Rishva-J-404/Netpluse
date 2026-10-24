"""
Unit Tests for probability.py
NetPulse - Course Code: 25CS203
"""

import sys
from pathlib import Path
import pytest
from scipy.stats import norm

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from services.probability import (
    calculate_cdf,
    calculate_upper_tail,
    calculate_interval_probability,
    z_to_probability,
    probability_to_z,
    calculate_probability_region,
    generate_normal_pdf_coordinates
)


class TestNormalCDFCalculations:
    """Tests for normal cumulative distribution function."""

    def test_mean_probability_is_half(self):
        # By symmetry of Gaussian distribution, P(X ≤ μ) = 0.5
        p = calculate_cdf(50.0, mean=50.0, std_dev=5.0)
        assert p == pytest.approx(0.5, abs=1e-7)

    def test_known_z_1_96(self):
        # Z = 1.96 corresponds to 0.975 (97.5%)
        # For μ=0, σ=1, x=1.95996398
        p = calculate_cdf(1.95996398, mean=0.0, std_dev=1.0)
        assert p == pytest.approx(0.975, abs=1e-4)

    def test_known_master_scenario_z_2_4(self):
        # Load = 62.0, Mean = 50.0, SD = 5.0 -> Z = 2.40
        # norm.cdf(2.4) = 0.991802464...
        p = calculate_cdf(62.0, mean=50.0, std_dev=5.0)
        assert p == pytest.approx(0.9918, abs=1e-3)

    def test_zero_variance_degenerate_cdf(self):
        # Point distribution at 50.0:
        # Load >= 50.0 -> 1.0, Load < 50.0 -> 0.0
        assert calculate_cdf(52.0, mean=50.0, std_dev=0.0) == 1.0
        assert calculate_cdf(48.0, mean=50.0, std_dev=0.0) == 0.0


class TestUpperTailCalculations:
    """Tests for P(X ≥ x) survival function."""

    def test_upper_tail_complementarity(self):
        mean = 50.0
        std = 5.0
        x = 55.0
        p_below = calculate_cdf(x, mean, std)
        p_above = calculate_upper_tail(x, mean, std)
        # P(X ≤ x) + P(X ≥ x) = 1.0
        assert (p_below + p_above) == pytest.approx(1.0, abs=1e-7)

    def test_upper_tail_at_mean(self):
        p_above = calculate_upper_tail(50.0, mean=50.0, std_dev=5.0)
        assert p_above == pytest.approx(0.5, abs=1e-7)


class TestIntervalProbabilities:
    """Tests for empirical rule 68-95-99.7% intervals."""

    def test_one_sigma_empirical_interval(self):
        # [μ - σ, μ + σ] = [45, 55] for N(50, 25)
        # Theoretical: 68.2689%
        p = calculate_interval_probability(45.0, 55.0, mean=50.0, std_dev=5.0)
        assert p == pytest.approx(0.682689, abs=1e-4)

    def test_two_sigma_empirical_interval(self):
        # [μ - 2σ, μ + 2σ] = [40, 60] for N(50, 25)
        # Theoretical: 95.4499%
        p = calculate_interval_probability(40.0, 60.0, mean=50.0, std_dev=5.0)
        assert p == pytest.approx(0.954499, abs=1e-4)

    def test_three_sigma_empirical_interval(self):
        # [μ - 3σ, μ + 3σ] = [35, 65] for N(50, 25)
        # Theoretical: 99.7300%
        p = calculate_interval_probability(35.0, 65.0, mean=50.0, std_dev=5.0)
        assert p == pytest.approx(0.997300, abs=1e-4)

    def test_invalid_inverted_interval_raises_error(self):
        # Lower bound strictly greater than upper bound
        with pytest.raises(ValueError, match="strictly greater"):
            calculate_interval_probability(60.0, 40.0, mean=50.0, std_dev=5.0)


class TestZAndProbabilityConversions:
    """Tests for standard conversions and inverse PPF."""

    def test_z_to_probability(self):
        # Z = 0 -> 0.5
        assert z_to_probability(0.0) == pytest.approx(0.5)
        # Z = 1.0 -> ~0.8413
        assert z_to_probability(1.0) == pytest.approx(0.8413447, abs=1e-5)

    def test_probability_to_z_roundtrip(self):
        # Roundtrip Z -> P -> Z
        original_z = 2.4
        p = z_to_probability(original_z)
        reconstructed_z = probability_to_z(p)
        assert reconstructed_z == pytest.approx(original_z, rel=1e-5)

    def test_probability_to_z_boundary_errors(self):
        with pytest.raises(ValueError, match="between 0 and 1"):
            probability_to_z(0.0)
        with pytest.raises(ValueError, match="between 0 and 1"):
            probability_to_z(1.0)


class TestPDFCoordinates:
    """Tests for continuous normal curve coordinate generator."""

    def test_pdf_coordinates_count_and_peak(self):
        coords = generate_normal_pdf_coordinates(mean=50.0, std_dev=5.0, num_points=61)
        assert len(coords) == 61
        
        # Peak of normal distribution is at x = mean
        # f(μ) = 1 / (σ √(2π)) = 1 / (5 √(2π)) ≈ 0.079788
        center_point = next(pt for pt in coords if abs(pt["x"] - 50.0) < 0.2)
        assert center_point["pdf"] == pytest.approx(0.079788, abs=1e-3)
