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
- **Phase 9: Persistent XP, Achievements & Leaderboard** (Completed — Authoritative completion, idempotency, atomic XP awards, 7 curriculum achievements, real leaderboard, audit history, 116 tests passed)
- **Phase 10: Testing, Hardening & Academic Documentation** (Upcoming)

---

## 6. How to Run (Development Setup)

### Prerequisites
- Node.js (v18+) and npm
- Python (v3.11+)

### Backend Setup (FastAPI + NumPy / SciPy)
```bash
cd netpulse/backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Run pytest test suite (all 116 tests):
python -m pytest tests -p no:cacheprovider -v
# Run FastAPI server:
python -m uvicorn main:app --reload --port 8000
```
- Interactive API Documentation (Swagger): `http://localhost:8000/docs`
- Service Health Probe: `http://localhost:8000/health`

### Frontend Setup (React 18 + Vite 8 + Tailwind CSS 4)
```bash
cd netpulse/frontend
# Install dependencies:
npm install
# Run production build:
npm run build
# Start Vite development server:
npm run dev
```
Frontend will be accessible at: `http://localhost:5173`
