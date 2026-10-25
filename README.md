# NETPULSE
### Network Load Analysis Using Normal Distribution

---

## 1. Project Overview & Problem Statement
Modern campus and enterprise networks generate continuous, high-volume telemetry. Identifying abnormal surges, configuration bottlenecks, and potential denial-of-service events requires rigorous statistical modeling rather than arbitrary heuristics. 

**NetPulse** is an interactive educational Network Operations Center (NOC) and statistical learning web application. It transforms abstract probability concepts into practical network administration tools:
- **Mean ($\mu$) & Variance ($\sigma^2$):** Establishing operational traffic baselines.
- **Normal Distribution & SciPy CDF:** Computing tail and interval probabilities $P(X \le x)$, $P(X \ge x)$, $P(a \le X \le b)$.
- **Standardized Z-Score ($Z$):** Normalizing load observations to quantify deviation from the mean.
- **Anomaly Detection:** Classifying traffic into three standardized zones ($Z < -2$, $-2 \le Z \le 2$, $Z > 2$).
- **Network Health Scoring:** Quantifying real-time operational status on an intuitive 0–100 scale.

---

## 2. Core Innovation: Dual-Mode Architecture & The Golden Bridge
NetPulse integrates two distinct operational environments backed by a single Python statistical authority:

1. **Mode 1: 🎮 LEARN & PLAY**
   - 5 interactive educational games:
     - *Traffic Controller* (time-series surge triage)
     - *Z-Score Challenge* (standard score arithmetic)
     - *Normal Curve Challenge* (draggable bell-curve marker)
     - *Anomaly Hunter* (dataset outlier identification)
     - *Network Emergency Mission* (multi-step incident response)
   - Rewards player progress with XP, streaks, levels, and achievements.

2. **Mode 2: 🔬 TECHNICAL LAB**
   - Dedicated analytical workbench:
     - Real-time telemetry feed and custom CSV upload
     - Interactive Gaussian PDF/CDF bell curve with $\pm 1\sigma, \pm 2\sigma, \pm 3\sigma$ zones
     - Tail and interval probability calculator
     - Z-Score threshold inspector
     - What-If live load slider

3. **🌉 The Golden Bridge**
   Every game scenario outcome provides a `[View Technical Analysis]` link that transports the player into the Technical Lab with the identical scenario telemetry, displaying the mathematical proof and Gaussian curve.

---

## 3. Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Recharts, Lucide React.
- **Backend:** Python 3.11+, FastAPI, NumPy, Pandas, SciPy, Pydantic V2, Uvicorn.
- **Database & Auth:** Supabase (PostgreSQL with Row Level Security, Supabase Auth, Supabase Storage).
- **Design System:** Futuristic NOC dark theme, high academic clarity, WCAG AA accessible contrast, responsive for desktop, tablet, and mobile.

---

## 4. Project Directory Structure

```
netpulse/
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI widgets (MetricCard, HealthGauge, StatusBadge)
│   │   ├── pages/              # 15 dedicated views
│   │   ├── games/              # 5 educational game components
│   │   ├── charts/             # Recharts Gaussian curve & histograms
│   │   ├── contexts/           # AuthContext, StatsContext, GameContext
│   │   ├── services/           # Supabase & API HTTP clients
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Formatting and bridge helpers
│   │   ├── App.jsx             # Route definitions and context provider tree
│   │   └── main.jsx            # React root mount
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── main.py                 # FastAPI application entrypoint
│   ├── routes/                 # analysis, probability, simulation, games, dataset
│   ├── services/               # statistics, probability, anomaly, health, explanation
│   ├── models/                 # Pydantic schemas for network telemetry
│   ├── data/                   # network_load.csv, scenarios.json
│   ├── tests/                  # Pytest unit test suite
│   └── requirements.txt        # Python backend dependencies
│
├── supabase/
│   ├── schema.sql              # PostgreSQL DDL with RLS policies
│   └── seed.sql                # Default achievements & scenario seeds
│
├── docs/
│   ├── architecture.md         # Detailed multi-tier system architecture
│   ├── methodology.md          # Statistical formulas and anomaly theory
│   ├── database.md             # Supabase ER diagram and table specs
│   ├── api.md                  # REST endpoint contracts
│   └── development-phases.md   # 10-phase milestone breakdown
│
└── README.md
```

