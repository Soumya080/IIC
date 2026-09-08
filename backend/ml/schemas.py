"""
CYCLONE-OS Intelligence Layer — Pydantic Schemas

Canonical data models consumed by:
  - Backend (Member 2): state endpoints, replay engine
  - Frontend (Member 1): JSON rendering
  - GIS (Member 4): spatial overlay inputs

All models are serialisable to JSON and compatible with FastAPI response_model.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class RegimeEnum(str, Enum):
    GENESIS = "GENESIS"
    DEVELOPING = "DEVELOPING"
    INTENSIFYING = "INTENSIFYING"
    MATURE = "MATURE"
    WEAKENING = "WEAKENING"


class SeverityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


# ---------------------------------------------------------------------------
# Geo helpers
# ---------------------------------------------------------------------------

class LatLon(BaseModel):
    lat: float
    lon: float


class TrackPoint(BaseModel):
    lat: float
    lon: float
    lead_time_h: Optional[int] = None
    wind_kt: Optional[float] = None
    pressure_hpa: Optional[float] = None


# ---------------------------------------------------------------------------
# Intelligence outputs
# ---------------------------------------------------------------------------

class IntensityEstimate(BaseModel):
    """Wind / pressure intensity with uncertainty bounds."""
    event_id: str
    tick: int
    timestamp: datetime
    value_kt: float = Field(..., description="Maximum sustained wind (knots)")
    lower_bound_kt: float
    upper_bound_kt: float
    min_pressure_hpa: float
    confidence: float = Field(..., ge=0.0, le=1.0)
    source: str = "MOCK_INTENSITY_PROVIDER"
    demo_mode: bool = True


class StructureState(BaseModel):
    """Cyclone structural organisation metrics."""
    event_id: str
    tick: int
    timestamp: datetime
    organization: float = Field(..., ge=0.0, le=1.0)
    eye_probability: float = Field(..., ge=0.0, le=1.0)
    symmetry: float = Field(..., ge=0.0, le=1.0)
    convective_organization: float = Field(..., ge=0.0, le=1.0)
    banding: float = Field(..., ge=0.0, le=1.0)
    rmw_km: float = Field(..., description="Radius of maximum wind (km)")
    confidence: float = Field(..., ge=0.0, le=1.0)
    source: str = "MOCK_STRUCTURE_PROVIDER"
    demo_mode: bool = True


class EnvironmentState(BaseModel):
    """Large-scale environmental context."""
    event_id: str
    tick: int
    timestamp: datetime
    sst_c: float = Field(..., description="Sea surface temperature (°C)")
    wind_shear_kt: float = Field(..., description="Deep-layer shear (kt)")
    mid_level_humidity_pct: float = Field(..., ge=0.0, le=100.0)
    upper_divergence: float = Field(..., description="Upper-level divergence index")
    confidence: float = Field(..., ge=0.0, le=1.0)
    source: str = "MOCK_ENVIRONMENT_PROVIDER"
    demo_mode: bool = True


class RegimeDistribution(BaseModel):
    """Probability distribution over lifecycle regimes."""
    event_id: str
    tick: int
    timestamp: datetime
    probabilities: dict[str, float] = Field(
        ...,
        description="Regime → probability. Must sum to 1.0",
    )
    dominant_regime: RegimeEnum
    confidence: float = Field(..., ge=0.0, le=1.0)
    source: str = "MOCK_REGIME_PROVIDER"
    demo_mode: bool = True


class ChangePointEvent(BaseModel):
    """Change-point detection result."""
    event_id: str
    tick: int
    timestamp: datetime
    detected: bool
    previous_regime: Optional[RegimeEnum] = None
    new_regime: Optional[RegimeEnum] = None
    severity: Optional[SeverityEnum] = None
    trigger_features: Optional[list[str]] = None
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    source: str = "DEMO_CHANGE_POINT_DETECTOR"
    demo_mode: bool = True


class UncertaintyState(BaseModel):
    """Aggregated uncertainty across sub-components."""
    event_id: str
    tick: int
    timestamp: datetime
    intensity_uncertainty: float = Field(..., ge=0.0, le=1.0)
    structure_uncertainty: float = Field(..., ge=0.0, le=1.0)
    regime_uncertainty: float = Field(..., ge=0.0, le=1.0)
    forecast_spread: float = Field(..., ge=0.0, le=1.0)
    overall_uncertainty: float = Field(..., ge=0.0, le=1.0)
    data_quality_flag: str = "GOOD"
    source: str = "RULE_BASED_UNCERTAINTY"
    demo_mode: bool = True


# ---------------------------------------------------------------------------
# Forecast & Scenario
# ---------------------------------------------------------------------------

class ForecastMember(BaseModel):
    """Single NWP forecast member."""
    model_name: str
    init_time: datetime
    track: list[TrackPoint]
    intensity_forecast_kt: Optional[float] = None
    confidence: float = Field(..., ge=0.0, le=1.0)


class ForecastSet(BaseModel):
    """Collection of forecast members for a given cycle."""
    event_id: str
    tick: int
    timestamp: datetime
    members: list[ForecastMember]
    disagreement_score: float = Field(
        ..., ge=0.0, le=1.0,
        description="0 = perfect agreement, 1 = maximum disagreement",
    )
    source: str = "MOCK_FORECAST_PROVIDER"
    demo_mode: bool = True


class ConeGeometry(BaseModel):
    """GeoJSON-compatible polygon for scenario cone."""
    type: str = "Polygon"
    coordinates: list[list[list[float]]]


class Scenario(BaseModel):
    """Probability-weighted scenario with track and cone."""
    scenario_id: str
    name: str
    probability: float = Field(..., ge=0.0, le=1.0)
    track: list[TrackPoint]
    cone_geometry: Optional[ConeGeometry] = None
    intensity_range_kt: tuple[float, float] = (0.0, 0.0)
    landfall_region: Optional[str] = None
    description: Optional[str] = None


class ScenarioSet(BaseModel):
    """Complete set of scenarios for a cycle."""
    event_id: str
    tick: int
    timestamp: datetime
    scenarios: list[Scenario]
    source: str = "MOCK_SCENARIO_PROVIDER"
    demo_mode: bool = True


# ---------------------------------------------------------------------------
# Historical Analog
# ---------------------------------------------------------------------------

class HistoricalAnalog(BaseModel):
    """Matched historical cyclone."""
    storm_name: str
    year: int
    basin: str
    similarity: float = Field(..., ge=0.0, le=1.0)
    matched_features: list[str]
    historical_outcome: str


# ---------------------------------------------------------------------------
# Unified snapshot
# ---------------------------------------------------------------------------

class IntelligenceSnapshot(BaseModel):
    """
    Complete intelligence output for a single event-tick.
    This is what IntelligenceService.get_snapshot() returns.
    """
    event_id: str
    tick: int
    timestamp: datetime
    center: LatLon
    intensity: IntensityEstimate
    structure: StructureState
    environment: EnvironmentState
    regime: RegimeDistribution
    change_point: ChangePointEvent
    uncertainty: UncertaintyState
    forecasts: ForecastSet
    scenarios: ScenarioSet
    analogs: Optional[list[HistoricalAnalog]] = None
