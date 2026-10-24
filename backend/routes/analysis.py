"""
NETPULSE - Analysis Router
Endpoint: POST /api/analyze
Course: Probability and Statistics for Computer Science (25CS203)
"""

from fastapi import APIRouter, HTTPException, status
from pathlib import Path

from models.network import NetworkLoadRequest
from models.results import AnalysisResponse, FormulaBreakdown
from services.statistics import (
    calculate_mean,
    calculate_variance,
    calculate_std_dev,
    calculate_z_score,
    load_telemetry_from_csv,
    validate_telemetry_data,
    EmptyDatasetError
)
from services.probability import calculate_cdf, calculate_upper_tail
from services.anomaly import classify_z_score
from services.health import calculate_health_score, get_health_band
from services.explanation import build_full_explanation

router = APIRouter(prefix="/api", tags=["Analysis"])

# Path to the baseline campus telemetry dataset
DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "network_load.csv"


@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    summary="Analyze Network Load Telemetry",
    description="Calculates mean, sample variance (ddof=1), sample standard deviation, Z-score, Normal CDF probabilities, anomaly classification, and health score."
)
async def analyze_network_load(req: NetworkLoadRequest):
    # 1. Ingestion: Custom array vs Baseline CSV
    try:
        if req.custom_data is not None and len(req.custom_data) > 0:
            telemetry = validate_telemetry_data(req.custom_data)
        else:
            if not DATA_PATH.exists():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Baseline dataset '{req.dataset}' not found on server."
                )
            telemetry = load_telemetry_from_csv(DATA_PATH)
    except EmptyDatasetError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to load dataset: {e}")

    # 2. Descriptive statistics via services/statistics.py
    mean_val = calculate_mean(telemetry)
    var_val = calculate_variance(telemetry, sample=True)
    std_val = calculate_std_dev(telemetry, sample=True)

    # 3. Z-Score calculation with zero-variance safety
    z_val = calculate_z_score(req.network_load, mean_val, std_val)

    # 4. Probabilities via services/probability.py (SciPy norm)
    prob_below = calculate_cdf(req.network_load, mean_val, std_val)
    prob_above = calculate_upper_tail(req.network_load, mean_val, std_val)

    # 5. Anomaly classification via services/anomaly.py (±2.0σ NETPULSE threshold)
    status_label = classify_z_score(z_val)

    # 6. Network health score and band via services/health.py
    health_num = calculate_health_score(z_val)
    health_band_str = get_health_band(health_num)

    # 7. Step-by-step academic explanation via services/explanation.py
    exp_package = build_full_explanation(
        load=req.network_load,
        mean=mean_val,
        variance=var_val,
        std_dev=std_val,
        z=z_val,
        prob_below=prob_below,
        status=status_label,
        health_score=health_num,
        band=health_band_str
    )

    formula = FormulaBreakdown(
        z_formula=f"Z = ({req.network_load:.2f} - {mean_val:.2f}) / {std_val:.2f}",
        z_result=f"{z_val:+.4f}" if z_val != 0 else "0.0000",
        mean_formula="μ = (1 / n) * Σ(x_i)",
        variance_formula="s² = (1 / (n - 1)) * Σ(x_i - μ)² [Bessel's Correction]",
        std_formula="s = √(s²)"
    )

    return AnalysisResponse(
        mean=float(round(mean_val, 4)),
        variance=float(round(var_val, 4)),
        std_dev=float(round(std_val, 4)),
        current_load=float(round(req.network_load, 2)),
        z_score=float(round(z_val, 4)),
        probability=float(round(prob_below, 6)),
        exceedance_probability=float(round(prob_above, 6)),
        status=status_label,
        health_score=health_num,
        health_band=health_band_str,
        explanation=exp_package["summary"],
        formula_breakdown=formula
    )
