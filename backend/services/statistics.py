"""
NETPULSE - Core Statistical Engine
Service: statistics.py
Course: Probability and Statistics for Computer Science (25CS203)

Calculates descriptive and inferential statistics on network load telemetry:
- Arithmetic Mean (μ)
- Sample Variance (s²) with Bessel's correction (ddof=1)
- Sample Standard Deviation (s)
- Standardized Z-Score (Z)
- Zero-variance safety protection
- Strict input validation and edge-case handling
"""

from typing import Sequence, Union, Tuple, Optional
import numpy as np
import pandas as pd
from pathlib import Path


class EmptyDatasetError(ValueError):
    """Raised when an operation requires data points but received an empty dataset."""
    pass


class InsufficientDataError(ValueError):
    """Raised when sample variance or std requires at least 2 data points."""
    pass


def validate_telemetry_data(data: Sequence[Union[int, float]]) -> np.ndarray:
    """
    Validates and converts input telemetry to a clean 1D float64 NumPy array.
    
    Raises:
        EmptyDatasetError: If data is empty or None.
        ValueError: If data contains non-numeric, NaN, or Infinite values.
    """
    if data is None:
        raise EmptyDatasetError("Telemetry data cannot be None.")
    
    try:
        arr = np.asarray(data, dtype=np.float64)
    except (TypeError, ValueError) as err:
        raise ValueError(f"Telemetry data must contain purely numeric values: {err}")
    
    if arr.size == 0:
        raise EmptyDatasetError("Cannot compute statistics on an empty dataset.")
    
    arr = arr.ravel()
    
    if np.isnan(arr).any():
        raise ValueError("Telemetry data contains NaN (Not a Number) values.")
    
    if np.isinf(arr).any():
        raise ValueError("Telemetry data contains infinite values.")
        
    return arr


def calculate_mean(data: Sequence[Union[int, float]]) -> float:
    """
    Calculates the arithmetic mean of telemetry samples using NumPy.
    
    Formula:
        μ = (1 / n) * Σ(x_i)
    """
    arr = validate_telemetry_data(data)
    return float(np.mean(arr))


def calculate_variance(data: Sequence[Union[int, float]], sample: bool = True) -> float:
    """
    Calculates variance of telemetry samples.
    
    Parameters:
        data: Sequence of numeric load values.
        sample: If True (default), applies Bessel's correction (ddof=1)
                for an unbiased sample variance estimator (s²).
                If False, calculates population variance (ddof=0).
                
    Formula (sample=True):
        s² = (1 / (n - 1)) * Σ(x_i - x̄)²
    """
    arr = validate_telemetry_data(data)
    n = arr.size
    
    if sample:
        if n < 2:
            # Single observation has no sample degrees of freedom (0 variance)
            return 0.0
        return float(np.var(arr, ddof=1))
    else:
        return float(np.var(arr, ddof=0))


def calculate_std_dev(data: Sequence[Union[int, float]], sample: bool = True) -> float:
    """
    Calculates standard deviation of telemetry samples.
    
    Parameters:
        data: Sequence of numeric load values.
        sample: If True (default), calculates sample standard deviation (s) with ddof=1.
                If False, calculates population standard deviation (σ) with ddof=0.
                
    Formula (sample=True):
        s = √(s²)
    """
    arr = validate_telemetry_data(data)
    n = arr.size
    
    if sample:
        if n < 2:
            return 0.0
        return float(np.std(arr, ddof=1))
    else:
        return float(np.std(arr, ddof=0))


def calculate_z_score(x: Union[int, float], mean: Union[int, float], std_dev: Union[int, float]) -> float:
    """
    Calculates the standardized Z-score for a given network load.
    
    Formula:
        Z = (X - μ) / σ
        
    Zero-Variance Protection:
        If std_dev is 0 (or within floating-point epsilon 1e-9), all observations
        are identical. Returns 0.0 to prevent division by zero or NaN.
    """
    if x is None or mean is None or std_dev is None:
        raise ValueError("Parameters x, mean, and std_dev cannot be None.")
        
    x_val = float(x)
    mean_val = float(mean)
    std_val = float(std_dev)
    
    if np.isnan(x_val) or np.isnan(mean_val) or np.isnan(std_val):
        raise ValueError("Z-score parameters cannot be NaN.")
        
    if std_val < 0:
        raise ValueError(f"Standard deviation cannot be negative: {std_val}")
        
    if std_val <= 1e-9:
        # Zero variance protection: observation has zero deviation from uniform mean
        return 0.0
        
    return float((x_val - mean_val) / std_val)


def compute_telemetry_summary(data: Sequence[Union[int, float]], current_load: Optional[float] = None) -> dict:
    """
    Computes a comprehensive statistical profile of a telemetry series.
    """
    arr = validate_telemetry_data(data)
    mean_val = calculate_mean(arr)
    var_val = calculate_variance(arr, sample=True)
    std_val = calculate_std_dev(arr, sample=True)
    
    load_val = float(current_load) if current_load is not None else float(arr[-1])
    z_val = calculate_z_score(load_val, mean_val, std_val)
    
    return {
        "count": int(arr.size),
        "mean": float(mean_val),
        "sample_variance": float(var_val),
        "sample_std_dev": float(std_val),
        "min": float(np.min(arr)),
        "max": float(np.max(arr)),
        "current_load": float(load_val),
        "z_score": float(z_val)
    }


def load_telemetry_from_csv(csv_path: Union[str, Path], column: str = "network_load") -> np.ndarray:
    """
    Reads network telemetry from a CSV file into a validated NumPy array using Pandas.
    """
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"Telemetry CSV file not found: {path}")
        
    df = pd.read_csv(path)
    if column not in df.columns:
        raise KeyError(f"Expected column '{column}' in CSV. Found: {list(df.columns)}")
        
    series = df[column].dropna()
    return validate_telemetry_data(series.values)
