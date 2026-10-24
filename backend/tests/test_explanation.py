"""
Unit Tests for explanation.py
NetPulse - Course Code: 25CS203
"""

import sys
from pathlib import Path
import pytest

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from services.explanation import (
    explain_mean,
    explain_variance,
    explain_std_dev,
    explain_z_score,
    explain_probability,
    explain_anomaly_classification,
    explain_health_score,
    build_full_explanation
)


class TestExplanationService:
    """Tests for deterministic explanation generators."""

    def test_explain_mean(self):
        exp = explain_mean(mean=50.0, count=24, total_sum=1200.0)
        assert "50.00" in exp["calculation_step"]
        assert "1200.00" in exp["calculation_step"]
        assert "baseline" in exp["explanation"]

    def test_explain_variance(self):
        exp = explain_variance(variance=25.0, sample=True)
        assert "Sample Variance" in exp["formula"] or "s²" in exp["formula"]
        assert "25.00" in exp["result"]

    def test_explain_z_score_master(self):
        exp = explain_z_score(load=62.0, mean=50.0, std_dev=5.0, z=2.4)
        assert "Z = (62.0 - 50.0) / 5.0" in exp["calculation_step"]
        assert "2.40" in exp["calculation_step"]
        assert "above" in exp["explanation"]

    def test_explain_anomaly_status(self):
        exp_high = explain_anomaly_classification(z=2.4, status="UNUSUALLY HIGH")
        assert "UNUSUALLY HIGH" in exp_high["status"]
        assert "+2.0" in exp_high["explanation"]

        exp_norm = explain_anomaly_classification(z=0.5, status="NORMAL")
        assert "95.45%" in exp_norm["explanation"]

    def test_explain_health_score(self):
        exp = explain_health_score(z=2.4, health_score=65, band="Warning")
        assert "65/100" in exp["health_score"]
        assert "Warning" in exp["band"]

    def test_build_full_explanation(self):
        full = build_full_explanation(
            load=62.0,
            mean=50.0,
            variance=25.0,
            std_dev=5.0,
            z=2.4,
            prob_below=0.9918,
            status="UNUSUALLY HIGH",
            health_score=65,
            band="Warning"
        )
        assert "summary" in full
        assert "62.0 Mbps" in full["summary"]
        assert "z_score" in full
        assert "probability" in full
