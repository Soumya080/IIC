"""
CYCLONE-OS: Provider Interfaces
Member 3 and Member 4 implement these to plug their logic in.
Member 2 (Backend) owns the contract — providers are NEVER aware of the event clock.
The replay engine calls providers at the correct tick.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from schemas import CycloneState, Forecast, Scenario, Hazard, ImpactAssessment, OperationalTask


# ===========================================================================
# MEMBER 3 CONTRACT — Intelligence Provider
# ===========================================================================

class IntelligenceProvider(ABC):
    """
    Member 3 implements this.
    Backend will call: provider.analyze(state, tick)
    Returns a dict with keys matching CycloneState intelligence fields.
    """

    @abstractmethod
    def analyze(self, state: CycloneState, tick: int) -> Dict[str, Any]:
        """
        Input:
            state: current CycloneState at this tick
            tick: current time index (0-11)

        Returns dict with any/all of:
            - intensity_kt: float
            - pressure_hpa: float
            - regime: str (one of Regime enum values)
            - regime_probabilities: dict[str, float]  (must sum to 1.0)
            - confidence: float (0-1)
            - change_point_detected: bool
            - ri_probability: float (0-1)
            - environment: dict
            - forecast: dict  (optional, raw forecast output)
        """
        ...

    @abstractmethod
    def get_regime_probabilities(self, state: CycloneState) -> Dict[str, float]:
        """Return normalized probability dict for each Regime enum value."""
        ...

    @abstractmethod
    def get_ri_probability(self, state: CycloneState, tick: int) -> float:
        """Return probability (0-1) of rapid intensification in next 24h."""
        ...


class MockIntelligenceProvider(IntelligenceProvider):
    """
    Default provider backed by Member 3's IntelligenceService.
    """

    def __init__(self):
        from backend.ml.intelligence_service import IntelligenceService
        self._svc = IntelligenceService()

    def analyze(self, state: CycloneState, tick: int) -> Dict[str, Any]:
        snap = self._svc.get_snapshot(state.event_id, tick)
        return {
            "intensity_kt": snap.intensity.value_kt,
            "pressure_hpa": snap.intensity.min_pressure_hpa,
            "regime": snap.regime.dominant_regime.value if hasattr(snap.regime.dominant_regime, "value") else str(snap.regime.dominant_regime),
            "regime_probabilities": snap.regime.probabilities,
            "confidence": round(1.0 - snap.uncertainty.overall_uncertainty, 3),
            "change_point_detected": snap.change_point.detected if snap.change_point else False,
            "ri_probability": 0.75 if (snap.change_point and snap.change_point.detected) else 0.1,
            "environment": snap.environment.model_dump() if snap.environment else {},
            "model_version": "MOCK_v2.0",
            "source": "MOCK_INTELLIGENCE_SERVICE",
        }

    def get_regime_probabilities(self, state: CycloneState) -> Dict[str, float]:
        snap = self._svc.get_snapshot(state.event_id, state.tick)
        return snap.regime.probabilities

    def get_ri_probability(self, state: CycloneState, tick: int) -> float:
        snap = self._svc.get_snapshot(state.event_id, tick)
        return 0.75 if (snap.change_point and snap.change_point.detected) else 0.1


# ===========================================================================
# MEMBER 4 CONTRACT — GIS / Impact / Operations Providers
# ===========================================================================

class HazardProvider(ABC):
    """
    Member 4 implements this.
    Backend calls: provider.generate(state, scenario_type)
    Must return a Hazard object.
    """

    @abstractmethod
    def generate(self, event_id: str, tick: int, state: CycloneState, scenario_type: str) -> Hazard:
        """
        Input:
            event_id: cyclone event ID
            tick: current tick index
            state: CycloneState — contains lat/lon, intensity_kt, etc.
            scenario_type: "BASE" | "LEFT" | "RIGHT"

        Returns:
            Hazard with GeoJSON zones at 34/50/64 kt thresholds
        """
        ...


class ExposureProvider(ABC):
    """
    Member 4 implements this.
    Backend calls: provider.compute(hazard, tick)
    """

    @abstractmethod
    def compute(self, event_id: str, tick: int, hazard: Hazard, scenario_type: str) -> ImpactAssessment:
        """
        Input:
            event_id: str
            tick: int
            hazard: Hazard object (GeoJSON zones)
            scenario_type: str

        Returns:
            ImpactAssessment with population, districts, flood risk, composite risk
        """
        ...


class ImpactProvider(ABC):
    """Alias for ExposureProvider — computes final impact assessment."""

    @abstractmethod
    def assess(self, event_id: str, tick: int, state: CycloneState, hazard: Hazard) -> ImpactAssessment:
        ...


class OperationsProvider(ABC):
    """
    Member 4 implements this.
    Backend calls: provider.generate_tasks(state, alert, impact)
    """

    @abstractmethod
    def generate_tasks(self, event_id: str, tick: int, state: CycloneState,
                       alert: Any, impact: ImpactAssessment) -> List[OperationalTask]:
        """
        Returns list of OperationalTask objects triggered by current state.
        All tasks must have is_simulated=True and a non-empty disclaimer.
        """
        ...


# ---------------------------------------------------------------------------
# Registry — swap providers here
# ---------------------------------------------------------------------------

# Member 3 plugs in here:
intelligence_provider: IntelligenceProvider = MockIntelligenceProvider()

# Member 4 plugs in here (None = use built-in replay_engine generators):
hazard_provider: Optional[HazardProvider] = None
exposure_provider: Optional[ExposureProvider] = None
operations_provider: Optional[OperationsProvider] = None


def set_intelligence_provider(p: IntelligenceProvider):
    global intelligence_provider
    intelligence_provider = p


def set_hazard_provider(p: HazardProvider):
    global hazard_provider
    hazard_provider = p


def set_exposure_provider(p: ExposureProvider):
    global exposure_provider
    exposure_provider = p


def set_operations_provider(p: OperationsProvider):
    global operations_provider
    operations_provider = p
