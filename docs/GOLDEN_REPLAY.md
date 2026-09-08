# CYCLONE-OS: Golden End-to-End Replay (T0 → T11)

## 1. Executive Summary

This document verifies that the entire CYCLONE-OS backend stack operates as **one deterministic, event-driven system** without frontend dependency.

### Pipeline Architecture:
```
Event Clock
    ↓
IntelligenceService.get_snapshot(event_id, tick)
    ↓
Forecasts (ECMWF, GFS, UKMET, HWRF)
    ↓
Scenarios (Consensus, East Recurve, West Track)
    ↓
Hazard Footprint (34kt, 50kt, 64kt Dynamic Wind Contours)
    ↓
Impact / District Population Exposure
    ↓
Time-to-Impact (TTI)
    ↓
RRAS Allocation (Food, Water, Medical, NDRF)
    ↓
Road Network / Dijkstra Routing Simulation
    ↓
Operational Response Simulation
    ↓
Alert State (GREEN / YELLOW / ORANGE / RED)
    ↓
Timeline Audit Log
    ↓
Canonical Unified Event State
```

---

## 2. Canonical Replay Summary Table (T0 → T11)

| Tick | Timestamp (UTC) | Center (Lat, Lon) | Intensity | Regime | Uncertainty | Change Point | Forecasts | Scenarios | Exposed Pop | Risk Level | TTI | Alert Level | Active Ops | Food Units | NDRF Teams | Road Status |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **T00** | 2020-05-16 00:00 | (8.0, 85.0) | 30 kt | GENESIS | 0.362 | no | 4 | 3 | 0 | `LOW` | None | `GREEN` | 0 | 0 | 0 | 23 Normal |
| **T01** | 2020-05-16 12:00 | (8.5, 85.2) | 35 kt | GENESIS | 0.350 | no | 4 | 3 | 0 | `LOW` | None | `GREEN` | 0 | 0 | 0 | 23 Normal |
| **T02** | 2020-05-17 00:00 | (9.2, 85.5) | 45 kt | DEVELOPING | 0.307 | no | 4 | 3 | 50,000 | `LOW` | 96h | `GREEN` | 0 | 450 | 0 | 23 Normal |
| **T03** | 2020-05-17 12:00 | (10.0, 85.8) | 55 kt | DEVELOPING | 0.425 | no | 4 | 3 | 200,000 | `MODERATE` | 84h | `GREEN` | 0 | 2,250 | 2 | 23 Normal |
| **T04** | 2020-05-18 00:00 | (11.2, 86.0) | 75 kt | INTENSIFYING | 0.255 | **YES** | 4 | 3 | 500,000 | `MODERATE` | 72h | `YELLOW` | 1 | 5,622 | 3 | 16 Normal, 7 Rerouted |
| **T05** | 2020-05-18 12:00 | (13.0, 86.3) | 100 kt | INTENSIFYING | 0.203 | no | 4 | 3 | 1,200,000 | `HIGH` | 60h | `YELLOW` | 1 | 15,300 | 3 | 16 Normal, 7 Rerouted |
| **T06** | 2020-05-19 00:00 | (15.0, 86.8) | 125 kt | INTENSIFYING | 0.175 | no | 4 | 3 | 1,800,000 | `HIGH` | 48h | `ORANGE` | 3 | 22,950 | 3 | 17 Normal, 6 Rerouted |
| **T07** | 2020-05-19 12:00 | (17.5, 87.2) | 140 kt | MATURE | 0.143 | **YES** | 4 | 3 | 2,400,000 | `HIGH` | 36h | `ORANGE` | 3 | 20,400 | 2 | 17 Normal, 6 Rerouted |
| **T08** | 2020-05-20 00:00 | (19.5, 87.8) | 135 kt | MATURE | 0.182 | no | 4 | 3 | 3,000,000 | `EXTREME` | 24h | `RED` | 5 | 45,000 | 6 | 15 Normal, 6 Rerouted, 2 Blocked |
| **T09** | 2020-05-20 06:00 | (20.5, 88.0) | 130 kt | MATURE | 0.238 | no | 4 | 3 | 3,400,000 | `EXTREME` | 12h | `RED` | 5 | 51,000 | 8 | 1 Normal, 9 Rerouted, 13 Blocked |
| **T10** | 2020-05-20 10:00 | (21.6, 88.3) | 110 kt | WEAKENING | 0.305 | **YES** | 4 | 3 | 2,800,000 | `EXTREME` | 2h | `RED` | 5 | 42,000 | 8 | 1 Normal, 9 Rerouted, 13 Unreachable |
| **T11** | 2020-05-20 18:00 | (22.5, 88.8) | 60 kt | WEAKENING | 0.345 | no | 0 | 3 | 1,500,000 | `HIGH` | 0h | `YELLOW` | 2 | 20,250 | 4 | 1 Normal, 9 Rerouted, 13 Unreachable |

