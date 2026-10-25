# Project: NETPULSE Simulator Upgrades (25CS203)

## Architecture
NETPULSE is a full-stack educational and simulation platform for Network Load Analysis Using Normal Distribution.
- **Frontend**: React + Vite + Tailwind CSS + Three.js (with 2.5D Canvas fallback for compatibility).
  - Highway Simulator Engine (`NetworkHighwayEngine.jsx`): Manages physics loop, score/telemetry state, user input, audio, and HUD integration.
  - 3D Scene (`HighwayScene3D.js`): Three.js procedural rendering of 4-lane highway, player interceptor vehicle, traffic packets, camera tracking, and lighting.
  - 2.5D Fallback (`HighwayCanvasFallback.js`): HTML5 2D Canvas fallback engine when WebGL is unavailable.
  - Simulator HUD & Menus (`SimulatorHUD.jsx`, `PauseMenu.jsx`, `ScoreboardOverlay.jsx`): UI overlay for telemetry, controls, mobile touch, and menus.
- **Backend**: FastAPI + Python with 137 automated unit/integration tests verifying statistical computations, progression, and leaderboard endpoints.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Steering Controls & Coordinate Alignment | A/Left moves left to lower lane index/negative X; D/Right moves right to higher lane index/positive X | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Camera Centering & Lag Elimination | Camera tracks vehicle X position cleanly during lane shifts without centerline gaze drift | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Vehicle Yaw & Roll Banking | Vehicle tilts naturally into turns along Y and Z axes matching steering velocity | M1 | ORIGINAL_REQUEST §R1 |
| 4 | On-Screen Control Badges | Explicit badges `[A / ←] Steer Left` and `[D / →] Steer Right` in HUD and briefing | M2 | ORIGINAL_REQUEST §R1 |
| 5 | Pause Menu Steering Inversion Toggle | User toggle in Pause Menu allowing inverted steering preference with immediate effect | M1 | ORIGINAL_REQUEST §R1 |
| 6 | Modern Titanium/Metallic Graphite Chassis | Player car chassis styled with high specular titanium metallic graphite contrasting against dark road | M1 | ORIGINAL_REQUEST §R2 |
| 7 | Technical Sapphire Trim & Glow | Royal blue / technical sapphire racing accents (`#3B82F6`) with subtle glow | M1 | ORIGINAL_REQUEST §R2 |
| 8 | Headlights, Taillights & Underglow | Dual forward LED headlights illuminating road, red taillights, royal blue chassis underglow | M1 | ORIGINAL_REQUEST §R2 |
| 9 | Tinted Cockpit Glass Canopy | Aerodynamic tinted glass canopy with specular highlights and interior HUD glow | M1 | ORIGINAL_REQUEST §R2 |
| 10 | Alloy Wheels & Wobble-Free Spin | Graphite rims with silver center hubs, visible spokes, and smooth rotation without Euler wobble | M1 | ORIGINAL_REQUEST §R2 |
| 11 | 2.5D Canvas Fallback Styling Parity | 2.5D canvas vehicle upgraded with matching metallic gradient, underglow, and headlight beams | M1 | ORIGINAL_REQUEST §R2 |
| 12 | In-Game Scoreboard Module | Dedicated overlay toggleable via `[SCOREBOARD / TAB]` button and Tab key (preventing blur) | M2 | ORIGINAL_REQUEST §R3 |
| 13 | Comprehensive Telemetry Stats | Live run score, high score (localStorage), packets collected, accuracy %, multiplier streak (1.5x/2.0x) | M2 | ORIGINAL_REQUEST §R3 |
| 14 | Live Campus Leaderboard Preview | Real-time standings comparing current player score against top course analysts | M2 | ORIGINAL_REQUEST §R3 |
| 15 | Tabular Typography & NOC Styling | Scoreboard styled with `tabular-nums font-mono` and NOC tokens (`#111827`, `#26354D`, `#3B82F6`) | M2 | ORIGINAL_REQUEST §R3 |
| 16 | NOC Design System Cyan/Neon Purge | Eliminate remaining `#06b6d4` and cyan classes across frontend in favor of `#3B82F6` | M3 | ORIGINAL_REQUEST §R4 |
| 17 | Full Automated Verification Suite | Verify 100% clean frontend production build (`npm run build`) and 137/137 backend tests (`pytest tests/`) | M3 | ORIGINAL_REQUEST §R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Simulator Vehicle & Highway Physics Engine | `HighwayScene3D.js`, `HighwayCanvasFallback.js`, `PauseMenu.jsx`: Steering coordinates, camera tracking, roll/banking, titanium chassis, headlights/taillights/underglow, alloy wheels, canvas fallback, pause menu inversion toggle | None | IN_PROGRESS |
| M2 | In-Game HUD, Scoreboard & Telemetry System | `ScoreboardOverlay.jsx`, `SimulatorHUD.jsx`, `MissionBriefing.jsx`, `NetworkHighwayEngine.jsx`: Scoreboard overlay, Tab keydown, 5 live metrics, streak multiplier, leaderboard preview, control badges, invertSteering routing | M1 | PLANNED |
| M3 | NOC Design System Audit & Global Verification | `index.html`, `tailwind.config.js`, components/pages: Purge all cyan `#06b6d4`, verify zero neon classes, full frontend build, 137/137 backend tests, final victory gate | M1, M2 | PLANNED |

## Interface Contracts
### `HighwayScene3D.js` ↔ `NetworkHighwayEngine.jsx`
- `scene.setInput(action: 'left'|'right'|'up'|'down'|'brake', active: boolean)`: Drives vehicle lateral and longitudinal velocity.
- `scene.vehicle.x`: Represents vehicle lateral world position. Screen Left corresponds to negative X (lower lane index).
- `scene.camera`: Follows `vehicle.x` with 0.15 lerp damping, centered along vehicle longitudinal axis.

### `ScoreboardOverlay.jsx` ↔ `NetworkHighwayEngine.jsx`
- Props:
  - `isOpen: boolean`
  - `onClose: () => void`
  - `currentScore: number`
  - `highScore: number`
  - `packetsCollected: number`
  - `accuracyPercentage: number`
  - `multiplier: number`
  - `streak: number`
  - `leaderboard: Array<{ rank: number, username: string, score: number, isCurrentPlayer?: boolean }>`

### `PauseMenu.jsx` ↔ `NetworkHighwayEngine.jsx`
- Props:
  - `isOpen: boolean`
  - `onResume: () => void`
  - `onRestart: () => void`
  - `onExit: () => void`
  - `soundEnabled: boolean`
  - `onToggleSound: () => void`
  - `invertSteering: boolean`
  - `onToggleInvertSteering: () => void`

## Code Layout
- `frontend/src/simulator/HighwayScene3D.js`: Three.js 3D highway, car mesh, lighting, camera logic.
- `frontend/src/simulator/HighwayCanvasFallback.js`: 2.5D Canvas fallback renderer.
- `frontend/src/simulator/NetworkHighwayEngine.jsx`: Simulator loop, key listeners, state orchestrator.
- `frontend/src/simulator/SimulatorHUD.jsx`: HUD badges, mobile touch controls, control buttons.
- `frontend/src/simulator/PauseMenu.jsx`: Pause menu modal with steering inversion toggle.
- `frontend/src/simulator/ScoreboardOverlay.jsx`: Dedicated in-game scoreboard modal.
- `frontend/src/services/api.js`: Leaderboard and progression client API calls.
- `frontend/index.html` & `frontend/src/components/*`: NOC design system tokens.
- `backend/tests/`: Automated pytest test suite (137 tests).
