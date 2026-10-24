"""
NETPULSE - Core Statistical Engine
Service: probability.py
Course: Probability and Statistics for Computer Science (25CS203)

Computes normal distribution probabilities using SciPy (scipy.stats.norm):
- Cumulative Distribution Function (CDF): P(X ≤ x)
- Survival Function / Upper Tail: P(X ≥ x)
- Interval Probability: P(a ≤ X ≤ b)
- Standard normal conversions (Z-score to probability and inverse PPF)
- Continuous Probability Density Function (PDF) coordinate generation
"""

from typing import Union, List, Dict, Optional
import numpy as np
from scipy.stats import norm


def calculate_cdf(x: Union[int, float], mean: Union[int, float], std_dev: Union[int, float]) -> float:
    """
    Computes cumulative probability P(X ≤ x) for a Normal Distribution N(μ, σ²).
    
    Formula:
        P(X ≤ x) = Φ((x - μ) / σ) = (1 / (σ √(2π))) ∫_{-∞}^x e^(-(t - μ)² / (2σ²)) dt
        
    Zero-Variance Edge Case:
        If std_dev is 0, probability collapses to a step function at μ:
        returns 1.0 if x >= μ else 0.0.
    """
    if x is None or mean is None or std_dev is None:
        raise ValueError("Parameters x, mean, and std_dev cannot be None.")
        
    x_val = float(x)
    mean_val = float(mean)
    std_val = float(std_dev)
    
    if np.isnan(x_val) or np.isnan(mean_val) or np.isnan(std_val):
        raise ValueError("Probability parameters cannot be NaN.")
        
    if std_val < 0:
        raise ValueError(f"Standard deviation cannot be negative: {std_val}")
        
    if std_val <= 1e-9:
        return 1.0 if x_val >= mean_val else 0.0
        
    return float(norm.cdf(x_val, loc=mean_val, scale=std_val))


def calculate_upper_tail(x: Union[int, float], mean: Union[int, float], std_dev: Union[int, float]) -> float:
    """
    Computes upper-tail probability P(X ≥ x) for a Normal Distribution N(μ, σ²).
    
    Uses SciPy's survival function norm.sf() for high numerical stability in the extreme tail:
        P(X ≥ x) = 1 - P(X ≤ x)
    """
    if x is None or mean is None or std_dev is None:
        raise ValueError("Parameters x, mean, and std_dev cannot be None.")
        
    x_val = float(x)
    mean_val = float(mean)
    std_val = float(std_dev)
    
    if np.isnan(x_val) or np.isnan(mean_val) or np.isnan(std_val):
        raise ValueError("Probability parameters cannot be NaN.")
        
    if std_val < 0:
        raise ValueError(f"Standard deviation cannot be negative: {std_val}")
        
    if std_val <= 1e-9:
        return 1.0 if x_val <= mean_val else 0.0
        
    return float(norm.sf(x_val, loc=mean_val, scale=std_val))


def calculate_interval_probability(
    lower_a: Union[int, float],
    upper_b: Union[int, float],
    mean: Union[int, float],
    std_dev: Union[int, float]
) -> float:
    """
    Computes probability of load falling in an interval: P(a ≤ X ≤ b).
    
    Formula:
        P(a ≤ X ≤ b) = P(X ≤ b) - P(X ≤ a) = CDF(b) - CDF(a)
        
    Raises:
        ValueError: If lower_a > upper_b.
    """
    if lower_a is None or upper_b is None or mean is None or std_dev is None:
        raise ValueError("Interval parameters cannot be None.")
        
    a_val = float(lower_a)
    b_val = float(upper_b)
    mean_val = float(mean)
    std_val = float(std_dev)
    
    if a_val > b_val:
        raise ValueError(f"Lower bound 'a' ({a_val}) cannot be strictly greater than upper bound 'b' ({b_val}).")
        
    if std_val < 0:
        raise ValueError(f"Standard deviation cannot be negative: {std_val}")
        
    if std_val <= 1e-9:
        return 1.0 if (a_val <= mean_val <= b_val) else 0.0
        
    p_b = float(norm.cdf(b_val, loc=mean_val, scale=std_val))
    p_a = float(norm.cdf(a_val, loc=mean_val, scale=std_val))
    
    # Bound within [0.0, 1.0] to prevent floating noise
    return float(np.clip(p_b - p_a, 0.0, 1.0))