---

## 5. Development Phases

- **Phase 1: Project Scaffolding & Directory Setup** (Completed & Approved)
- **Phase 2: Python Statistical Engine** (Completed & Approved — 65 tests passed)
- **Phase 3: FastAPI Backend Endpoints** (Completed & Approved — 96 tests passed)
- **Phase 4: React UI Architecture & NOC Dashboard** (Completed & Approved — Vite 8 + Tailwind 4, 15 routes)
- **Phase 5: Technical Lab Implementation** (Completed — Recharts Gaussian Bell Curve, SciPy probability intervals, standardized Z-score inspector, reactive What-If sweep)
- **Phase 6: Learn & Play Gaming Suite** (Completed — 5 educational games, authoritative FastAPI answer verification, Golden Bridge transitions)
- **Phase 7: Supabase Database Integration** (Completed — 6-table relational schema, RLS policies, Storage bucket, persistence services, repeatable seeds)
- **Phase 8: Supabase Authentication & User Profiles** (Completed — Central AuthContext, ProtectedRoute guards, functional Register/Login/Profile views, automatic profile trigger, graceful unconfigured fallback)
- **Phase 9: Persistent XP, Achievements & Leaderboard** (Completed & Approved — Authoritative completion, idempotency, atomic XP awards, 7 curriculum achievements, real leaderboard, audit history)
- **Phase 10: Final Integration Testing, Security Audit & Deployment Readiness** (Completed — Statistical ground truth verification, database security hardening migration 5, zero pytest warnings, 137 tests passed, bundle code-splitting down to 28 kB)

---

## 6. How to Run (Development Setup)

### Prerequisites
- **Node.js**: v18+ and npm
- **Python**: v3.11+ (Python 3.11 or 3.12 recommended)
- **Git**

---

### Quick Start: Single-Command Combined Dev Server (Recommended)

Start both the **React frontend** and the **Python FastAPI backend** concurrently with a single command:

```powershell
cd netpulse/frontend
npm run dev
```

This single command automatically:
1. **Verifies Port Availability**: Checks ports `8000` and `5173`. If either is occupied, it provides immediate diagnostics and recovery instructions rather than crashing or hanging.
2. **Auto-Discovers Python**: Automatically searches active virtual environments (`.venv`, `venv`), user-configured `PYTHON_PATH`, and system PATH for Python 3.11+.
3. **Validates Dependencies**: Verifies that all required packages (`fastapi`, `uvicorn`, `numpy`, `pandas`, `scipy`, `pydantic`, `dotenv`) are present before launching.
4. **Starts FastAPI Backend**: Binds to `http://127.0.0.1:8000` with hot-reload enabled and correct `backend/` working directory.
5. **Starts Vite Frontend**: Binds to `http://localhost:5173` with instant HMR (Hot Module Replacement).
6. **Graceful Unified Shutdown**: Pressing `Ctrl+C` cleans up both the frontend and backend process trees without leaving orphaned background processes.

#### Service URLs
- **Web Application**: [`http://localhost:5173`](http://localhost:5173)
- **FastAPI Documentation (Swagger UI)**: [`http://127.0.0.1:8000/docs`](http://127.0.0.1:8000/docs)
- **Backend Health Check**: [`http://127.0.0.1:8000/health`](http://127.0.0.1:8000/health)

---

### Standalone Development Commands

If you prefer running services independently:

```powershell
# In netpulse/frontend:

# Run ONLY the Vite frontend (port 5173):
npm run dev:frontend

# Run ONLY the FastAPI backend (port 8000):
npm run dev:backend

# Production frontend build:
npm run build
```

---

### Manual Backend Setup (Optional Alternative)

If you prefer to start the Python environment manually without npm:

```powershell
cd netpulse/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Run pytest test suite (137 tests, 0 warnings):
python -m pytest tests/ -v

# Start Uvicorn manually:
python -m uvicorn main:app --reload --port 8000
```
