# CYCLONE-OS: Multimodal Cyclone Intelligence & RRAS Dispatch System

> **IIC 3.0 — Problem Statement PS-025**  
> *Artificial Intelligence (AI)-based system for identification, classification, and prediction of tropical cyclone patterns using multi-source data and Rapid Resource Allocation & Routing System (RRAS).*

---

## 📌 Executive Summary

**CYCLONE-OS** is an end-to-end event management, intelligence prediction, and emergency resource dispatch architecture. Built around a single deterministic event clock, CYCLONE-OS orchestrates a 9-layer pipeline from satellite/meteorological intelligence down to road network hazard routing and depot-to-district resource allocation.

- **Backend**: FastAPI (Python 3.13) event replay clock and REST microservice API.
- **Intelligence Layer**: Modular interface facade supporting precomputed ensembles and future PyTorch multimodal fusion models (HURSAT satellite + ERA5 atmospheric + IBTrACS storm state).
- **RRAS (Rapid Resource Allocation & Routing System)**: 23-node Bay of Bengal road network model utilizing Dijkstra shortest-path routing, road status degradation algorithms (`NORMAL`, `REROUTED`, `BLOCKED`, `UNREACHABLE`), and priority score resource distribution (food, water, medical kits, NDRF teams).
- **Frontend**: React 19 SPA powered by Vite, MapLibre GL JS, Recharts, Framer Motion, and Zustand global state management.

---

## 🏗 System Architecture

```
                                  +-------------------+
                                  |    USER / SPA     |
                                  | React 19 + Vite   |
                                  +---------+---------+
                                            |
                                  HTTP REST / JSON
                                  (Port 8000)
                                            v
                                  +-------------------+
                                  |   FASTAPI BACKEND |
                                  | (backend/main.py) |
                                  +---------+---------+
                                            |
                         +------------------+------------------+
                         |                                     |
                         v                                     v
             +-----------------------+             +-----------------------+
             |   REPLAY EVENT CLOCK  |             |  MAPLIBRE GEOJSON SVC |
             | (replay_engine.py)    |             |   (map_service.py)    |
             +-----------+-----------+             +-----------------------+
                         |
      +------------------+------------------+
      |                  |                  |
      v                  v                  v
+-----------+      +-----------+      +--------------------+
| ML INTEL  |      |   ALERT   |      |    RRAS ADAPTER    |
| SERVICE   |      |  ENGINE   |      | (rras_engine.py)   |
+-----+-----+      +-----------+      +----------+---------+
      |                                          |
      v                                          v
+-----------+                         +--------------------+
|  PyTorch  |                         |  23-Node Road Graph|
| / Mock ML |                         |  Dijkstra Routing  |
+-----------+                         +--------------------+
```

### 🔁 Event Pipeline Layers
1. **Event Clock**: Single source of tick state (`replay_engine.advance()`).
2. **Intelligence Service**: Multi-provider snapshot generation (Intensity, Structure, Environment, Regime, Forecast, Scenarios).
3. **State Builder**: Merges intelligence data into canonical state.
4. **Forecast Engine**: 4-model consensus track (+6h, +12h, +24h, +48h horizons).
5. **Scenario Generator**: Probabilistic ensemble perturbations (BASE, LEFT, RIGHT tracks).
6. **Hazard Model**: Parametric Holland wind fields (34kt, 50kt, 64kt GeoJSON polygons).
7. **Impact & Exposure**: Population exposure, flood risk index, time-to-impact (TTI).
8. **Alert Engine**: Deterministic state machine (`GREEN` -> `YELLOW` -> `ORANGE` -> `RED`).
9. **RRAS Engine**: Road status calculation + Dijkstra routing + depot resource allocation.
10. **Timeline & Audit**: Append-only event log and forecast skill tracking.

---

## 📁 Repository Structure

```
├── backend/                  # FastAPI backend app (Python 3.13)
│   ├── main.py               # Application bootstrap & lifespan context manager
│   ├── events.py             # Event/State/Replay/RRAS API router
│   ├── replay_engine.py      # Single event clock & 9-layer pipeline store
│   ├── rras_engine.py        # Canonical RRAS implementation (road graph + routing + allocation)
│   ├── schemas.py            # Pydantic v2 domain schemas
│   ├── alert_engine.py       # Deterministic GREEN->RED state machine
│   ├── timeline.py           # Append-only audit log & skill metrics
│   ├── persistence.py        # SQLite DDL & helper functions
│   ├── providers.py          # Abstract interfaces & provider registry
│   ├── seed_data.py          # Amphan 12-tick dataset & resource depots
│   └── ml/                   # Intelligence layer facade & mock/real providers
├── frontend/                 # React 19 + Vite 8 SPA
│   ├── src/
│   │   ├── App.jsx           # Tab-based shell navigation
│   │   ├── store/appStore.js # Zustand central store
│   │   ├── services/api.js   # Central REST client
│   │   ├── pages/            # 8 dashboard pages (CommandCenter, ResourceOps, etc.)
│   │   └── components/       # MapLibre map & UI components
│   ├── package.json          # Dependencies
│   └── vite.config.js        # Vite dev server configuration
├── demo/                     # Precomputed replay outputs & ML JSON snapshots
├── docs/                     # Comprehensive Markdown specifications
├── scripts/                  # Python replay validators & demo data generators
│   └── golden_replay.py      # Master 12-tick determinism runner
├── tests/                    # 39 passing Pytest unit & integration tests
├── .env.example              # Environment variables template
└── README.md                 # Project documentation
```

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- **Python**: `3.10` or higher (Python 3.13 recommended)
- **Node.js**: `18.0` or higher (`npm` included)

### 1. Environment Setup

Copy `.env.example` to root `.env` and `backend/.env`:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

### 2. Backend Setup & Startup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --port 8000
```
- **API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 3. Frontend Setup & Startup

In a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
- **Frontend SPA URL**: [http://localhost:5173](http://localhost:5173)

---

## 🔗 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | System health check and layer architecture summary |
| `GET` | `/api/v1/events` | List all tracked cyclone events |
| `GET` | `/api/v1/events/{id}/canonical` | **Unified canonical state** (state, forecast, hazard, impact, RRAS) |
| `GET` | `/api/v1/events/{id}/rras` | **RRAS road status & depot dispatch plan** |
| `POST` | `/api/v1/events/{id}/advance` | Advance event clock by N steps |
| `POST` | `/api/v1/events/{id}/replay/reset` | Reset replay clock to T0 |
| `POST` | `/api/v1/events/{id}/replay/goto?tick=N` | Jump directly to tick N |
| `GET` | `/api/v1/map/config` | MapLibre style and layer configurations |
| `POST` | `/api/v1/sos` | Submit citizen SOS report |

---

## 🧪 Testing & Verification

The repository features a 100% passing test suite and determinism validator.

### 1. Run Pytest Suite (39 Tests)
```bash
python -m pytest tests/ -v
```
*Executes unit and integration tests for backend APIs, ML providers, replay advancement, and RRAS allocation rules.*

### 2. Run Golden Replay Determinism Check
```bash
python scripts/golden_replay.py
```
*Advances Cyclone Amphan replay from T0 through T11 twice and verifies 100% identical outputs across all layers.*

---

## ⚖️ Scientific Disclaimers

> **RESEARCH PROTOTYPE NOTICE**  
> All ML intelligence, hazard footprints, population exposure numbers, and RRAS dispatch plans produced by this software are for **decision-support demonstration and research purposes only**. They do not constitute official emergency dispatch orders or official IMD meteorological advisories. For emergency services in India, call **112**.
