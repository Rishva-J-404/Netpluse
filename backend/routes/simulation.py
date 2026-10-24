"""
NETPULSE - Simulation Router
Endpoint: POST /api/simulation
Course: Probability and Statistics for Computer Science (25CS203)
"""

from fastapi import APIRouter, HTTPException, status
from models.network import SimulationRequest
from models.results import SimulationResponse, CurvePoint
from services.simulator import simulate_load_point

router = APIRouter(prefix="/api", tags=["Simulation"])


@router.post(
    "/simulation",
    response_model=SimulationResponse,
    summary="Dynamic What-If Telemetry Simulation",
    description="Real-time parameter sweeper updating Z-score, CDF probability, anomaly status, health score, and Gaussian bell curve coordinates."
)
async def run_simulation(req: SimulationRequest):
    if req.std_dev is not None and req.std_dev <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Standard deviation must be strictly positive for normal simulation."
        )

    mean_val = req.mean if req.mean is not None else 50.0
    std_val = req.std_dev if req.std_dev is not None else 5.0

    try:
        sim = simulate_load_point(
            current_load=req.current_load,
            mean=mean_val,
            std_dev=std_val,
            num_curve_points=60
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Simulation error: {e}"
        )

    return SimulationResponse(
        current_load=sim["current_load"],
        z_score=sim["z_score"],
        probability=sim["probability_below"],
        status=sim["status"],
        health_score=sim["health_score"],
        health_band=sim["health_band"],
        curve_points=[CurvePoint(**pt) for pt in sim["curve_points"]],
        markers=sim["markers"]
    )
