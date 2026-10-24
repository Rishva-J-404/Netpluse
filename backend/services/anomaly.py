"""
NETPULSE - Core Statistical Engine
Service: anomaly.py
Course: Probability and Statistics for Computer Science (25CS203)

Standardized Anomaly Classification:
- Z < -2.0           --> UNUSUALLY LOW  (Link degradation, packet drop, connection failure)
- -2.0 <= Z <= +2.0  --> NORMAL          (Nominal traffic, expected ~95.45% of variance)
- Z > +2.0           --> UNUSUALLY HIGH (Traffic surge, DDoS flood, concurrent streaming)

Note:
These thresholds (±2.0 standard deviations) are selected as the project-level
standard for the NETPULSE educational platform. In standard normal distributions,
P(|Z| > 2.0) ≈ 4.55%, providing a clean threshold for practical triage.
"""

from typing import Union, Sequence, List, Dict, Optional
import numpy as np

# NETPULSE Project-Level Anomaly Thresholds
ANOMALY_THRESHOLD_LOW: float = -2.0
ANOMALY_THRESHOLD_HIGH: float = 2.0

STATUS_UNUSUALLY_LOW: str = "UNUSUALLY LOW"
STATUS_NORMAL: str = "NORMAL"
STATUS_UNUSUALLY_HIGH: str = "UNUSUALLY HIGH"


def classify_z_score(z: Union[int, float]) -> str:
    """
    Classifies a standardized Z-score according to NETPULSE thresholds.
    
    Returns:
        "UNUSUALLY LOW" if Z < -2.0
        "NORMAL" if -2.0 <= Z <= 2.0
        "UNUSUALLY HIGH" if Z > 2.0
    """
    if z is None:
        raise ValueError("Z-score cannot be None.")
        
    z_val = float(z)
    if np.isnan(z_val):
        raise ValueError("Z-score cannot be NaN.")
        
    if z_val < ANOMALY_THRESHOLD_LOW:
        return STATUS_UNUSUALLY_LOW
    elif z_val > ANOMALY_THRESHOLD_HIGH:
        return STATUS_UNUSUALLY_HIGH
    else:
        return STATUS_NORMAL


def is_anomaly(z: Union[int, float]) -> bool:
    """
    Returns True if the Z-score exceeds the project-level ±2.0 standard deviation bounds.
    """
    return classify_z_score(z) != STATUS_NORMAL


def classify_network_load(
    load: Union[int, float],
    mean: Union[int, float],
    std_dev: Union[int, float]
) -> Dict[str, Union[float, str, bool]]:
    """
    Evaluates an observed load against baseline statistics and returns a classification payload.
    """
    from services.statistics import calculate_z_score
    
    z = calculate_z_score(load, mean, std_dev)
    status = classify_z_score(z)
    anomaly_flag = (status != STATUS_NORMAL)
    
    return {
        "load": float(load),
        "mean": float(mean),
        "std_dev": float(std_dev),
        "z_score": float(z),
        "status": status,
        "is_anomaly": anomaly_flag,
        "threshold_low": ANOMALY_THRESHOLD_LOW,
        "threshold_high": ANOMALY_THRESHOLD_HIGH
    }


def detect_anomalies_in_dataset(
    data: Sequence[Union[int, float]],
    mean: Optional[float] = None,
    std_dev: Optional[float] = None
) -> List[Dict[str, Union[int, float, str]]]:
    """
    Scans an entire telemetry sequence to identify all observations exceeding ±2.0 Z-scores.
    Returns list of anomaly details including index, load value, Z-score, and status.
    """
    from services.statistics import validate_telemetry_data, calculate_mean, calculate_std_dev, calculate_z_score
    
    arr = validate_telemetry_data(data)
    m = float(mean) if mean is not None else calculate_mean(arr)
    s = float(std_dev) if std_dev is not None else calculate_std_dev(arr, sample=True)
    
    anomalies = []
    for idx, val in enumerate(arr):
        z = calculate_z_score(val, m, s)
        status = classify_z_score(z)
        if status != STATUS_NORMAL:
            anomalies.append({
                "index": int(idx),
                "load": float(val),
                "z_score": float(round(z, 2)),
                "status": status
            })
            
    return anomalies
