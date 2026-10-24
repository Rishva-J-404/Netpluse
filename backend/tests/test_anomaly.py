"""
Unit Tests for anomaly.py
NetPulse - Course Code: 25CS203
"""

import sys
from pathlib import Path
import pytest

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from services.anomaly import (
    classify_z_score,
    is_anomaly,
    classify_network_load,
    detect_anomalies_in_dataset,
    STATUS_NORMAL,
    STATUS_UNUSUALLY_HIGH,
    STATUS_UNUSUALLY_LOW,
    ANOMALY_THRESHOLD_LOW,
    ANOMALY_THRESHOLD_HIGH
)


class TestAnomalyClassificationBoundaries:
    """Tests for exact boundary classification at ±2.0 standard deviations."""

    def test_exact_negative_threshold_boundary(self):
        # -2.0 is included in NORMAL: -2.0 <= Z <= 2.0
        assert classify_z_score(-2.0) == STATUS_NORMAL
        assert is_anomaly(-2.0) is False

    def test_just_below_negative_threshold(self):
        # Z < -2.0 is UNUSUALLY LOW
        assert classify_z_score(-2.0001) == STATUS_UNUSUALLY_LOW
        assert is_anomaly(-2.0001) is True

    def test_deep_negative_anomaly(self):
        assert classify_z_score(-4.5) == STATUS_UNUSUALLY_LOW
        assert is_anomaly(-4.5) is True

    def test_exact_positive_threshold_boundary(self):
        # +2.0 is included in NORMAL: -2.0 <= Z <= 2.0
        assert classify_z_score(2.0) == STATUS_NORMAL
        assert is_anomaly(2.0) is False

    def test_just_above_positive_threshold(self):
        # Z > 2.0 is UNUSUALLY HIGH
        assert classify_z_score(2.0001) == STATUS_UNUSUALLY_HIGH
        assert is_anomaly(2.0001) is True

    def test_deep_positive_anomaly(self):
        # Master example: Z = 2.4 -> UNUSUALLY HIGH
        assert classify_z_score(2.4) == STATUS_UNUSUALLY_HIGH
        assert is_anomaly(2.4) is True

    def test_normal_operating_band(self):
        assert classify_z_score(0.0) == STATUS_NORMAL
        assert classify_z_score(1.0) == STATUS_NORMAL
        assert classify_z_score(-1.0) == STATUS_NORMAL
        assert classify_z_score(1.99) == STATUS_NORMAL
        assert classify_z_score(-1.99) == STATUS_NORMAL

    def test_none_input_raises_value_error(self):
        with pytest.raises(ValueError):
            classify_z_score(None)


class TestClassifyNetworkLoad:
    """Tests for the end-to-end load classification helper."""

    def test_campus_normal_load(self):
        # Load 50 Mbps, Mean 50, SD 5 -> Z = 0 -> NORMAL
        result = classify_network_load(50.0, mean=50.0, std_dev=5.0)
        assert result["z_score"] == pytest.approx(0.0)
        assert result["status"] == STATUS_NORMAL
        assert result["is_anomaly"] is False

    def test_campus_high_anomaly(self):
        # Load 62 Mbps, Mean 50, SD 5 -> Z = 2.4 -> UNUSUALLY HIGH
        result = classify_network_load(62.0, mean=50.0, std_dev=5.0)
        assert result["z_score"] == pytest.approx(2.4)
        assert result["status"] == STATUS_UNUSUALLY_HIGH
        assert result["is_anomaly"] is True


class TestDatasetAnomalyDetection:
    """Tests for scanning a telemetry dataset for outlier spikes."""

    def test_detect_known_outlier(self):
        # Game 4 scenario dataset: [48, 51, 49, 52, 50, 47, 53, 91, 51, 49]
        # Against baseline Mean=50, SD=5, 91 has Z = (91-50)/5 = 8.2 (> 2.0)
        dataset = [48.0, 51.0, 49.0, 52.0, 50.0, 47.0, 53.0, 91.0, 51.0, 49.0]
        anomalies = detect_anomalies_in_dataset(dataset, mean=50.0, std_dev=5.0)
        
        assert len(anomalies) == 1
        assert anomalies[0]["index"] == 7
        assert anomalies[0]["load"] == 91.0
        assert anomalies[0]["z_score"] == pytest.approx(8.2)
        assert anomalies[0]["status"] == STATUS_UNUSUALLY_HIGH
