# CYCLONE-OS — ML Integration Guide

> **Source of truth** for integrating the intelligence layer.
> Audience: Member 2 (Backend), Member 1 (Frontend), Member 4 (Impact/GIS).

---

## Quick Start — Member 2

```python
from backend.ml.intelligence_service import IntelligenceService

svc = IntelligenceService()

# Get intelligence for a specific tick (0–11)
snapshot = svc.get_snapshot("DEMO-001", tick=5)

# Serialize to JSON for API response
serialized = snapshot.model_dump(mode="json")
```

**That's it.** One import, one call, one JSON blob.

---

## IntelligenceSnapshot — Top-Level Fields

| Field           | Type                  | Description                                              | Consumer       |
|-----------------|-----------------------|----------------------------------------------------------|----------------|
| `event_id`      | `str`                 | Event identifier (e.g. `"DEMO-001"`)                     | All            |
| `tick`          | `int`                 | Timeline position (0–11)                                 | All            |
| `timestamp`     | `datetime` (ISO 8601) | Physical time of this state                              | All            |
| `center`        | `LatLon`              | Storm center `{lat, lon}`                                | M1, M4         |
| `intensity`     | `IntensityEstimate`   | Wind/pressure with uncertainty bounds                    | M1, M4         |
| `structure`     | `StructureState`      | Organisation, eye probability, symmetry, RMW             | M1             |
| `environment`   | `EnvironmentState`    | SST, wind shear, humidity, divergence                    | M1             |
| `regime`        | `RegimeDistribution`  | Probability distribution over 5 lifecycle regimes        | M1             |
| `change_point`  | `ChangePointEvent`    | Regime transition detection result                       | M1             |
| `uncertainty`   | `UncertaintyState`    | Aggregated uncertainty + data quality flag                | M1             |
| `forecasts`     | `ForecastSet`         | 4 NWP forecast members with tracks + disagreement score  | M1, M4         |
| `scenarios`     | `ScenarioSet`         | 3 probability-weighted scenarios with tracks + cones     | M1, M4         |
| `analogs`       | `list[HistoricalAnalog]` (optional) | Matched historical cyclones               | M1             |

---

## Member 2 — Backend Integration

### Implementing `GET /events/{event_id}/state`

```python
from fastapi import FastAPI, Query
from backend.ml.intelligence_service import IntelligenceService

app = FastAPI()
svc = IntelligenceService()

@app.get("/events/{event_id}/state")
def get_event_state(event_id: str, tick: int = Query(0, ge=0, le=11)):
    snapshot = svc.get_snapshot(event_id, tick)
    return snapshot.model_dump(mode="json")
```

### Replay Endpoint

```python
@app.get("/events/{event_id}/replay")
def get_replay(event_id: str):
    return [
        svc.get_snapshot(event_id, tick).model_dump(mode="json")
        for tick in range(12)
    ]
```

### Key Rules for Member 2

1. **Do NOT reconstruct intelligence from individual files.** Use `IntelligenceService.get_snapshot()` only.
2. **Do NOT duplicate ML logic** in backend routes. The service handles everything.
3. **Do NOT call individual providers** (MockIntensityProvider, etc.) directly.
4. `IntelligenceSnapshot` is the **single canonical intelligence object**.

---

## Member 1 — Frontend Display Fields

### What to display per tick:

| UI Component         | Field Path                              | Format            |
|---------------------|-----------------------------------------|-------------------|
| Wind gauge          | `intensity.value_kt`                    | Number + "kt"     |
| Pressure gauge      | `intensity.min_pressure_hpa`            | Number + "hPa"    |
| Confidence badge    | `intensity.confidence`                  | 0–1 → percentage  |
| Regime label        | `regime.dominant_regime`                | Enum string       |
| Regime bar chart    | `regime.probabilities`                  | Dict → bar chart  |
| Uncertainty meter   | `uncertainty.overall_uncertainty`       | 0–1 → percentage  |
| Data quality badge  | `uncertainty.data_quality_flag`         | "GOOD" / "DEGRADED_MW_MISSING" / "POST_LANDFALL" |
| Change-point alert  | `change_point.detected`                 | Boolean → alert   |
| Change-point detail | `change_point.severity`, `.trigger_features` | Enum + list |
| Eye probability     | `structure.eye_probability`             | 0–1 → percentage  |
| Organisation score  | `structure.organization`                | 0–1 → bar        |
| SST display         | `environment.sst_c`                     | Number + "C"      |
| Shear display       | `environment.wind_shear_kt`             | Number + "kt"     |
| Forecast tracks     | `forecasts.members[].track`             | LatLon array → map|
| Forecast disagree   | `forecasts.disagreement_score`          | 0–1 → visual     |
| Scenario tracks     | `scenarios.scenarios[].track`           | LatLon array → map|
| Scenario probs      | `scenarios.scenarios[].probability`     | 0–1 → pie chart  |
| Scenario cones      | `scenarios.scenarios[].cone_geometry`   | GeoJSON → overlay |
| Analog cards        | `analogs[].storm_name`, `.similarity`   | Card component    |