def z_to_probability(z: Union[int, float]) -> float:
    """
    Converts a standardized Z-score to standard normal cumulative probability Φ(Z).
    """
    if z is None:
        raise ValueError("Z-score cannot be None.")
    return float(norm.cdf(float(z), loc=0.0, scale=1.0))


def probability_to_z(p: Union[int, float]) -> float:
    """
    Inverse normal CDF (Percent Point Function / Quantile):
    Returns Z such that Φ(Z) = p.
    """
    if p is None:
        raise ValueError("Probability cannot be None.")
    p_val = float(p)
    if not (0.0 < p_val < 1.0):
        raise ValueError(f"Probability must be strictly between 0 and 1 (exclusive). Received: {p_val}")
    return float(norm.ppf(p_val, loc=0.0, scale=1.0))


def calculate_probability_region(
    mean: float,
    std_dev: float,
    lower: Optional[float] = None,
    upper: Optional[float] = None,
    calc_type: str = "below"
) -> Dict[str, Union[float, str]]:
    """
    Unified probability solver supporting 'below', 'above', and 'between' modes.
    """
    type_norm = calc_type.lower().strip()
    
    if type_norm == "below":
        if upper is None:
            raise ValueError("'upper' threshold required for 'below' calculation.")
        prob = calculate_cdf(upper, mean, std_dev)
        percentage = round(prob * 100, 2)
        return {
            "type": "below",
            "probability": prob,
            "percentage": percentage,
            "upper_bound": upper,
            "interpretation": f"There is a {percentage:.2f}% probability that network load will be at or below {upper:.1f} Mbps."
        }
        
    elif type_norm == "above":
        if lower is None:
            raise ValueError("'lower' threshold required for 'above' calculation.")
        prob = calculate_upper_tail(lower, mean, std_dev)
        percentage = round(prob * 100, 2)
        return {
            "type": "above",
            "probability": prob,
            "percentage": percentage,
            "lower_bound": lower,
            "interpretation": f"There is a {percentage:.2f}% probability that network load will exceed {lower:.1f} Mbps."
        }
        
    elif type_norm == "between":
        if lower is None or upper is None:
            raise ValueError("Both 'lower' and 'upper' bounds required for 'between' calculation.")
        prob = calculate_interval_probability(lower, upper, mean, std_dev)
        percentage = round(prob * 100, 2)
        return {
            "type": "between",
            "probability": prob,
            "percentage": percentage,
            "lower_bound": lower,
            "upper_bound": upper,
            "interpretation": f"There is a {percentage:.2f}% probability that network load falls between {lower:.1f} Mbps and {upper:.1f} Mbps."
        }
        
    else:
        raise ValueError(f"Unknown calculation type '{calc_type}'. Expected 'below', 'above', or 'between'.")


def generate_normal_pdf_coordinates(
    mean: float,
    std_dev: float,
    num_points: int = 60,
    num_std: float = 4.0
) -> List[Dict[str, float]]:
    """
    Generates (x, pdf) coordinate pairs along the Gaussian curve for frontend charting.
    Range: [μ - num_std * σ, μ + num_std * σ].
    """
    m = float(mean)
    s = float(std_dev) if float(std_dev) > 1e-9 else 1.0
    
    start_x = m - num_std * s
    end_x = m + num_std * s
    x_values = np.linspace(start_x, end_x, num_points)
    pdf_values = norm.pdf(x_values, loc=m, scale=s)
    
    coordinates = []
    for x_val, y_val in zip(x_values, pdf_values):
        coordinates.append({
            "x": float(round(x_val, 2)),
            "pdf": float(round(y_val, 6))
        })
        
    return coordinates
