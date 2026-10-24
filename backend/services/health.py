"""
NETPULSE - Core Statistical Engine
Service: health.py
Course: Probability and Statistics for Computer Science (25CS203)

Application-Level Network Health Score:
Calculates a bounded operational score H in [0, 100] based on absolute standardized distance |Z|:
    H = max(0, min(100, round(100 - 25 * max(0, |Z| - 1))))

Operational Bands:
- 90–100 : Excellent (Optimal operational tolerance, |Z| ≤ 1.4)
- 70–89  : Healthy   (Nominal variance within ±2.0 standard deviations)
- 50–69  : Warning   (Elevated deviation, close to or exceeding ±2.0σ threshold)
- 30–49  : Poor      (Significant deviation beyond 3.0σ)
- 0–29   : Critical  (Extreme anomaly or connection drop, |Z| ≥ 3.84)

IMPORTANT ACADEMIC NOTE:
This score is a project-specific composite index designed for the NETPULSE educational
NOC platform to provide intuitive feedback. It is NOT an ISO or universal statistical standard.
"""

from typing import Union, Dict
import numpy as np

BAND_EXCELLENT: str = "Excellent"
BAND_HEALTHY: str = "Healthy"
BAND_WARNING: str = "Warning"
BAND_POOR: str = "Poor"
BAND_CRITICAL: str = "Critical"


def calculate_health_score(z: Union[int, float]) -> int:
    """
    Computes the application-level Network Health Score (0 - 100).
    
    Formula:
        H = max(0, min(100, round(100 - 25 * max(0, |Z| - 1))))
    """
    if z is None:
        raise ValueError("Z-score cannot be None.")
        
    z_val = float(z)
    if np.isnan(z_val):
        raise ValueError("Z-score cannot be NaN.")
        
    abs_z = abs(z_val)
    
    # Deviation beyond 1.0 standard deviation incurs a 25-point penalty per sigma
    excess_sigma = max(0.0, abs_z - 1.0)
    raw_score = 100.0 - (25.0 * excess_sigma)
    
    clamped_score = max(0.0, min(100.0, raw_score))
    return int(round(clamped_score))


def get_health_band(score: int) -> str:
    """
    Maps an integer health score in [0, 100] to its operational status band.
    """
    if score is None:
        raise ValueError("Score cannot be None.")
    s = int(score)
    if not (0 <= s <= 100):
        raise ValueError(f"Health score must be between 0 and 100. Received: {s}")
        
    if s >= 90:
        return BAND_EXCELLENT
    elif s >= 70:
        return BAND_HEALTHY
    elif s >= 50:
        return BAND_WARNING
    elif s >= 30:
        return BAND_POOR
    else:
        return BAND_CRITICAL


def evaluate_network_health(z: Union[int, float]) -> Dict[str, Union[int, str]]:
    """
    Comprehensive evaluation of network health returning score, band, descriptive text,
    and recommended action.
    """
    score = calculate_health_score(z)
    band = get_health_band(score)
    
    if band == BAND_EXCELLENT:
        desc = "Network load is tightly centered around baseline average. Operational headroom is optimal."
        action = "Maintain routine telemetry monitoring."
        color = "emerald"
    elif band == BAND_HEALTHY:
        desc = "Network load shows expected variance within normal ±2.0 standard deviation boundaries."
        action = "Standard telemetry tracking. No intervention required."
        color = "cyan"
    elif band == BAND_WARNING:
        desc = "Network load is approaching or exceeding project anomaly boundaries. Elevated variance detected."
        action = "Flag gateway for heightened telemetry observation and verify queue depths."
        color = "amber"
    elif band == BAND_POOR:
        desc = "Significant statistical anomaly. Load is between 3.0 and 4.0 standard deviations from average."
        action = "Initiate traffic investigation; check for rogue streaming or backup transfers."
        color = "orange"
    else:  # Critical
        desc = "Extreme statistical breach (>3.8 standard deviations from mean) or near-total link drop."
        action = "Trigger immediate automated rate-limiting or emergency incident response."
        color = "rose"
        
    return {
        "health_score": score,
        "band": band,
        "description": desc,
        "recommended_action": action,
        "color_token": color,
        "academic_disclaimer": "NETPULSE application-level index based on deviation penalty formula."
    }