### Frontend reads from:

```
GET /events/{event_id}/state?tick={n}
```

Response is the full `IntelligenceSnapshot` JSON.

---

## Member 4 — Impact Integration

### Fields Member 4 consumes:

```python
snapshot = response_json  # from GET /events/{event_id}/state

# Core state for hazard computation
lat = snapshot["center"]["lat"]
lon = snapshot["center"]["lon"]
wind_kt = snapshot["intensity"]["value_kt"]
tick = snapshot["tick"]
timestamp = snapshot["timestamp"]

# For impact zone computation
for scenario in snapshot["scenarios"]["scenarios"]:
    track = scenario["track"]          # list of {lat, lon, lead_time_h, wind_kt}
    probability = scenario["probability"]
    cone = scenario["cone_geometry"]   # GeoJSON Polygon
    intensity_range = scenario["intensity_range_kt"]  # (min_kt, max_kt)
    landfall_region = scenario["landfall_region"]      # string or null

# For ensemble-based impact
for member in snapshot["forecasts"]["members"]:
    model_name = member["model_name"]
    forecast_track = member["track"]   # list of {lat, lon, lead_time_h, wind_kt}
```

### Member 4 Impact Pipeline

```
IntelligenceSnapshot
  → center + intensity → current hazard state
  → scenario tracks + probabilities → probabilistic impact zones
  → forecast tracks → ensemble wind field
  → time/tick → temporal sequencing
```

Member 4 does **NOT** need to know anything about internal intelligence providers.

---

## Pre-generated Demo Data

For offline development, JSON files are available in `demo/ml/`:

| File                         | Contents                                        |
|-----------------------------|-------------------------------------------------|
| `intelligence_snapshots.json`| Complete snapshots for all 12 ticks              |
| `intensity_states.json`     | Intensity estimates only                         |
| `structure_states.json`     | Structure states only                            |
| `regime_states.json`        | Regime distributions only                        |
| `environments.json`         | Environment states only                          |
| `change_points.json`        | Change-point events only                         |
| `forecasts.json`            | Forecast sets only                               |
| `scenarios.json`            | Scenario sets only                               |
| `analogs.json`              | Historical analogs                               |

Regenerate with: `python scripts/generate_demo_data.py`

---

## Future: MOCK → REAL Provider Replacement

See `backend/ml/real_providers.py` for stubs.

| Provider              | Mock Class                  | Real Class                 | Change Location              |
|-----------------------|-----------------------------|----------------------------|------------------------------|
| Intensity             | `MockIntensityProvider`     | `RealIntensityProvider`    | `intelligence_service.py:86` |
| Structure             | `MockStructureProvider`     | `RealStructureProvider`    | `intelligence_service.py:87` |
| Regime                | `MockRegimeProvider`        | `RealRegimeProvider`       | `intelligence_service.py:89` |

**One-line swap per provider. No downstream changes required.**

---

## 12-Tick Timeline Summary

| Tick | Timestamp           | Regime        | Wind (kt) | Key Event                    |
|------|---------------------|---------------|-----------|-------------------------------|
| T0   | 2020-05-16 00:00Z   | GENESIS       | 30        | Disturbance forms             |
| T1   | 2020-05-16 12:00Z   | GENESIS       | 35        | Organizing                    |
| T2   | 2020-05-17 00:00Z   | DEVELOPING    | 45        | Tropical storm                |
| T3   | 2020-05-17 12:00Z   | DEVELOPING    | 55        | **MW data missing** → uncertainty spike |
| T4   | 2020-05-18 00:00Z   | INTENSIFYING  | 75        | **Change point**: RI onset    |
| T5   | 2020-05-18 12:00Z   | INTENSIFYING  | 100       | Rapid intensification         |
| T6   | 2020-05-19 00:00Z   | INTENSIFYING  | 125       | Cat-4 equivalent              |
| T7   | 2020-05-19 12:00Z   | MATURE        | 140       | **Change point**: peak (Cat-5)|
| T8   | 2020-05-20 00:00Z   | MATURE        | 135       | Maintaining strength          |
| T9   | 2020-05-20 06:00Z   | MATURE        | 130       | Approaching coast             |
| T10  | 2020-05-20 10:00Z   | WEAKENING     | 110       | **Change point**: landfall    |
| T11  | 2020-05-20 18:00Z   | WEAKENING     | 60        | Post-landfall dissipation     |
