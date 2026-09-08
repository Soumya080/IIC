"""
CYCLONE-OS Intelligence Layer — Abstract Interfaces

Every provider follows the same contract:
    provider.get(event_id, tick) -> Pydantic model

Hackathon mock providers index into precomputed JSON.
Real providers will run PyTorch inference against the same interface.
"""

from abc import ABC, abstractmethod
from typing import Any

from backend.ml.schemas import (
    ChangePointEvent,
    EnvironmentState,
    ForecastSet,
    IntensityEstimate,
    RegimeDistribution,
    ScenarioSet,
    StructureState,
    UncertaintyState,
)


class IntensityProvider(ABC):
    """Provides max-wind / min-pressure intensity estimates."""

    @abstractmethod
    def get(self, event_id: str, tick: int) -> IntensityEstimate: ...


class StructureProvider(ABC):
    """Provides cyclone structural organisation metrics."""

    @abstractmethod
    def get(self, event_id: str, tick: int) -> StructureState: ...


class EnvironmentProvider(ABC):
    """Provides large-scale environmental context (SST, shear, humidity)."""

    @abstractmethod
    def get(self, event_id: str, tick: int) -> EnvironmentState: ...


class RegimeProvider(ABC):
    """Provides probability distribution over cyclone lifecycle regimes."""

    @abstractmethod
    def get(self, event_id: str, tick: int) -> RegimeDistribution: ...


class ChangePointProvider(ABC):
    """Detects abrupt regime transitions in the state trajectory."""

    @abstractmethod
    def get(self, event_id: str, tick: int) -> ChangePointEvent: ...


class UncertaintyProvider(ABC):
    """Aggregates uncertainty across all sub-components."""

    @abstractmethod
    def get(self, event_id: str, tick: int) -> UncertaintyState: ...


class ForecastProvider(ABC):
    """Returns NWP forecast members for the current cycle."""

    @abstractmethod
    def get(self, event_id: str, tick: int) -> ForecastSet: ...


class ScenarioProvider(ABC):
    """Synthesises probability-weighted scenarios from forecast members."""

    @abstractmethod
    def get(self, event_id: str, tick: int) -> ScenarioSet: ...
