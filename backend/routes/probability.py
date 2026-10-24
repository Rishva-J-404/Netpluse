"""
NETPULSE - Probability Router
Endpoint: POST /api/probability
Course: Probability and Statistics for Computer Science (25CS203)
"""

from fastapi import APIRouter, HTTPException, status
from models.network import ProbabilityRequest
from models.results import ProbabilityResponse
from services.probability import calculate_probability_region
from services.statistics import calculate_z_score

router = APIRouter(prefix="/api", tags=["Probability"])


@router.post(
    "/probability",
    response_model=ProbabilityResponse,
    summary="Compute Normal Cumulative & Interval Probabilities",
    description="Evaluates normal distribution tail P(X ≤ x), P(X ≥ x), or interval P(a ≤ X ≤ b) using SciPy norm.cdf()."
)
async def solve_probability(req: ProbabilityRequest):
    # Parameter verification based on requested region
    calc_type = req.calculation_type.lower().strip()
    
    if calc_type == "below":
        if req.upper_val is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Calculation type 'below' requires an 'upper_val' threshold."
            )
    elif calc_type == "above":
        if req.lower_val is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Calculation type 'above' requires a 'lower_val' threshold."
            )
    elif calc_type == "between":
        if req.lower_val is None or req.upper_val is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Calculation type 'between' requires both 'lower_val' and 'upper_val'."
            )
        if req.lower_val > req.upper_val:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Lower bound ({req.lower_val}) cannot be strictly greater than upper bound ({req.upper_val})."
            )

    try:
        sol = calculate_probability_region(
            mean=req.mean,
            std_dev=req.std_dev,
            lower=req.lower_val,
            upper=req.upper_val,
            calc_type=calc_type
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Probability calculation error: {e}")

    # Standardized Z-scores for bounds
    z_low = calculate_z_score(req.lower_val, req.mean, req.std_dev) if req.lower_val is not None else None
    z_up = calculate_z_score(req.upper_val, req.mean, req.std_dev) if req.upper_val is not None else None

    return ProbabilityResponse(
        calculation_type=calc_type,
        probability=float(round(sol["probability"], 6)),
        percentage=float(round(sol["percentage"], 2)),
        z_lower=float(round(z_low, 2)) if z_low is not None else None,
        z_upper=float(round(z_up, 2)) if z_up is not None else None,
        interpretation=sol["interpretation"]
    )