---

## 3. Verified Behavioral Progression

1. **T0 (Genesis)**:
   - Wind speed 30 kt.
   - Zero exposed population; no wind contour reaches coast.
   - All 23 road network edges in `NORMAL` status; 0 relief resources mobilized.
2. **T3 (Data Quality Degradation Checkpoint)**:
   - Microwave satellite data becomes unavailable (`DEGRADED_MW_MISSING`).
   - Uncertainty spikes to `0.425` and data freshness is flagged as `AGING`.
   - Initial impact begins (200,000 population exposed; TTI = 84h).
3. **T4 (Regime Change Point)**:
   - Change-point detector fires (`DEVELOPING` → `INTENSIFYING`).
   - Alert level rises to `YELLOW`.
   - Initial coastal road rerouting begins (7 segments rerouted).
4. **T5–T6 (Rapid Intensification)**:
   - Winds accelerate from 100 kt to 125 kt.
   - Population in hazard footprint expands from 1.2M to 1.8M.
   - Alert escalates to `ORANGE` at T6 as TTI crosses below 48h.
   - RRAS mobilizes pre-positioning relief packages (22,950 food packets, 3 NDRF battalions).
5. **T7 (Peak Super Cyclone & Mature Regime)**:
   - Peak winds of 140 kt and central pressure 920 hPa.
   - Second change-point detected (`INTENSIFYING` → `MATURE`).
   - Broad 64 kt hurricane-force contour covers coastal sea approach.
6. **T8–T9 (Landfall Imminent & Alert Escalation)**:
   - TTI drops from 24h to 12h; risk level enters `EXTREME`.
   - Alert escalates to `RED`.
   - Critical operational tasks active: Mandatory Evacuation, Emergency Shelter Activation.
   - Coastal roads in West Bengal and Odisha suffer severe flooding and debris blockage (13 segments blocked).
   - Maximum NDRF deployment (8 teams) and 51,000 food packets allocated.
7. **T10 (Post-Landfall Storm Surge & Inundation)**:
   - Cyclone makes landfall; winds decelerate to 110 kt.
   - Third change-point detected (`MATURE` → `WEAKENING`).
   - Critical coastal segments marked `UNREACHABLE`; Dijkstra routing automatically recalculates inland detour routes.
8. **T11 (Inland Dissipation & Forecast Horizon Check)**:
   - Storm moves inland and dissipates to 60 kt.
   - Time-to-impact reaches `0.0h`; alert lowers to `YELLOW`.
   - **Forecast Horizon Integrity**: Future forecast member count is `0`. No fake forward forecasts are hallucinated beyond the event horizon.

---

## 4. Architectural Component Classifications

| Component | Nature | Method / Implementation |
|---|---|---|
| **Cyclone Track & Historical Baseline** | Synthetic / Benchmark | Historical IMD / IBTrACS trajectory for Cyclone Amphan (May 2020). |
| **Intelligence Facade (`IntelligenceService`)** | Mock / Interface-First | Aggregates 8 domain providers matching production PyTorch contracts. |
| **Intensity & Structure** | Rule-Based / Precomputed | Holland parametric wind formulation with structural radial decay. |
| **Regime Classifier & Change Point** | Rule-Based Provider | Temporal change-point detector evaluating regime shifts. |
| **NWP Ensemble & Scenarios** | Deterministic Multi-Model | 4-member biased ensemble (ECMWF, GFS, UKMET, HWRF) with spread metrics. |
| **Hazard Generator** | Algorithmic Simulation | Dynamic 34 kt, 50 kt, 64 kt GeoJSON polygon radii. |
| **Impact & Exposure Engine** | Geospatial Matrix | District-level population, hospital, substation, and Flood Vulnerability Index. |
| **RRAS Engine** | Dijkstra Graph Optimization | Weighted shortest path with flood penalties and multi-depot allocation. |
| **Replay Engine & Event Clock** | Deterministic State Machine | Single-clock state progression with ACID-like atomic transitions. |

> [!IMPORTANT]
> **Production Status Disclaimer**:
> CYCLONE-OS is currently operating with a **deterministic simulation and mock intelligence architecture** designed for the prototype milestone. It does **NOT** run live satellite deep-learning models yet. All intelligence and operational outputs are strictly for decision-support evaluation.
