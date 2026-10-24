"""
NETPULSE - Backend Application Bootstrap
Network Load Analysis Using Normal Distribution
Course Code: 25CS203
"""

import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from routes import analysis, probability, simulation, games, dataset

# Description and Metadata for generated Swagger/OpenAPI docs
app = FastAPI(
    title="NETPULSE Statistical Telemetry API",
    description=(
        "Educational Network Operations Center & Probability Analysis API for Course 25CS203.\n\n"
        "Connects real-time campus network load observations with Normal Distribution, "
        "Z-score normalization, SciPy cumulative probabilities, and empirical anomaly detection."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurable CORS for React Frontend (Vite: http://localhost:5173)
env_origins = os.getenv("ALLOWED_ORIGINS", "")
if env_origins:
    origins = [orig.strip() for orig in env_origins.split(",") if orig.strip()]
else:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Clean, student-friendly error handlers (prevent leaking raw stack traces)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        errors.append({
            "field": field,
            "message": err.get("msg", "Invalid input value"),
            "type": err.get("type", "value_error")
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "status_code": 422,
            "details": errors
        }
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP Error",
            "status_code": exc.status_code,
            "message": exc.detail
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "status_code": 500,
            "message": "An unexpected computational error occurred. Please verify your telemetry inputs."
        }
    )

# Register modular routes
app.include_router(analysis.router)
app.include_router(probability.router)
app.include_router(simulation.router)
app.include_router(games.router)
app.include_router(dataset.router)

@app.get("/", tags=["Health"])
async def root():
    return {
        "project": "NETPULSE",
        "title": "Network Load Analysis Using Normal Distribution",
        "course": "Probability and Statistics for Computer Science (25CS203)",
        "status": "operational",
        "version": "1.0.0",
        "documentation": "/docs"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "netpulse-fastapi",
        "statistical_engine": "online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
