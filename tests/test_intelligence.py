"""
CYCLONE-OS Intelligence Layer — Comprehensive Test Suite

Run:  python -m pytest tests/test_intelligence.py -v
From:  d:\\IIC
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.ml.intelligence_service import IntelligenceService
from backend.ml.mock_intensity import MockIntensityProvider
from backend.ml.mock_structure import MockStructureProvider
from backend.ml.mock_environment import MockEnvironmentProvider
from backend.ml.mock_regime import MockRegimeProvider
from backend.ml.change_point import DemoChangePointProvider
from backend.ml.uncertainty import RuleBasedUncertaintyProvider
from backend.ml.mock_forecast import MockForecastProvider
from backend.ml.mock_scenario import MockScenarioProvider
from backend.ml.schemas import (
    IntelligenceSnapshot,
    IntensityEstimate,
    StructureState,
    EnvironmentState,
    RegimeDistribution,
    ChangePointEvent,
    UncertaintyState,
    ForecastSet,
    ScenarioSet,
)


EVENT_ID = "DEMO-001"
MAX_TICK = 11


# ---------------------------------------------------------------
# 1. Regime probability sums to 1.0 for every tick
# ---------------------------------------------------------------
def test_regime_probabilities_sum_to_one():
    provider = MockRegimeProvider()
    for tick in range(MAX_TICK + 1):
        r = provider.get(EVENT_ID, tick)
        total = sum(r.probabilities.values())
        assert abs(total - 1.0) < 1e-6, f"Tick {tick}: regime probs sum to {total}"


# ---------------------------------------------------------------
# 2. Intensity trajectory is monotonically coherent
# ---------------------------------------------------------------
def test_intensity_trajectory_is_coherent():
    provider = MockIntensityProvider()
    values = [provider.get(EVENT_ID, t).value_kt for t in range(MAX_TICK + 1)]
    # Should increase from T0 to T7 (peak) and then decrease
    for i in range(7):
        assert values[i] <= values[i + 1], \
            f"Intensity should increase T{i}→T{i+1}: {values[i]} > {values[i+1]}"
    for i in range(7, MAX_TICK):
        assert values[i] >= values[i + 1], \
            f"Intensity should decrease T{i}→T{i+1}: {values[i]} < {values[i+1]}"


# ---------------------------------------------------------------
# 3. Uncertainty increases when data quality degrades
# ---------------------------------------------------------------
def test_uncertainty_spikes_on_degraded_quality():
    provider = RuleBasedUncertaintyProvider()
    good_tick = provider.get(EVENT_ID, 2)
    bad_tick = provider.get(EVENT_ID, 3)  # MW missing
    assert bad_tick.overall_uncertainty > good_tick.overall_uncertainty, \
        "Tick 3 (MW missing) should have higher uncertainty than tick 2"
    assert bad_tick.data_quality_flag == "DEGRADED_MW_MISSING"


# ---------------------------------------------------------------
# 4. Change point fires at expected ticks
# ---------------------------------------------------------------
def test_change_point_fires_at_expected_ticks():
    provider = DemoChangePointProvider()
    cpd_ticks = set()
    for tick in range(MAX_TICK + 1):
        cp = provider.get(EVENT_ID, tick)
        if cp.detected:
            cpd_ticks.add(tick)
    assert cpd_ticks == {4, 7, 10}, f"Expected CPD at {{4, 7, 10}}, got {cpd_ticks}"


# ---------------------------------------------------------------
# 5. All forecast members are valid
# ---------------------------------------------------------------
def test_forecast_members_valid():
    provider = MockForecastProvider()
    for tick in range(MAX_TICK + 1):
        fset = provider.get(EVENT_ID, tick)
        assert isinstance(fset, ForecastSet)
        for member in fset.members:
            assert member.model_name in {"ECMWF_HRES", "GFS", "UKMET", "HWRF"}
            assert len(member.track) > 0
            assert 0.0 <= member.confidence <= 1.0


# ---------------------------------------------------------------
# 6. Scenario probabilities sum to 1.0
# ---------------------------------------------------------------
def test_scenario_probabilities_sum_to_one():
    provider = MockScenarioProvider()
    for tick in range(MAX_TICK + 1):
        sset = provider.get(EVENT_ID, tick)
        total = sum(s.probability for s in sset.scenarios)
        assert abs(total - 1.0) < 1e-6, f"Tick {tick}: scenario probs sum to {total}"


# ---------------------------------------------------------------
# 7. Repeated execution produces identical output (determinism)
# ---------------------------------------------------------------
def test_deterministic_output():
    svc = IntelligenceService()
    snap1 = svc.get_snapshot(EVENT_ID, 5)
    snap2 = svc.get_snapshot(EVENT_ID, 5)
    assert snap1.model_dump() == snap2.model_dump(), "Outputs should be identical"


# ---------------------------------------------------------------
# 8. All schemas validate (no Pydantic errors)
# ---------------------------------------------------------------
def test_all_schemas_validate():
    svc = IntelligenceService()
    for tick in range(MAX_TICK + 1):
        snap = svc.get_snapshot(EVENT_ID, tick)
        assert isinstance(snap, IntelligenceSnapshot)
        assert isinstance(snap.intensity, IntensityEstimate)
        assert isinstance(snap.structure, StructureState)
        assert isinstance(snap.environment, EnvironmentState)
        assert isinstance(snap.regime, RegimeDistribution)
        assert isinstance(snap.change_point, ChangePointEvent)
        assert isinstance(snap.uncertainty, UncertaintyState)
        assert isinstance(snap.forecasts, ForecastSet)
        assert isinstance(snap.scenarios, ScenarioSet)


# ---------------------------------------------------------------
# 9. Intelligence snapshot is complete (no None in required fields)
# ---------------------------------------------------------------
def test_snapshot_completeness():
    svc = IntelligenceService()
    for tick in range(MAX_TICK + 1):
        snap = svc.get_snapshot(EVENT_ID, tick)
        assert snap.event_id == EVENT_ID
        assert snap.tick == tick
        assert snap.center is not None
        assert snap.intensity is not None
        assert snap.structure is not None
        assert snap.environment is not None
        assert snap.regime is not None
        assert snap.change_point is not None
        assert snap.uncertainty is not None
        assert snap.forecasts is not None
        assert snap.scenarios is not None


# ---------------------------------------------------------------
# 10. Mock provider can be replaced by a real provider
# ---------------------------------------------------------------
def test_interface_swappability():
    """Verify that mock providers implement the abstract interface."""
    from backend.ml.interfaces import (
        IntensityProvider,
        StructureProvider,
        EnvironmentProvider,
        RegimeProvider,
        ChangePointProvider,
        UncertaintyProvider,
        ForecastProvider,
        ScenarioProvider,
    )
    assert isinstance(MockIntensityProvider(), IntensityProvider)
    assert isinstance(MockStructureProvider(), StructureProvider)
    assert isinstance(MockEnvironmentProvider(), EnvironmentProvider)
    assert isinstance(MockRegimeProvider(), RegimeProvider)
    assert isinstance(DemoChangePointProvider(), ChangePointProvider)
    assert isinstance(RuleBasedUncertaintyProvider(), UncertaintyProvider)
    assert isinstance(MockForecastProvider(), ForecastProvider)
    assert isinstance(MockScenarioProvider(), ScenarioProvider)


if __name__ == "__main__":
    import pytest
    pytest.main([__file__, "-v"])
