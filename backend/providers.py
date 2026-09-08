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
    Default provider used until Member 3 connects their ML model.
    Returns values already present in seed data — passthrough.
    """

    def analyze(self, state: CycloneState, tick: int) -> Dict[str, Any]:
        return {
            "intensity_kt": state.intensity_kt,
            "pressure_hpa": state.pressure_hpa,
            "regime": state.regime.value,
            "regime_probabilities": state.regime_probabilities,
            "confidence": state.confidence,
            "change_point_detected": state.change_point.detected if state.change_point else False,
            "ri_probability": 0.75 if state.regime.value == "RAPID_INTENSIFICATION" else 0.1,
            "environment": state.environment.model_dump() if state.environment else {},
            "model_version": "MOCK_v1.0",
            "source": "MOCK",
        }

    def get_regime_probabilities(self, state: CycloneState) -> Dict[str, float]:
        return state.regime_probabilities or {state.regime.value: 1.0}

    def get_ri_probability(self, state: CycloneState, tick: int) -> float:
        return 0.75 if state.regime.value == "RAPID_INTENSIFICATION" else 0.1


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
