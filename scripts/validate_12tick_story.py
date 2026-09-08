"""
CYCLONE-OS 12-Tick Story Validation (Steps 2-5)

Validates:
  - T0-T11 conceptual progression
  - Intensity / structure / environment / regime temporal consistency
  - Data degradation demo (tick 3)
  - Change-point demo (ticks 4, 7, 10)
  - Forecast disagreement evolution
  - Scenario probability evolution and convergence

Exit code 0 = all checks pass.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.ml.intelligence_service import IntelligenceService

EVENT_ID = "DEMO-001"
svc = IntelligenceService()

errors = []
passed = 0


def check(description, condition, detail=""):
    global passed
    if condition:
        passed += 1
        print(f"  [PASS] {description}")
    else:
        errors.append(f"{description}: {detail}")
        print(f"  [FAIL] {description} -- {detail}")


# ======================================================================
# STEP 2: Verify the 12-tick story
# ======================================================================
print("\n=== STEP 2: 12-Tick Story Validation ===\n")

snaps = [svc.get_snapshot(EVENT_ID, t) for t in range(12)]

# T0-T1: GENESIS
check("T0 regime=GENESIS", snaps[0].regime.dominant_regime.value == "GENESIS")
check("T1 regime=GENESIS", snaps[1].regime.dominant_regime.value == "GENESIS")
check("T0-T1 intensity low (<= 35kt)", all(snaps[t].intensity.value_kt <= 35 for t in [0, 1]))

# T2-T3: DEVELOPING
check("T2 regime=DEVELOPING", snaps[2].regime.dominant_regime.value == "DEVELOPING")
check("T3 regime=DEVELOPING", snaps[3].regime.dominant_regime.value == "DEVELOPING")

# T4-T6: INTENSIFYING / RI
check("T4 regime=INTENSIFYING", snaps[4].regime.dominant_regime.value == "INTENSIFYING")
check("T5 regime=INTENSIFYING", snaps[5].regime.dominant_regime.value == "INTENSIFYING")
check("T6 regime=INTENSIFYING", snaps[6].regime.dominant_regime.value == "INTENSIFYING")

# T7: MATURE
check("T7 regime=MATURE", snaps[7].regime.dominant_regime.value == "MATURE")

# T8-T9: MATURE (approach)
check("T8 regime=MATURE", snaps[8].regime.dominant_regime.value == "MATURE")
check("T9 regime=MATURE", snaps[9].regime.dominant_regime.value == "MATURE")

# T10: WEAKENING (landfall)
check("T10 regime=WEAKENING", snaps[10].regime.dominant_regime.value == "WEAKENING")

# T11: WEAKENING (dissipation)
check("T11 regime=WEAKENING", snaps[11].regime.dominant_regime.value == "WEAKENING")

# Intensity rises T0->T7, falls T7->T11
ints = [s.intensity.value_kt for s in snaps]
check("Intensity rises T0->T7",
      all(ints[i] <= ints[i + 1] for i in range(7)),
      f"values: {ints[:8]}")
check("Intensity falls T7->T11",
      all(ints[i] >= ints[i + 1] for i in range(7, 11)),
      f"values: {ints[7:]}")
check("Peak at T7 (140kt)", ints[7] == 140)

# Structure rises with intensity
orgs = [s.structure.organization for s in snaps]
check("Structure org rises T0->T7",
      all(orgs[i] <= orgs[i + 1] for i in range(7)),
      f"values: {orgs[:8]}")
check("Structure peak at T7",
      orgs[7] == max(orgs),
      f"T7 org={orgs[7]}, max={max(orgs)}")

# Eye probability tracks intensity
eyes = [s.structure.eye_probability for s in snaps]
check("Eye prob peak at T7",
      eyes[7] == max(eyes),
      f"T7={eyes[7]}, max={max(eyes)}")

# Environment: shear decreases during RI, increases later
shears = [s.environment.wind_shear_kt for s in snaps]
check("Shear decreases T0->T5",
      all(shears[i] >= shears[i + 1] for i in range(5)),
      f"values: {shears[:6]}")
check("Shear increases T7->T11",
      all(shears[i] <= shears[i + 1] for i in range(7, 11)),
      f"values: {shears[7:]}")

# SST stays high during RI, decreases approaching land
ssts = [s.environment.sst_c for s in snaps]
check("SST > 30C during RI (T4-T6)",
      all(ssts[t] > 30 for t in [4, 5, 6]),
      f"values: {[ssts[t] for t in [4, 5, 6]]}")

# Center moves north
lats = [s.center.lat for s in snaps]
check("Center lat increases T0->T11 (northward motion)",
      all(lats[i] <= lats[i + 1] for i in range(11)),
      f"values: {lats}")

# Regime probabilities sum to 1.0 every tick
for t in range(12):
    total = sum(snaps[t].regime.probabilities.values())
    check(f"T{t} regime probs sum=1.0",
          abs(total - 1.0) < 1e-6,
          f"sum={total}")

# ======================================================================
# STEP 3: Verify data degradation demo
# ======================================================================
print("\n=== STEP 3: Data Degradation Demo ===\n")

unc2 = snaps[2].uncertainty
unc3 = snaps[3].uncertainty  # degraded tick

check("T3 data_quality = DEGRADED_MW_MISSING",
      unc3.data_quality_flag == "DEGRADED_MW_MISSING",
      f"got: {unc3.data_quality_flag}")
check("T3 overall_uncertainty > T2",
      unc3.overall_uncertainty > unc2.overall_uncertainty,
      f"T2={unc2.overall_uncertainty}, T3={unc3.overall_uncertainty}")
check("T3 intensity_uncertainty > T2",
      unc3.intensity_uncertainty > unc2.intensity_uncertainty,
      f"T2={unc2.intensity_uncertainty}, T3={unc3.intensity_uncertainty}")
check("T3 structure_uncertainty > T2",
      unc3.structure_uncertainty > unc2.structure_uncertainty,
      f"T2={unc2.structure_uncertainty}, T3={unc3.structure_uncertainty}")
check("Degradation does not break system (all fields present)",
      snaps[3].intensity is not None and snaps[3].structure is not None)

# T4 returns to GOOD
check("T4 data quality back to GOOD",
      snaps[4].uncertainty.data_quality_flag == "GOOD",
      f"got: {snaps[4].uncertainty.data_quality_flag}")

# ======================================================================
# STEP 4: Verify change-point demo
# ======================================================================
print("\n=== STEP 4: Change-Point Demo ===\n")

cp4 = snaps[4].change_point
check("T4 change_point detected=True", cp4.detected)
check("T4 prev=DEVELOPING, new=INTENSIFYING",
      cp4.previous_regime.value == "DEVELOPING" and cp4.new_regime.value == "INTENSIFYING",
      f"prev={cp4.previous_regime}, new={cp4.new_regime}")
check("T4 severity=HIGH", cp4.severity.value == "HIGH")
check("T4 has trigger_features", len(cp4.trigger_features) > 0)
check("T4 confidence > 0.8", cp4.confidence > 0.8, f"conf={cp4.confidence}")

cp7 = snaps[7].change_point
check("T7 change_point detected=True", cp7.detected)
check("T7 prev=INTENSIFYING, new=MATURE",
      cp7.previous_regime.value == "INTENSIFYING" and cp7.new_regime.value == "MATURE")

cp10 = snaps[10].change_point
check("T10 change_point detected=True", cp10.detected)
check("T10 prev=MATURE, new=WEAKENING",
      cp10.previous_regime.value == "MATURE" and cp10.new_regime.value == "WEAKENING")
check("T10 severity=CRITICAL", cp10.severity.value == "CRITICAL")

# Non-CPD ticks should have detected=False
for t in [0, 1, 2, 3, 5, 6, 8, 9, 11]:
    check(f"T{t} change_point detected=False",
          snaps[t].change_point.detected == False)

# ======================================================================
# STEP 5: Verify forecast/scenario contract
# ======================================================================
print("\n=== STEP 5: Forecast/Scenario Contract ===\n")

# Forecast members valid every tick (T11 has 0 members — no future ticks exist)
for t in range(12):
    fset = snaps[t].forecasts
    if t < 11:
        check(f"T{t} forecast has members", len(fset.members) > 0, f"count={len(fset.members)}")
    else:
        check(f"T{t} forecast (last tick, no future)", len(fset.members) == 0,
              "T11 is post-landfall; no future positions exist")
    for m in fset.members:
        check(f"T{t} {m.model_name} track valid", len(m.track) > 0)

# Scenario probabilities sum to 1.0
for t in range(12):
    sset = snaps[t].scenarios
    total = sum(s.probability for s in sset.scenarios)
    check(f"T{t} scenario probs sum=1.0",
          abs(total - 1.0) < 1e-6,
          f"sum={total}")

# Forecast disagreement evolution
disagrees = [snaps[t].forecasts.disagreement_score for t in range(12)]
# During RI (T4-T6), disagreement should be relatively higher
# After convergence (T7+), should decrease
check("Forecast disagreement visible (max > 0)",
      max(disagrees) > 0,
      f"max={max(disagrees)}")

# Scenario probabilities evolve smoothly
scen_a_probs = [sum(s.probability for s in snaps[t].scenarios.scenarios if s.scenario_id == "SCEN-A") for t in range(12)]
check("Scenario A prob increases T4->T11 (convergence)",
      scen_a_probs[4] < scen_a_probs[11],
      f"T4={scen_a_probs[4]}, T11={scen_a_probs[11]}")

# During intensification, consensus is lower (more divergence)
check("Scenario A prob lower during RI (T4) vs post (T7+)",
      scen_a_probs[4] < scen_a_probs[7],
      f"T4={scen_a_probs[4]}, T7={scen_a_probs[7]}")

# After approach, scenarios converge
check("Scenario A prob > 0.8 at T10 (convergence near landfall)",
      scen_a_probs[10] >= 0.80,
      f"T10={scen_a_probs[10]}")

# Scenario tracks are coherent (lat increases)
for t in range(12):
    for sc in snaps[t].scenarios.scenarios:
        if len(sc.track) >= 2:
            check(f"T{t} {sc.scenario_id} track northward",
                  sc.track[-1].lat >= sc.track[0].lat,
                  f"start={sc.track[0].lat}, end={sc.track[-1].lat}")

# Snapshot serializes cleanly
for t in range(12):
    try:
        d = snaps[t].model_dump(mode="json")
        check(f"T{t} snapshot serializes to JSON", True)
    except Exception as e:
        check(f"T{t} snapshot serializes to JSON", False, str(e))


# ======================================================================
# Summary
# ======================================================================
print(f"\n{'=' * 60}")
print(f"PASSED: {passed}")
print(f"FAILED: {len(errors)}")

if errors:
    print("\nFailed checks:")
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)
else:
    print("\nAll 12-tick story validations passed.")
    sys.exit(0)
