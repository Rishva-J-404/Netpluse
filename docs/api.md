# NETPULSE REST API Specification
**Course:** Probability and Statistics for Computer Science (25CS203)  
**Base URL:** `http://localhost:8000`  
**Swagger UI:** `http://localhost:8000/docs`  
**ReDoc:** `http://localhost:8000/redoc`

All statistical operations are performed using NumPy, SciPy (`scipy.stats.norm`), and Pandas.

---

## 1. System Discovery & Heartbeat

### `GET /`
Returns service metadata and course verification.

**Response `200 OK`:**
```json
{
  "project": "NETPULSE",
  "title": "Network Load Analysis Using Normal Distribution",
  "course": "Probability and Statistics for Computer Science (25CS203)",
  "status": "operational",
  "version": "1.0.0",
  "documentation": "/docs"
}
```

### `GET /health`
Liveness and statistical engine status probe.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "service": "netpulse-fastapi",
  "statistical_engine": "online"
}
```

---

## 2. Core Statistical Endpoints

### `POST /api/analyze`
Executes end-to-end telemetry analysis across descriptive statistics, standardized Z-score, SciPy cumulative distribution functions, empirical anomaly detection, and the NETPULSE network health score formula.

#### Request Body
```json
{
  "network_load": 62.0,
  "dataset": "campus_network",
  "custom_data": null
}
```
* `network_load` (float, required, $\ge 0$): Observed load in Mbps.
* `dataset` (string, optional, default `"campus_network"`): Dataset identifier.
* `custom_data` (array of floats, optional): Optional sample series. If provided, overrides the baseline dataset.

#### Response `200 OK` (Golden Benchmark Case)
```json
{
  "mean": 39.7667,
  "variance": 195.2380,
  "std_dev": 13.9728,
  "current_load": 62.0,
  "z_score": 1.5912,
  "probability": 0.9442,
  "exceedance_probability": 0.0558,
  "status": "NORMAL",
  "health_score": 85,
  "health_band": "Healthy",
  "explanation": "Observed network load: 62.00 Mbps. Baseline sample statistics: Mean \u03bc = 39.77 Mbps, Sample Standard Deviation s = 13.97 Mbps. The calculated Z-score is +1.5912, indicating this load lies 1.59 standard deviations above the mean. Assuming a normal distribution, the probability of observing a load \u2264 62.00 Mbps is 94.42%, while the exceedance probability P(X \u2265 62.00) is 5.58%. Operational Assessment: NORMAL (-2.0 \u2264 Z \u2264 +2.0). Overall Network Health Score: 85/100 (Healthy).",
  "formula_breakdown": {
    "z_formula": "Z = (62.00 - 39.77) / 13.97",
    "z_result": "+1.5912",
    "mean_formula": "\u03bc = (1 / n) * \u03a3(x_i)",
    "variance_formula": "s\u00b2 = (1 / (n - 1)) * \u03a3(x_i - \u03bc)\u00b2 [Bessel's Correction]",
    "std_formula": "s = \u221a(s\u00b2)"
  }
}
```

---

### `POST /api/probability`
Computes exact cumulative probabilities under Gaussian distribution $X \sim \mathcal{N}(\mu, \sigma^2)$ using SciPy `norm.cdf()` and `norm.sf()`.

#### Request Body
```json
{
  "mean": 50.0,
  "std_dev": 5.0,
  "lower_val": 45.0,
  "upper_val": 55.0,
  "calculation_type": "between"
}
```
* `calculation_type`: `"below"` ($P(X \le b)$), `"above"` ($P(X \ge a)$), or `"between"` ($P(a \le X \le b)$).

#### Response `200 OK`
```json
{
  "calculation_type": "between",
  "probability": 0.682689,
  "percentage": 68.27,
  "z_lower": -1.0,
  "z_upper": 1.0,
  "interpretation": "The probability of network load falling between 45.00 Mbps and 55.00 Mbps (Z between -1.00 and +1.00) is 68.27%."
}
```

---

### `POST /api/simulation`
Powers the What-If Simulator with dynamic load sweep, Z-score, SciPy CDF, status, health score, and 60-point Gaussian bell curve coordinate generation.

#### Request Body
```json
{
  "current_load": 62.0,
  "mean": 50.0,
  "std_dev": 5.0
}
```

#### Response `200 OK`
```json
{
  "current_load": 62.0,
  "z_score": 2.4,
  "probability": 0.991802,
  "status": "UNUSUALLY HIGH",
  "health_score": 65,
  "health_band": "Warning",
  "curve_points": [
    {"x": 30.0, "pdf": 0.000027},
    {"x": 50.0, "pdf": 0.079788},
    {"x": 70.0, "pdf": 0.000027}
  ],
  "markers": {
    "mean": {"x": 50.0, "pdf": 0.079788, "label": "\u03bc (Mean)"},
    "plus_1sd": {"x": 55.0, "pdf": 0.048394, "label": "+1\u03c3"},
    "minus_1sd": {"x": 45.0, "pdf": 0.048394, "label": "-1\u03c3"},
    "plus_2sd": {"x": 60.0, "pdf": 0.010798, "label": "+2\u03c3 (Upper Limit)"},
    "minus_2sd": {"x": 40.0, "pdf": 0.010798, "label": "-2\u03c3 (Lower Limit)"},
    "current_load": {"x": 62.0, "pdf": 0.004479, "z_score": 2.4, "label": "Current Load (62.0 Mbps)"}
  }
}
```

---

### `POST /api/games/check-answer`
Validates educational challenge decisions against the mathematical engine, awards XP, and generates the Golden Bridge transfer payload.

#### Request Body
```json
{
  "game_id": "traffic_controller",
  "scenario_id": "traffic_controller_01",
  "user_decision": "Emergency Response",
  "user_z_score": null,
  "step": null
}
```
*Note:* The optional `step` integer parameter (1, 2, 3) enables individual stage grading for multi-step missions like `emergency_mission`.

#### Response `200 OK`
```json
{
  "is_correct": true,
  "correct_answer": "Emergency Response",
  "ground_truth": {
    "mean": 50.0,
    "std_dev": 5.0,
    "current_load": 91.0,
    "calculated_z": 8.2,
    "status": "UNUSUALLY HIGH",
    "correct_decision": "Emergency Response"
  },
  "xp_awarded": 10,
  "explanation": "At 91.0 Mbps with \u03bc = 50.0 and \u03c3 = 5.0, Z = (91 - 50) / 5 = +8.20. This is an extreme anomaly (> 3\u03c3) indicating severe network congestion requiring immediate emergency mitigation.",
  "technical_analysis": {
    "scenario_id": "traffic_controller_01",
    "game_id": "traffic_controller",
    "title": "Campus Registration Rush",
    "current_load": 91.0,
    "mean": 50.0,
    "std_dev": 5.0,
    "z_score": 8.2,
    "probability_below": 1.0,
    "status": "UNUSUALLY HIGH",
    "health_score": 0,
    "health_band": "Critical",
    "z_formula": "Z = (91.0 - 50.0) / 5.0 = 8.20",
    "explanation": "At 91.0 Mbps with \u03bc = 50.0 and \u03c3 = 5.0..."
  }
}
```

---

### `GET /api/dataset`
Loads the 24-hour baseline campus telemetry dataset and computes real-time descriptive statistics.

#### Query Parameters
* `name` (string, optional, default `"campus_network"`): Dataset identifier.

#### Response `200 OK`
```json
{
  "name": "campus_network",
  "total_records": 24,
  "mean": 39.7667,
  "variance": 195.2380,
  "std_dev": 13.9728,
  "min": 18.0,
  "max": 65.0,
  "data": [
    {"timestamp": "00:00", "network_load": 18.0},
    {"timestamp": "14:00", "network_load": 62.0}
  ]
}
```

---

### `GET /api/scenarios`
Returns all 5 curriculum game and triage scenarios from `scenarios.json`.

#### Response `200 OK`
```json
{
  "total_scenarios": 5,
  "scenarios": [
    {"id": "traffic_controller_01", "game": "traffic_controller", ...},
    {"id": "zscore_challenge_01", "game": "zscore_challenge", ...},
    {"id": "normal_curve_01", "game": "normal_curve_challenge", ...},
    {"id": "anomaly_hunter_01", "game": "anomaly_hunter", ...},
    {"id": "emergency_mission_01", "game": "emergency_mission", ...}
  ]
}
```

---

## 3. Standard Error Response Schemas

### `400 Bad Request`
```json
{
  "error": "HTTP Error",
  "status_code": 400,
  "message": "Lower bound (65.0) cannot be strictly greater than upper bound (45.0)."
}
```

### `404 Not Found`
```json
{
  "error": "HTTP Error",
  "status_code": 404,
  "message": "Scenario 'xyz' or game 'abc' not found."
}
```

### `422 Unprocessable Entity` (Pydantic Validation Error)
```json
{
  "error": "Validation Error",
  "status_code": 422,
  "details": [
    {
      "field": "body -> network_load",
      "message": "Input should be greater than or equal to 0",
      "type": "greater_than_equal"
    }
  ]
}
```
