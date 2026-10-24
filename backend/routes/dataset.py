"""
NETPULSE - Dataset & Scenarios Router
Endpoints:
- GET /api/dataset
- GET /api/scenarios
Course: Probability and Statistics for Computer Science (25CS203)
"""

from fastapi import APIRouter, HTTPException, Query, status
from pathlib import Path
import csv
import json

from models.results import DatasetResponse, DatasetRecord, ScenariosListResponse
from services.statistics import (
    load_telemetry_from_csv,
    calculate_mean,
    calculate_variance,
    calculate_std_dev
)

router = APIRouter(prefix="/api", tags=["Dataset"])

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "network_load.csv"
SCENARIOS_PATH = Path(__file__).resolve().parent.parent / "data" / "scenarios.json"


@router.get(
    "/dataset",
    response_model=DatasetResponse,
    summary="Retrieve Baseline Telemetry Dataset",
    description="Loads the 24-hour campus baseline network load dataset and computes statistical summary indicators using NumPy and Pandas."
)
async def get_dataset(name: str = Query(default="campus_network", description="Dataset identifier")):
    if not DATA_PATH.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset file '{DATA_PATH.name}' not found."
        )

    records = []
    try:
        with open(DATA_PATH, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    records.append(DatasetRecord(
                        timestamp=row["timestamp"].strip(),
                        network_load=float(row["network_load"])
                    ))
                except (ValueError, KeyError):
                    continue
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading dataset CSV: {e}"
        )

    if not records:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset contains no valid telemetry records."
        )

    # Compute statistical descriptors via services/statistics.py
    data_array = [r.network_load for r in records]
    mean_val = calculate_mean(data_array)
    var_val = calculate_variance(data_array, sample=True)
    std_val = calculate_std_dev(data_array, sample=True)
    min_val = min(data_array)
    max_val = max(data_array)

    return DatasetResponse(
        name=name,
        total_records=len(records),
        mean=float(round(mean_val, 4)),
        variance=float(round(var_val, 4)),
        std_dev=float(round(std_val, 4)),
        min=float(round(min_val, 2)),
        max=float(round(max_val, 2)),
        data=records
    )


@router.get(
    "/scenarios",
    response_model=ScenariosListResponse,
    summary="List Educational Challenge Scenarios",
    description="Returns pre-configured educational game and triage scenarios loaded from scenarios.json."
)
async def list_scenarios():
    if not SCENARIOS_PATH.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenarios definition file '{SCENARIOS_PATH.name}' not found."
        )

    try:
        with open(SCENARIOS_PATH, mode="r", encoding="utf-8") as f:
            scenarios_data = json.load(f)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading scenarios JSON: {e}"
        )

    return ScenariosListResponse(
        total_scenarios=len(scenarios_data),
        scenarios=scenarios_data
    )
