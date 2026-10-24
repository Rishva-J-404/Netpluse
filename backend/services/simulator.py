"""
NETPULSE - Core Statistical Engine
Service: simulator.py
Course: Probability and Statistics for Computer Science (25CS203)

Powers the What-If Simulator and dynamic parameter sweeps:
- Computes real-time Z-scores, normal CDF probabilities, anomaly statuses, and health scores
- Generates Gaussian Probability Density Function (PDF) curve points for dynamic rendering
- Generates standard deviation boundary markers (μ, ±1σ, ±2σ, ±3σ) and current load marker
- Supports parameterized parameter sweeps across custom bandwidth ranges
"""

from typing import Dict, List, Any, Optional
import numpy as np
from scipy.stats import norm

from services.statistics import calculate_z_score
from services.probability import calculate_cdf, generate_normal_pdf_coordinates
from services.anomaly import classify_z_score
from services.health import calculate_health_score, get_health_band


def simulate_load_point(
    current_load: float,
    mean: float = 50.0,
    std_dev: float = 5.0,
    num_curve_points: int = 60
) -> Dict[str, Any]:
    """
    Evaluates a single load point for real-time What-If slider updates without reloading the page.
    Returns complete statistical snapshot and chart coordinates.
    """
    load_val = float(current_load)
    mean_val = float(mean)
    std_val = float(std_dev)
    
    # 1. Statistical standardizations
    z = calculate_z_score(load_val, mean_val, std_val)
    prob_below = calculate_cdf(load_val, mean_val, std_val)
    status = classify_z_score(z)
    health = calculate_health_score(z)
    band = get_health_band(health)
    
    # 2. Bell curve continuous coordinates
    curve_coords = generate_normal_pdf_coordinates(mean_val, std_val, num_points=num_curve_points)
    
    # 3. Specific empirical bell curve markers
    s_safe = std_val if std_val > 1e-9 else 1.0
    load_pdf = float(norm.pdf(load_val, loc=mean_val, scale=s_safe)) if std_val > 1e-9 else 1.0
    mean_pdf = float(norm.pdf(mean_val, loc=mean_val, scale=s_safe)) if std_val > 1e-9 else 1.0
    
    markers = {
        "mean": {"x": round(mean_val, 2), "pdf": round(mean_pdf, 6), "label": "μ (Mean)"},
        "plus_1sd": {"x": round(mean_val + std_val, 2), "pdf": round(float(norm.pdf(mean_val + std_val, mean_val, s_safe)), 6), "label": "+1σ"},
        "minus_1sd": {"x": round(mean_val - std_val, 2), "pdf": round(float(norm.pdf(mean_val - std_val, mean_val, s_safe)), 6), "label": "-1σ"},
        "plus_2sd": {"x": round(mean_val + 2 * std_val, 2), "pdf": round(float(norm.pdf(mean_val + 2 * std_val, mean_val, s_safe)), 6), "label": "+2σ (Upper Limit)"},
        "minus_2sd": {"x": round(mean_val - 2 * std_val, 2), "pdf": round(float(norm.pdf(mean_val - 2 * std_val, mean_val, s_safe)), 6), "label": "-2σ (Lower Limit)"},
        "plus_3sd": {"x": round(mean_val + 3 * std_val, 2), "pdf": round(float(norm.pdf(mean_val + 3 * std_val, mean_val, s_safe)), 6), "label": "+3σ (Extreme Boundary)"},
        "minus_3sd": {"x": round(mean_val - 3 * std_val, 2), "pdf": round(float(norm.pdf(mean_val - 3 * std_val, mean_val, s_safe)), 6), "label": "-3σ (Extreme Boundary)"},
        "current_load": {"x": round(load_val, 2), "pdf": round(load_pdf, 6), "z_score": round(z, 2), "label": f"Current Load ({load_val:.1f} Mbps)"}
    }
    
    return {
        "current_load": float(round(load_val, 2)),
        "mean": float(round(mean_val, 2)),
        "std_dev": float(round(std_val, 2)),
        "z_score": float(round(z, 2)),
        "probability_below": float(round(prob_below, 4)),
        "percentage_below": float(round(prob_below * 100.0, 2)),
        "status": status,
        "health_score": health,
        "health_band": band,
        "curve_points": curve_coords,
        "markers": markers
    }


def generate_what_if_sweep(
    start_load: float = 20.0,
    end_load: float = 100.0,
    step: float = 5.0,
    mean: float = 50.0,
    std_dev: float = 5.0
) -> List[Dict[str, Any]]:
    """
    Generates a table of What-If responses across a bandwidth range.
    Useful for tabular simulations and sensitivity analysis.
    """
    if step <= 0:
        raise ValueError("Step size must be strictly positive.")
    if start_load > end_load:
        raise ValueError("start_load cannot be greater than end_load.")
        
    loads = np.arange(start_load, end_load + (step / 2.0), step)
    results = []
    
    for x in loads:
        z = calculate_z_score(x, mean, std_dev)
        p = calculate_cdf(x, mean, std_dev)
        status = classify_z_score(z)
        health = calculate_health_score(z)
        
        results.append({
            "load": float(round(x, 2)),
            "z_score": float(round(z, 2)),
            "probability": float(round(p, 4)),
            "status": status,
            "health_score": health
        })
        
    return results
