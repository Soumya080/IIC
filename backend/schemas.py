"""
CYCLONE-OS: Domain Schemas (Pydantic v2)
Member 2 — Backend / Event / State Architect
"""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import uuid4

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class EventStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    REPLAY_ONLY = "REPLAY_ONLY"
    ARCHIVED = "ARCHIVED"


class Basin(str, Enum):
    NI = "NI"
    BOB = "BOB"
    AS = "AS"
    WP = "WP"
    NA = "NA"
    EP = "EP"
    SI = "SI"
    SP = "SP"


class Regime(str, Enum):
    FORMATION = "FORMATION"
    DEVELOPING = "DEVELOPING"
    INTENSIFYING = "INTENSIFYING"
    RAPID_INTENSIFICATION = "RAPID_INTENSIFICATION"
    MATURE = "MATURE"
    WEAKENING = "WEAKENING"
    DISSIPATING = "DISSIPATING"


class AlertLevel(str, Enum):
    GREEN = "GREEN"
    YELLOW = "YELLOW"
    ORANGE = "ORANGE"
    RED = "RED"


class ScenarioType(str, Enum):
    BASE = "BASE"
    LEFT = "LEFT"
    RIGHT = "RIGHT"
    RAPID_INTENSIFICATION = "RAPID_INTENSIFICATION"
    TRACK_NORTH = "TRACK_NORTH"
    TRACK_SOUTH = "TRACK_SOUTH"


class HazardThreshold(str, Enum):
    KT_34 = "34kt"
    KT_50 = "50kt"
    KT_64 = "64kt"


class TimelineEventType(str, Enum):
    OBSERVATION_RECEIVED = "OBSERVATION_RECEIVED"
    STATE_UPDATED = "STATE_UPDATED"
    REGIME_CHANGED = "REGIME_CHANGED"
    CHANGE_POINT_DETECTED = "CHANGE_POINT_DETECTED"
    FORECAST_UPDATED = "FORECAST_UPDATED"
    SCENARIO_CHANGED = "SCENARIO_CHANGED"
    HAZARD_UPDATED = "HAZARD_UPDATED"
    IMPACT_UPDATED = "IMPACT_UPDATED"
    ALERT_CHANGED = "ALERT_CHANGED"
    TASK_ACTIVATED = "TASK_ACTIVATED"
    TASK_COMPLETED = "TASK_COMPLETED"
    OUTCOME_RECEIVED = "OUTCOME_RECEIVED"
    REPLAY_ADVANCED = "REPLAY_ADVANCED"
    REPLAY_RESET = "REPLAY_RESET"
    RESOURCE_RELOCATED = "RESOURCE_RELOCATED"
    SOS_RECEIVED = "SOS_RECEIVED"


