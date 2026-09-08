# CYCLONE-OS: ML Model Roadmap

> This document describes how the hackathon mock providers will be replaced by
> real trained models in Phase 2+. None of these models are built during the
> 8-hour hackathon.

---

## 1. RealIntensityModel

**Current:** `MockIntensityProvider` — precomputed 12-tick lookup table.

**Target:** CNN/ResNet trained on GridSat-B1 IR brightness temperature patches.

| Aspect | Detail |
|---|---|
| Input | 256×256 IR patch centered on storm + ERA5 environmental features |
| Architecture | ResNet-18 encoder → 2-head MLP (Vmax regression + pressure regression) |
| Training data | IBTrACS best-track labels (1980–2023) matched to GridSat-B1 snapshots |
| Output | `IntensityEstimate` (value, lower/upper bounds via MC Dropout) |
| Loss | MSE + calibration loss for uncertainty bands |
| Swap path | Implement `RealIntensityModel(IntensityProvider)` — same `.get()` interface |

---

## 2. RealStructureModel

**Current:** `MockStructureProvider` — precomputed organisation scores.

**Target:** CNN encoder operating on multi-channel satellite composites.

| Aspect | Detail |
|---|---|
| Input | IR + WV + (optional) microwave composite patches |
| Architecture | EfficientNet-B0 → structure embedding → MLP heads for org/eye/symmetry |
| Training data | SHIPS developmental dataset labels + manual Dvorak T-number annotations |
| Output | `StructureState` with continuous scores |
| Swap path | Implement `RealStructureModel(StructureProvider)` |

---

## 3. RealRegimeModel

**Current:** `MockRegimeProvider` — precomputed probability lookup.

**Target:** LSTM/Transformer over temporal state sequences.

| Aspect | Detail |
|---|---|
| Input | Sequence of (intensity, structure, environment) vectors, length 6–12 steps |
| Architecture | Bi-LSTM (128 hidden) → softmax over 5 regime classes |
| Training data | IBTrACS lifecycle labels (manually annotated RI/steady/weakening episodes) |
| Output | `RegimeDistribution` (calibrated via temperature scaling) |
| Swap path | Implement `RealRegimeModel(RegimeProvider)` |

---

## 4. RealChangePointModel

**Current:** `DemoChangePointProvider` — fires at hardcoded ticks.

**Target:** Online Bayesian Change-Point Detection (BOCPD).

| Aspect | Detail |
|---|---|
| Input | Streaming sequence of `RegimeDistribution` vectors |
| Algorithm | Adams & MacKay (2007) BOCPD with Student-t predictive |
| Output | `ChangePointEvent` with run-length posterior |
| Swap path | Implement `RealChangePointModel(ChangePointProvider)` |

---

## 5. RealForecastProvider

**Current:** `MockForecastProvider` — 4 static model tracks.

**Target:** Live NWP ingestion from ECMWF/GFS/UKMET GRIB2 feeds.

| Aspect | Detail |
|---|---|
| Input | GRIB2 files from NOAA GFS FTP + ECMWF MARS API |
| Processing | cfgrib → xarray → track extraction via vortex tracker |
| Output | `ForecastSet` with real model tracks + computed disagreement |

---

## 6. RealUncertaintyModel

**Current:** `RuleBasedUncertaintyProvider` — heuristic aggregation.

**Target:** Calibrated ensemble uncertainty from real model spread + observation quality.

| Aspect | Detail |
|---|---|
| Method | Isotonic regression calibration on historical spread vs. error |
| Output | `UncertaintyState` with calibrated confidence intervals |

---

## Implementation Priority (Phase 2)

1. **RealIntensityModel** — highest demo impact, GridSat data readily available.
2. **RealRegimeModel** — LSTM training is fast on small sequences.
3. **RealChangePointModel** — BOCPD is a clean algorithm, no GPU needed.
4. **RealStructureModel** — requires multi-channel data preprocessing.
5. **RealForecastProvider** — requires GRIB2 infrastructure.
6. **RealUncertaintyModel** — calibration requires evaluation dataset.
