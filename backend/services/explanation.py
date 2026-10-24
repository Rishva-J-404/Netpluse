"""
NETPULSE - Core Statistical Engine
Service: explanation.py
Course: Probability and Statistics for Computer Science (25CS203)

Deterministic, beginner-friendly natural language and formula explanation generator.
Explains:
- Mean (μ)
- Variance (s²)
- Standard Deviation (s)
- Z-score (Z)
- Normal Cumulative Probability (P(X ≤ x))
- Anomaly Classification (Status)
- Network Health Score (H)

NOTE:
Calculations and explanations are strictly deterministic rule-based algorithms.
No external LLM or probabilistic model is used for truth determination.
"""

from typing import Dict, Any


def explain_mean(mean: float, count: int, total_sum: float) -> Dict[str, str]:
    """Generates educational breakdown for arithmetic mean."""
    formula = "μ = (1 / n) * Σ(x_i)"
    steps = f"μ = {total_sum:.2f} / {count} = {mean:.2f} Mbps"
    explanation = (
        f"The average network load is {mean:.2f} Mbps across {count} time samples. "
        f"This acts as the campus baseline against which individual traffic spikes or drops are measured."
    )
    return {
        "formula": formula,
        "calculation_step": steps,
        "explanation": explanation
    }


def explain_variance(variance: float, sample: bool = True) -> Dict[str, str]:
    """Generates educational breakdown for variance."""
    if sample:
        formula = "s² = (1 / (n - 1)) * Σ(x_i - μ)²"
        label = "Sample Variance (s²)"
    else:
        formula = "σ² = (1 / n) * Σ(x_i - μ)²"
        label = "Population Variance (σ²)"
        
    explanation = (
        f"The {label} is {variance:.2f} (Mbps)². Variance measures the average squared spread of "
        f"traffic observations around the baseline. Squaring ensures that positive and negative deviations "
        f"do not cancel each other out."
    )
    return {
        "formula": formula,
        "result": f"{variance:.2f} (Mbps)²",
        "explanation": explanation
    }


def explain_std_dev(std_dev: float, variance: float) -> Dict[str, str]:
    """Generates educational breakdown for standard deviation."""
    formula = "s = √(s²)"
    steps = f"s = √({variance:.2f}) = {std_dev:.2f} Mbps"
    explanation = (
        f"The standard deviation is {std_dev:.2f} Mbps. Taking the square root converts the squared variance "
        f"back into original units (Mbps). In a normal distribution, roughly 68% of routine traffic falls "
        f"within ±1 standard deviation of the average."
    )
    return {
        "formula": formula,
        "calculation_step": steps,
        "explanation": explanation
    }


def explain_z_score(load: float, mean: float, std_dev: float, z: float) -> Dict[str, str]:
    """Generates educational breakdown for Z-score."""
    formula = "Z = (X - μ) / σ"
    steps = f"Z = ({load:.1f} - {mean:.1f}) / {std_dev:.1f} = {z:.2f}"
    
    abs_z = abs(z)
    direction = "above" if z >= 0 else "below"
    
    if abs_z <= 1e-4:
        interpretation = f"Current load ({load:.1f} Mbps) exactly equals the campus baseline average (Z = 0.00)."
    elif abs_z <= 2.0:
        interpretation = (
            f"The network load of {load:.1f} Mbps is {abs_z:.2f} standard deviations {direction} average. "
            f"This falls within nominal operating limits (|Z| ≤ 2.0)."
        )
    else:
        interpretation = (
            f"The network load of {load:.1f} Mbps is {abs_z:.2f} standard deviations {direction} average. "
            f"Because it exceeds the ±2.0 threshold, this load is statistically unusual."
        )
        
    return {
        "formula": formula,
        "calculation_step": steps,
        "z_score_formatted": f"{z:+.2f}" if z != 0 else "0.00",
        "explanation": interpretation
    }


def explain_probability(load: float, z: float, prob_below: float) -> Dict[str, str]:
    """Generates educational breakdown for cumulative normal probability."""
    formula = "P(X ≤ x) = Φ(Z)"
    percentage = prob_below * 100.0
    steps = f"P(X ≤ {load:.1f}) = Φ({z:.2f}) = {prob_below:.4f}"
    
    explanation = (
        f"Based on the normal distribution, there is a {percentage:.2f}% probability that the network load "
        f"will be at or below {load:.1f} Mbps during regular operation. "
        f"Conversely, there is only a {(100.0 - percentage):.2f}% chance of exceeding this load."
    )
    return {
        "formula": formula,
        "calculation_step": steps,
        "percentage": f"{percentage:.2f}%",
        "explanation": explanation
    }


def explain_anomaly_classification(z: float, status: str) -> Dict[str, str]:
    """Generates explanation for the NETPULSE anomaly classification."""
    abs_z = abs(z)
    if status == "NORMAL":
        detail = (
            f"Status is NORMAL because |Z| = {abs_z:.2f} ≤ 2.0. "
            f"Under Gaussian assumptions, approximately 95.45% of all campus traffic resides in this nominal band."
        )
    elif status == "UNUSUALLY HIGH":
        detail = (
            f"Status is UNUSUALLY HIGH because Z = {z:+.2f} > +2.0. "
            f"This traffic spike has a less than 2.5% likelihood of occurring by random chance and requires monitoring or triage."
        )
    else:  # UNUSUALLY LOW
        detail = (
            f"Status is UNUSUALLY LOW because Z = {z:+.2f} < -2.0. "
            f"This sharp drop in bandwidth could indicate routing failure, a severed link, or an offline building gateway."
        )
        
    return {
        "status": status,
        "threshold_rule": "-2.0 ≤ Z ≤ +2.0 for NORMAL",
        "explanation": detail
    }


def explain_health_score(z: float, health_score: int, band: str) -> Dict[str, str]:
    """Generates educational breakdown for the Network Health Score."""
    abs_z = abs(z)
    excess = max(0.0, abs_z - 1.0)
    penalty = int(round(25.0 * excess))
    
    formula = "H = max(0, min(100, 100 - 25 * max(0, |Z| - 1)))"
    steps = f"H = max(0, 100 - 25 * max(0, {abs_z:.2f} - 1)) = 100 - {penalty} = {health_score}"
    
    explanation = (
        f"Network Health Score is {health_score}/100, classified as '{band}'. "
        f"The formula allows free variance within 1 standard deviation, and then deducts 25 health points "
        f"for each additional standard deviation of departure from the mean."
    )
    return {
        "formula": formula,
        "calculation_step": steps,
        "health_score": f"{health_score}/100",
        "band": band,
        "explanation": explanation
    }


def build_full_explanation(
    load: float,
    mean: float,
    variance: float,
    std_dev: float,
    z: float,
    prob_below: float,
    status: str,
    health_score: int,
    band: str
) -> Dict[str, Any]:
    """
    Compiles an all-in-one structured explanation package suitable for the Technical Lab view.
    """
    z_exp = explain_z_score(load, mean, std_dev, z)
    prob_exp = explain_probability(load, z, prob_below)
    anom_exp = explain_anomaly_classification(z, status)
    health_exp = explain_health_score(z, health_score, band)
    std_exp = explain_std_dev(std_dev, variance)
    
    summary_sentence = (
        f"Current network load of {load:.1f} Mbps gives Z = {z:+.2f} ({status}). "
        f"{z_exp['explanation']} Network health is evaluated at {health_score}/100 ({band})."
    )
    
    return {
        "summary": summary_sentence,
        "z_score": z_exp,
        "probability": prob_exp,
        "anomaly": anom_exp,
        "health": health_exp,
        "standard_deviation": std_exp
    }