class TaskStatus(str, Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class TaskPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    EXTREME = "EXTREME"


class DataFreshness(str, Enum):
    FRESH = "FRESH"
    AGING = "AGING"
    STALE = "STALE"


class SOSSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SOSStatus(str, Enum):
    NEW = "NEW"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    ASSIGNED = "ASSIGNED"
    RESPONDER_EN_ROUTE = "RESPONDER_EN_ROUTE"
    RESOLVED = "RESOLVED"


class SOSCategory(str, Enum):
    TRAPPED = "TRAPPED"
    INJURED = "INJURED"
    FLOOD = "FLOOD"
    MEDICAL = "MEDICAL"
    SHELTER = "SHELTER"
    EVACUATION = "EVACUATION"
    OTHER = "OTHER"


# ---------------------------------------------------------------------------
# Sub-models
# ---------------------------------------------------------------------------

class GeoPoint(BaseModel):
    lat: float
    lon: float


class TrackPoint(BaseModel):
    timestamp: datetime
    lat: float
    lon: float
    intensity_kt: float
    pressure_hpa: float
    regime: Optional[Regime] = None


class Environment(BaseModel):
    sst_c: Optional[float] = None
    shear_kt: Optional[float] = None
    humidity_pct: Optional[float] = None
    vorticity: Optional[float] = None
    divergence: Optional[float] = None


class Structure(BaseModel):
    eye_diameter_km: Optional[float] = None
    eyewall_symmetry: Optional[float] = None
    outer_band_coverage: Optional[float] = None
    convective_burst: bool = False


class ObservationQuality(BaseModel):
    score: float = Field(ge=0.0, le=1.0)
    sources: List[str] = []
    freshness: DataFreshness = DataFreshness.FRESH
    age_minutes: Optional[float] = None


class ChangePoint(BaseModel):
    detected: bool = False
    timestamp: Optional[datetime] = None
    from_regime: Optional[Regime] = None
    to_regime: Optional[Regime] = None
    delta_wind_kt: Optional[float] = None
    delta_pressure_hpa: Optional[float] = None
    confidence: float = 0.0
    description: str = ""


# ---------------------------------------------------------------------------
# Core domain objects
# ---------------------------------------------------------------------------

class Observation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    event_id: str
    timestamp: datetime
    source: str
    lat: float
    lon: float
    intensity_kt: float
    pressure_hpa: float
    movement_speed_kmh: Optional[float] = None
    movement_heading_deg: Optional[float] = None
    quality: Optional[ObservationQuality] = None
    raw_data: Optional[Dict[str, Any]] = None


class CycloneState(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    event_id: str
    tick: int
    timestamp: datetime
    lat: float
    lon: float
    intensity_kt: float
    intensity_uncertainty_kt: float = 5.0
    pressure_hpa: float
    movement_speed_kmh: float = 0.0
    movement_heading_deg: float = 0.0
    structure: Optional[Structure] = None
    regime: Regime = Regime.FORMATION
    regime_probabilities: Dict[str, float] = {}
    environment: Optional[Environment] = None
    confidence: float = Field(ge=0.0, le=1.0, default=0.8)
    observation_quality: Optional[ObservationQuality] = None
    change_point: Optional[ChangePoint] = None
    forecast_reference: Optional[str] = None


class ForecastTrackPoint(BaseModel):
    lead_hours: int
    lat: float
    lon: float
    intensity_kt: float
    pressure_hpa: float


class ForecastMember(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    forecast_version_id: str
    model_name: str
    init_time: datetime
    track_points: List[ForecastTrackPoint] = []
    weight: float = 1.0
    source: str = "SIMULATED"


class Forecast(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    event_id: str
    tick: int
    init_time: datetime
    members: List[ForecastMember] = []
    consensus_track: List[ForecastTrackPoint] = []
    model_disagreement_score: float = 0.0
    source: str = "SIMULATED"


class Scenario(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    event_id: str
    tick: int
    scenario_type: ScenarioType
    probability: float = Field(ge=0.0, le=1.0)
    track: List[ForecastTrackPoint] = []
    peak_intensity_kt: float = 0.0
    peak_pressure_hpa: float = 1010.0
    landfall_lat: Optional[float] = None
    landfall_lon: Optional[float] = None
    landfall_time: Optional[datetime] = None
    time_to_impact_hours: Optional[float] = None
    source: str = "SIMULATED"
    rationale: str = ""


class HazardZone(BaseModel):
    threshold: HazardThreshold
    geojson: Dict[str, Any]
    area_km2: Optional[float] = None
    color: str = "#ff0000"


class Hazard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    event_id: str
    tick: int
    scenario_type: ScenarioType = ScenarioType.BASE
    zones: List[HazardZone] = []
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    source: str = "PARAMETRIC_HOLLAND"


class ExposureBreakdown(BaseModel):
    threshold: HazardThreshold
    population_exposed: int = 0
    districts: List[str] = []


class ImpactAssessment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    event_id: str
    tick: int
    scenario_type: ScenarioType = ScenarioType.BASE
    total_exposed_population: int = 0
    exposure_breakdown: List[ExposureBreakdown] = []
    affected_districts: List[str] = []
    time_to_impact_hours: Optional[float] = None
    nearest_impact_point: Optional[GeoPoint] = None
    risk_level: RiskLevel = RiskLevel.LOW
    risk_factors: List[str] = []
    flood_risk_index: float = 0.0
    composite_risk: float = 0.0
    source: str = "SIMULATED"
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class Alert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    event_id: str
    tick: int
    level: AlertLevel
    previous_level: Optional[AlertLevel] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    tti_hours: Optional[float] = None
    risk_pct: float = 0.0
    triggered_by: List[str] = []
    debounce_key: Optional[str] = None


class Resource(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    resource_type: str
    district: str
    lat: float
    lon: float
    capacity: int = 0
    available: bool = True
    status: str = "AVAILABLE"


class OperationalTask(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    event_id: str
    tick: int
    title: str
    description: str
    priority: TaskPriority
    status: TaskStatus = TaskStatus.PENDING
    assigned_role: str = "NDRF_COMMAND"
    trigger: str = ""
    district: Optional[str] = None
    resource_ids: List[str] = []
    activated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    is_simulated: bool = True
    disclaimer: str = "SIMULATED — not official government instruction"


class TimelineEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    event_id: str
    tick: int
    timestamp: datetime
    type: TimelineEventType
    summary: str
    payload: Dict[str, Any] = {}
    severity: str = "INFO"


class AuditRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    event_id: str
    prediction_tick: int
    prediction_time: datetime
    target_time: datetime
    lead_hours: int
    model_source: str
    predicted_lat: Optional[float] = None
    predicted_lon: Optional[float] = None
    predicted_intensity_kt: Optional[float] = None
    actual_lat: Optional[float] = None
    actual_lon: Optional[float] = None
    actual_intensity_kt: Optional[float] = None
    track_error_km: Optional[float] = None
    intensity_error_kt: Optional[float] = None


class Outcome(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    event_id: str
    final_lat: float
    final_lon: float
    final_intensity_kt: float
    final_pressure_hpa: float
    landfall_time: Optional[datetime] = None
    landfall_lat: Optional[float] = None
    landfall_lon: Optional[float] = None
    dissipation_time: Optional[datetime] = None
    summary: str = ""


class CycloneEvent(BaseModel):
    id: str
    name: str
    status: EventStatus = EventStatus.ACTIVE
    basin: Basin = Basin.BOB
    start_time: datetime
    current_time: datetime
    current_tick: int = 0
    max_tick: int = 11
    demo_mode: bool = True
    current_state_id: Optional[str] = None
    current_alert: AlertLevel = AlertLevel.GREEN
    timeline: List[TimelineEvent] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    meta: Dict[str, Any] = {}


# ---------------------------------------------------------------------------
# SOS / NDRF
# ---------------------------------------------------------------------------

class SOSReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    event_id: str
    category: SOSCategory
    severity: SOSSeverity
    lat: float
    lon: float
    district: str
    people_count: int = 1
    description: str = ""
    contact: Optional[str] = None
    status: SOSStatus = SOSStatus.NEW
    priority_score: float = 0.0
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    duplicate_of: Optional[str] = None
    ndrf_alert_id: Optional[str] = None
    disclaimer: str = "DEMO SOS — not a real emergency line. For real emergencies dial 112."


class NDRFAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    event_id: str
    sos_id: str
    priority: TaskPriority
    target_role: str
    district: str
    category: SOSCategory
    lat: float
    lon: float
    people_count: int
    status: str = "OPEN"
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# Request / Response wrappers
# ---------------------------------------------------------------------------

class CreateEventRequest(BaseModel):
    id: Optional[str] = None
    name: str
    basin: Basin = Basin.BOB
    demo_mode: bool = True
    start_time: Optional[datetime] = None


class AdvanceRequest(BaseModel):
    steps: int = 1


class ReplayStartRequest(BaseModel):
    from_tick: int = 0


class UnifiedIntelligenceResponse(BaseModel):
    event: CycloneEvent
    state: Optional[CycloneState] = None
    forecasts: Optional[Forecast] = None
    scenarios: List[Scenario] = []
    hazard: Optional[Hazard] = None
    impact: Optional[ImpactAssessment] = None
    alert: Optional[Alert] = None
    operations: List[OperationalTask] = []
    timeline: List[TimelineEvent] = []
    metadata: Dict[str, Any] = {}


class SOSSubmitRequest(BaseModel):
    event_id: str
    category: SOSCategory
    severity: SOSSeverity
    lat: float
    lon: float
    district: str
    people_count: int = 1
    description: str = ""
    contact: Optional[str] = None
