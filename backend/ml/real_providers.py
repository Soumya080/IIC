"""
CYCLONE-OS — Real Model Provider Stubs (Step 8)

Lightweight interface stubs for future PyTorch model integration.
These classes inherit the same abstract interfaces as the mock providers.

Replacement path:
  1. Implement the `get()` method with real model inference
  2. Swap in IntelligenceService.__init__() — one line change
  3. All downstream consumers (backend, frontend, impact) are unaffected

DO NOT implement actual PyTorch training here.
This file exists solely to document the replacement path.
"""

from datetime import datetime

from backend.ml.interfaces import (
    IntensityProvider,
    StructureProvider,
    RegimeProvider,
)
from backend.ml.schemas import (
    IntensityEstimate,
    RegimeDistribution,
    StructureState,
)


class RealIntensityProvider(IntensityProvider):
    """
    Future PyTorch-based intensity estimator.

    Replacement path:
        MOCK: MockIntensityProvider  (precomputed table lookup)
        REAL: RealIntensityProvider   (CNN/LSTM on satellite imagery)

    Expected model:
        - Input: Multi-channel satellite image tensor (IR, WV, MW)
        - Output: IntensityEstimate with calibrated uncertainty bounds
        - Architecture: CNN-LSTM hybrid or Vision Transformer
        - Training data: IBTrACS + INSAT-3D/3DR imagery

    Integration:
        In intelligence_service.py, change:
            self._intensity = MockIntensityProvider()
        To:
            self._intensity = RealIntensityProvider(model_path="models/intensity_v1.pt")

    The downstream system does not change.
    """

    def __init__(self, model_path: str = "models/intensity_v1.pt") -> None:
        self._model_path = model_path
        # Future: self._model = torch.load(model_path)

    def get(self, event_id: str, tick: int) -> IntensityEstimate:
        raise NotImplementedError(
            "RealIntensityProvider requires a trained PyTorch model. "
            "Use MockIntensityProvider for the hackathon demo."
        )


class RealStructureProvider(StructureProvider):
    """
    Future PyTorch-based structure analysis provider.

    Replacement path:
        MOCK: MockStructureProvider  (precomputed table lookup)
        REAL: RealStructureProvider   (CNN on IR/MW imagery for eye/convection detection)

    Expected model:
        - Input: IR brightness temperature field + MW 85/89 GHz
        - Output: StructureState with organization, eye probability, symmetry
        - Architecture: U-Net or ResNet with multi-task heads
        - Training data: INSAT-3D/3DR + SSMIS/AMSU-B paired observations

    Integration:
        In intelligence_service.py, change:
            self._structure = MockStructureProvider()
        To:
            self._structure = RealStructureProvider(model_path="models/structure_v1.pt")
    """

    def __init__(self, model_path: str = "models/structure_v1.pt") -> None:
        self._model_path = model_path

    def get(self, event_id: str, tick: int) -> StructureState:
        raise NotImplementedError(
            "RealStructureProvider requires a trained PyTorch model. "
            "Use MockStructureProvider for the hackathon demo."
        )


class RealRegimeProvider(RegimeProvider):
    """
    Future PyTorch-based regime classifier.

    Replacement path:
        MOCK: MockRegimeProvider   (precomputed probability tables)
        REAL: RealRegimeProvider    (HMM or Transformer on multi-variate time series)

    Expected model:
        - Input: Time series of intensity, structure, environment features
        - Output: RegimeDistribution with calibrated probabilities
        - Architecture: Hidden Markov Model or Temporal Transformer
        - Training data: IBTrACS lifecycle labels + reanalysis features

    Integration:
        In intelligence_service.py, change:
            self._regime = MockRegimeProvider()
        To:
            self._regime = RealRegimeProvider(model_path="models/regime_v1.pt")
    """

    def __init__(self, model_path: str = "models/regime_v1.pt") -> None:
        self._model_path = model_path

    def get(self, event_id: str, tick: int) -> RegimeDistribution:
        raise NotImplementedError(
            "RealRegimeProvider requires a trained PyTorch model. "
            "Use MockRegimeProvider for the hackathon demo."
        )
