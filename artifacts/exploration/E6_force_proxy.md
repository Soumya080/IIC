# E6 — Failure-Mode-First, No New Sensor: Vision-Only Force Verification

Strategy: verify adequate windshield-seating pressure using cameras ALONE — no force sensor, instrumented glove, load cell, or smart tool. Every candidate names its physical observable, states why it correlates with force, and states when the proxy decouples. A second track covers process-evidence (sequence/completion/dwell) which is separable from force and does not require solving the force problem.

---

## PART A — Force-adjacent proxies (vision infers "was pressure adequate")

### A1. Digital Image Correlation (DIC) on the glass surface — strain/deflection mapping
- Target user: line operator installing windshield; quality engineer auditing station.
- Ground pain: no way to confirm each point got real seating force without instrumenting the hand/tool.
- Problem: force is invisible; but glass is not perfectly rigid — it deflects elastically under load.
- Hypothesis: a stereo camera pair (or single camera + projected/painted speckle pattern) can detect sub-millimeter local surface displacement of the glass at the moment of hand pressure, via DIC, and that displacement magnitude tracks applied force.
- Core mechanism: high-frame-rate stereo/structured-light imaging + DIC correlation of a speckle or existing texture pattern on the glass, computing local out-of-plane deflection during the press.
- PHYSICAL OBSERVABLE: local out-of-plane surface deflection (microns to sub-mm) of the glass at the contact point during dwell.
- Why it correlates with force: glass is a stiff but not infinitely rigid plate on a compliant urethane bead; deflection is proportional to applied load for a given local stiffness (Hooke's-law regime), confirmed feasible by published DIC work reaching ~0.015 mm mean error, i.e., micron-to-sub-mm precision (ResearchGate DIC-glass-defects paper; ScienceDirect DIC overview).
- WHEN THE PROXY DECOUPLES: (1) local stiffness varies by location (center of glass vs. near a rigid frame edge) so the same force gives different deflection at different points — needs per-point calibration; (2) if the operator presses on a spot where the glass is already seated (urethane fully compressed), deflection saturates and further force reads as no additional signal (ceiling effect) even if force is fine or excessive; (3) requires a speckle-trackable surface — factory glass is often clean/reflective, so needs a temporary applied pattern, projected pattern, or reliance on natural surface micro-texture/dust, all of which raise the noise floor; (4) vibration, operator body motion, and ambient line vibration will corrupt sub-mm measurement without a fixed rigid camera mount and controlled lighting; (5) doesn't distinguish push direction — a lateral/misaligned push can produce apparent deflection without proper normal-direction seating force.
- Workflow change: operator still presses by feel/training; system now also captures deflection signature per point as a QA record.
- Inputs: stereo/structured-light camera rig fixed relative to vehicle body, speckle or texture reference, per-vehicle-model calibration of expected deflection-to-force curve (established once via bench test with a real force sensor — the sensor is used only to CALIBRATE the vision system offline, not deployed on the line).
- Outputs: per-point deflection curve, pass/fail against calibrated envelope, flag for out-of-range or saturated readings.
- Assumptions: glass deflects measurably and repeatably under installation-typical force (tens of N); camera stability at production line vibration levels; consistent lighting.
- Data requirements: bench dataset pairing known applied force (via a calibration load cell, used only in a lab setup, not on-line) to measured deflection, per windshield geometry/model.
- Technical requirements: stereo camera pair or structured-light projector, >200fps for dwell-window capture, sub-pixel DIC software, rigid fixture, model-specific calibration library.
- Difficulty: high (metrology-grade vision under factory conditions).
- Adoption risks: operators/engineers skeptical of sub-mm vision claims; recalibration burden per model change; false confidence if saturation effect not understood by users.
- Prototype feasibility: medium — bench demo achievable with existing DIC software (open-source e.g. Ncorr) and a webcam pair; production-grade version is a much bigger lift.
- Demoability: strong as a lab demo (visibly overlay strain heatmap on video) — very persuasive for stakeholders; weaker as a "camera on the line already does this" claim.
- Difference from standard vision assembly verification: goes beyond hand/point tracking into quantitative strain metrology — genuinely different sensing modality (image-as-strain-gauge) rather than "did the hand visit the zone."

### A2. Sealant bead squeeze-out geometry (before/after edge profile)
- Target user: quality engineer; operator (indirect, no real-time change to their action).
- Ground pain: water-leak defects traced to inadequate seating are caught downstream at test booth, not at the bonding station.
- Problem: force at the moment of press is invisible, but its downstream EFFECT — how much the urethane bead was compressed/spread — is a durable, inspectable geometric trace.
- Hypothesis: the width/profile of the squeezed-out urethane bead visible at the windshield perimeter, imaged before and after seating, is a reliable indirect record of how much compressive force reached the bead at each zone.
- Core mechanism: perimeter-tracking camera (fixed or robot-mounted) captures the bead cross-section/edge line before the glass is set and again after all pressure points are applied; measures bead squeeze/spread width and compares to the expected "properly compressed" profile (per 3M-style bonding guidance: bead squeezed to roughly half original height when correctly seated).
- PHYSICAL OBSERVABLE: bead outline width / height reduction at the visible perimeter edge, and presence/continuity of squeeze-out along the whole perimeter.
- Why it correlates with force: adhesive/sealant technical guidance explicitly ties correct seating pressure to a target squeeze-out geometry (roughly halved bead height, consistent visible fillet) — this is the industry's own stated criterion for "properly pressed," making it a first-party, not indirect, correlate.
- WHEN THE PROXY DECOUPLES: (1) bead geometry also depends on bead volume/application consistency upstream (a thin or gappy bead applied by the caulk-gun operator will show little squeeze-out even under correct force, and a thick bead can show squeeze-out under too little force); (2) squeeze-out is only visible/measurable at the outer perimeter — it says nothing about a point pressed near the interior of the glass away from any visible bead edge; (3) squeeze-out is a CUMULATIVE result of all points plus gravity/dwell time, not a per-point, per-moment signal — cannot attribute inadequate result to which specific point was missed; (4) urethane rheology (temperature, cure state, viscosity lot variation) changes how much it spreads for a given force, so the same force yields different squeeze-out on a cold day vs. a warm day; (5) glass overhang can occlude the bead from camera view at some perimeter zones (e.g., under trim, at corners).
- Workflow change: adds a before/after perimeter scan step (glass already needs positioning anyway); does not change how the operator presses.
- Inputs: perimeter camera(s) or a scanning pass, illumination that reveals bead edge/fillet clearly, per-model bead-width/geometry spec.
- Outputs: pass/fail per perimeter zone, bead-continuity map, flag for "starved" segments needing rework before cure.
- Assumptions: bead is visible in some inspection window before trim/moulding covers it; consistent bead application quality upstream.
- Data requirements: reference "good squeeze-out" images per model/bead spec, from prior known-good and known-defective (leak-tested) installs — ideally traceable to actual water-leak outcomes to validate the proxy end to end.
- Technical requirements: high-resolution perimeter camera(s), possibly line-scan or robot-mounted scan, edge-detection/segmentation model, lighting control for a reflective/dark bead material.
- Difficulty: medium — this is closer to standard machine-vision inspection (edge/geometry measurement) than A1's strain metrology.
- Adoption risks: catches bad outcomes AFTER the fact (still before final leak test, which is the real win) rather than guiding the operator live; requires bead visible pre-trim, may need a process step reorder.
- Prototype feasibility: high — standard 2D machine vision (edge detection, width measurement) with off-the-shelf camera; can demo on a bench-mounted mock frame quickly.
- Demoability: strong and intuitive — "here's the bead squished the right amount, here's a gap" is an easy demo to show non-technical stakeholders.
- Difference from standard vision assembly verification: shifts the inspection target from "did hand visit point" to "did the material itself register a compression outcome" — inspecting the artifact's own physical consequence, not the operator's motion.

### A3. Perimeter gap-closure measurement (glass-to-pinchweld/flange offset, before/after)
- Target user: quality engineer; downstream process auditor.
- Ground pain: seating quality (glass fully down into the bead vs. sitting proud/tilted) determines leak risk but is not verified until final water test.
- Problem: force itself isn't visible, but full/inadequate seating changes a measurable geometric relationship — the standoff gap between the glass edge and the body flange/pinchweld.
- Hypothesis: a camera-based (or structured-light) gap measurement around the full windshield perimeter, taken after all points are pressed, will show a smaller/more uniform gap where seating (hence adequate force) succeeded, and a larger or uneven gap where a point was skipped or under-pressed.
- Core mechanism: structured-light or stereo scan of the perimeter gap/flush profile before pressing and after pressing; compute gap-closure delta per zone.
- PHYSICAL OBSERVABLE: perimeter standoff distance / flushness (glass surface height relative to body surface) at each zone, before vs. after.
- Why it correlates with force: adequate pressure seats glass fully into the compliant bead, reducing the gap; inadequate pressure leaves the glass proud in that zone — this is functionally the acceptance criterion body shops already use flush/gap checks for.
- WHEN THE PROXY DECOUPLES: (1) gap is also driven by manufacturing tolerance of the flange/pinchweld itself and by bead volume, not force alone — a generously-dosed bead can show good flush with less-than-ideal force; (2) settling/relaxation of urethane continues after the operator's hand leaves — an immediate post-press scan may show apparent full seating that later sags, or vice versa (viscoelastic creep); (3) global gap/flush doesn't localize to which of the several discrete pressure "points" was skipped — it aggregates the whole zone's outcome; (4) reflective/curved glass and chrome trim edges are notoriously hard for stereo/structured light (specular surfaces defeat correlation and structured-light triangulation) — needs careful photometric setup or IR/polarized approach.
- Workflow change: adds an automated post-seating scan step, replacing or supplementing a manual flush-and-gap visual/feeler-gauge check that many plants already do manually.
- Inputs: structured-light or laser-line scanner around perimeter, per-model nominal flush/gap spec.
- Outputs: gap-closure heatmap, pass/fail per zone, trend data for correlating with downstream leak test results.
- Assumptions: pre-press baseline scan is practical in the takt time; specular glass/trim can be handled with polarizing filters or diffuse illumination.
- Data requirements: paired gap-scan + water-leak-test outcome dataset to validate that gap-closure actually predicts leak pass/fail (this is the step that would prove or kill the whole proxy).
- Technical requirements: structured-light/laser scanner, polarized lighting for specular glass, per-model CAD-referenced nominal gap map, zone segmentation.
- Difficulty: medium-high (specular surface metrology is a known hard problem).
- Adoption risks: adds cycle time for two scans (before/after); specular glass may need line-specific tuning; correlation with actual leaks needs a validation study before anyone trusts it as a gate.
- Prototype feasibility: medium — feasible on a bench rig with a laser-line scanner; specular-surface handling is the main engineering risk.
- Demoability: moderate — a heatmap of "still gapped here" is compelling but needs a real body-in-white fixture, not just a flat panel, to be convincing.
- Difference from standard vision assembly verification: inspects the JOINT's geometric outcome (gap closure) rather than the operator's hand — a fundamentally different measurement target than motion/dwell tracking.

### A4. Skin/knuckle blanching and hand deformation
- Target user: operator (real-time feedback candidate).
- Ground pain: want a cheap, no-extra-hardware, purely-optical per-press force cue.
- Problem: capillary blanching (skin whitening under load) and finger/knuckle flattening are real, visible phenomena that occur under manual pressure.
- Hypothesis: a camera trained on the operator's hand could detect blanching (color/reflectance change at fingertip) or visible finger-pad flattening/deformation as a proxy for applied force.
- Core mechanism: high-res camera on operator's hand + skin-tone/reflectance change detection, or finger-pad contact-area growth as it flattens under load.
- PHYSICAL OBSERVABLE: localized skin blanching (reduced blood volume → color/reflectance shift) and/or increased visible finger-pad contact area (flattening) at the point of contact.
- Why it correlates with force: physiologically, blanching onset and degree scale with capacious pressure occluding local capillaries; finger-pad area vs. load is a documented biomechanics relationship (used in some HCI/haptics force-estimation research via camera).
- WHEN THE PROXY DECOUPLES: (1) gloves — mandatory in most auto assembly for safety/cleanliness — fully occlude skin, killing the signal outright (this alone may disqualify the whole candidate for real plants); (2) skin tone, calluses, and individual physiology vary the blanching threshold and visibility hugely across operators, defeating a single universal calibration; (3) camera angle/occlusion — the pressing hand is typically wedged against the glass with the camera's view of the fingertip blocked by the hand's own back or the glass itself; (4) lighting variation across a shift changes apparent color/reflectance, confounding blanching detection; (5) it measures LOCAL fingertip pressure, not the NET force transmitted into the glass/bead (some force is absorbed by finger/joint compliance, some pressing technique uses palm/heel of hand where blanching is far less visible).
- Workflow change: none required in principle (camera watches existing hand motion) but conflicts with glove policy.
- Inputs: high-res, close camera on the pressing hand, per-operator calibration ideally.
- Outputs: a rough qualitative "pressure applied / not applied" signal, not a real value.
- Assumptions: bare-hand operation (frequently false in this industry) and unobstructed camera view of the actual contact fingertip.
- Data requirements: per-operator baseline (skin tone, resting color) plus labeled blanching-vs-known-force bench data.
- Technical requirements: high-frame-rate close-up camera, skin-tone-invariant color/reflectance model, real-time hand pose to locate the contact digit.
- Difficulty: high, largely because of confounds, not optics.
- Adoption risks: gloves make this a non-starter in many plants; likely to be seen as invasive/creepy (biometric-adjacent monitoring of the body); high false-negative rate for callused/darker-skinned operators unless carefully validated — an equity and reliability risk that should be flagged early.
- Prototype feasibility: low-medium — bench demo with a bare hand pressing a load cell (for calibration only) is doable, but production relevance is weak.
- Demoability: weak/risky — likely to raise "is this watching my body" concerns in a live demo.
- Difference from standard vision assembly verification: none really — this is closest to "just watch the hand harder," and the write-up above shows why it mostly fails to escape that trap. Included to show the boundary was tested, not skipped.

### A5. Operator body posture / weight-transfer kinematics
- Target user: operator; process engineer designing station ergonomics.
- Ground pain: skilled operators are known (informally) to "lean into" the press for high-force points; there's no way to codify or check that technique was used.
- Problem: force is invisible, but the WHOLE-BODY kinematic signature of a properly weighted press (torso lean angle, shoulder drop, weight shift onto the front foot, arm lock) is externally visible and repeatable for a given trained technique.
- Hypothesis: a full-body pose-estimation camera (skeleton tracking) can detect whether the operator's posture/weight-transfer pattern matches the trained "adequate-force" technique for each point, as a behavioral proxy for force delivered.
- Core mechanism: overhead/side camera + human pose estimation (e.g., OpenPose-style skeleton), comparing joint-angle/weight-shift trajectory against a reference technique captured from a certified trainer under known-good conditions.
- PHYSICAL OBSERVABLE: joint angles (elbow lock, torso lean), center-of-mass shift, and dwell posture at each pressure point.
- Why it correlates with force: for a human pressing against a resistant surface, generating high sustained force without a tool essentially requires transferring body weight through a braced arm — a limp wrist/arm's-length tap cannot deliver comparable force, so posture is a genuine biomechanical prerequisite, not an arbitrary correlate.
- WHEN THE PROXY DECOUPLES: (1) it is a NECESSARY-technique check, not a force MEASUREMENT — an operator can adopt correct-looking posture while pressing lightly (e.g., practicing the motion, hovering) if not actually resisted by the glass, so it can be gamed or simply wrong under fatigue-driven shortcuts; (2) body size/reach variation means the "reference" skeleton trajectory from one trainer doesn't transfer cleanly to operators of different height/build without per-operator calibration; (3) station layout variation (reaching over an interior, awkward angle for corner points) can force a different, still-adequate posture that doesn't match the reference, causing false rejects; (4) says nothing about whether the actual CONTACT POINT and glass responded (no link back to the glass itself) — entirely decoupled if, e.g., hand slips or contacts the wrong spot while posture still looks right.
- Workflow change: requires a one-time reference-technique capture per station/model, done by a trainer; ongoing comparison is passive (doesn't change operator's task).
- Inputs: overhead/side pose camera, reference technique clips per point/model, operator height/build metadata (optional, for normalization).
- Outputs: technique-conformance score per point, flagged deviations for coaching, NOT a force value.
- Assumptions: correct force delivery in this job genuinely requires whole-body technique (plausible for high-force points, less so for light ones); operators are not deliberately gaming posture.
- Data requirements: reference technique library per station/model from trained operators; ideally paired with force-sensor ground truth (lab-only) at least once to validate technique-adequate-force linkage.
- Technical requirements: multi-camera pose estimation, skeleton-trajectory comparison/DTW-style matching, per-station calibration.
- Difficulty: medium (pose estimation is mature; the harder part is validating that technique really implies force here).
- Adoption risks: operators may feel surveilled/coached on their bodies; disability/body-type accommodation concerns; risk of teaching-to-the-test (gaming the posture without real force).
- Prototype feasibility: medium-high — off-the-shelf pose estimation (e.g., MediaPipe) makes a bench/line demo quick to build.
- Demoability: strong visually (skeleton overlay, "good technique" vs "bad technique" side by side) — easy to sell to non-technical stakeholders, BUT should be presented honestly as a technique check, not a force gauge.
- Difference from standard vision assembly verification: moves the unit of analysis from "hand at a point for N seconds" to "whole-body technique conformance" — a genuinely different observable class (kinematic technique, not location/dwell).

### A6. Contact-duration / dwell-time as a coarse force-adequacy proxy
- Target user: operator; line supervisor.
- Ground pain: short, brushing contact clearly isn't enough force-time, but current systems (per problem statement) already claim to track "sequential application" — this candidate is about being explicit that dwell time is a WEAK, coarse, but honest proxy, not a force measurement.
- Problem: distinguish a genuine sustained press from a token touch, using only hand-in-zone timing.
- Hypothesis: minimum dwell time at each point (e.g., hand stationary in zone for ≥X seconds) filters out the most obvious omission/rushed-commission failures, even though it says nothing about force magnitude.
- Core mechanism: standard hand/zone tracking + timer, with a minimum-dwell gate before a point is marked complete.
- PHYSICAL OBSERVABLE: duration of hand presence and near-stillness within the designated zone.
- Why it correlates with force: professionals apply sustained pressure over ~1-3 seconds typically to allow urethane to compress and glass to seat (a physically necessary MINIMUM time for any meaningful seating to occur, since it's not instantaneous) — so dwell time is a plausible floor/gate.
- WHEN THE PROXY DECOUPLES: this is the most honest and clean decoupling of the whole set — dwell time and force are ORTHOGONAL: an operator can rest a hand lightly on the zone for 5 seconds (long dwell, near-zero force) or deliver a hard, fast, adequate press in 0.5 seconds and lift off. Dwell only catches the OMISSION failure mode and the most extreme rushed-commission cases; it structurally CANNOT catch "held there but barely touching," which is a common real failure mode.
- Workflow change: minimal — operator already dwells naturally; system adds a completion gate requiring minimum time in zone.
- Inputs: hand/zone tracking (existing computer-vision baseline), configurable minimum-dwell threshold per point.
- Outputs: per-point completion status (dwell-gated), sequence log, timestamped audit trail.
- Assumptions: minimum-dwell threshold is set from training/ergonomic study, not arbitrary.
- Data requirements: reference dwell-time distribution from known-good expert presses (ideally paired with force sensor once, lab-only, to set a sane threshold).
- Technical requirements: same as baseline hand-tracking system already implied by the problem statement — no new capability.
- Difficulty: low — this is close to the "standard" baseline system, deliberately kept simple.
- Adoption risks: false sense of security if presented as more than it is — must be labeled explicitly "presence/duration check, not a force check" to avoid the team believing the omission problem and the commission problem are both solved by this alone.
- Prototype feasibility: very high — essentially the MVP of the whole system, buildable immediately.
- Demoability: high — easy to show hand-in-zone timers on a screen.
- Difference from standard vision assembly verification: NONE — this IS the standard baseline. Included deliberately to mark the boundary of what plain motion/dwell tracking honestly buys you, so it's not mistaken for a force solution.

---

## PART B — Process-evidence track (separable from force; verifies the PROCEDURE was followed)

This track does not attempt to infer force at all. It treats "prove the standard process was followed" as a distinct, fully vision-solvable problem, valuable on its own even if force verification remains unsolved.

### B1. Full-coverage sequence and completion audit trail
- Target user: quality/compliance auditor; plant manager; auto OEM audit (e.g., IATF 16949 traceability).
- Ground pain: when a leak defect is found downstream, there is currently no record of what actually happened at the bonding station for that specific VIN.
- Problem: even without knowing force, prove — with a timestamped, VIN-linked video/event record — that every required point was visited, in the correct order, for at least the minimum dwell, by an identified operator.
- Hypothesis: a vision system that logs point-by-point completion (zone, order, timestamp, dwell, operator ID) creates a legally/quality-defensible process record, independent of whether force itself was adequate.
- Core mechanism: zone/hand tracking (as in A6) + event logging tied to VIN and operator badge/ID, stored and queryable.
- PHYSICAL OBSERVABLE: hand-in-zone events, their order, and their timestamps.
- Why it correlates with force: it doesn't claim to — this is explicitly NOT a force proxy, which is its main value: it's honest about its limits while still closing the omission gap and creating traceability that helps root-cause downstream leaks (e.g., "was point 4 skipped on this VIN?").
- WHEN THE PROXY DECOUPLES: N/A as a force proxy by design; as a PROCESS proxy it decouples when the hand is in the zone but not actually contacting/pressing the glass (e.g., hovering, gesturing) — a coarse occlusion/contact check (is anything between camera and glass at that pixel region) helps but doesn't fully close this.
- Workflow change: none beyond what a baseline system already requires; adds retrieval/audit UI for quality engineers.
- Inputs: same camera/tracking as baseline, VIN identification (existing plant systems), operator ID.
- Outputs: per-VIN completion certificate, searchable audit log, exception report for skipped/out-of-order/short-dwell points.
- Assumptions: VIN and operator identification integration is available on the line.
- Data requirements: none beyond operational logging; retention policy for video/event data.
- Technical requirements: existing hand-tracking baseline + database/logging layer + VIN/operator ID integration — no new vision capability.
- Difficulty: low (integration work, not a vision research problem).
- Adoption risks: privacy/labor concerns about per-operator logging; data retention/storage costs at scale; must be positioned as quality tool, not surveillance/discipline tool, to gain operator buy-in.
- Prototype feasibility: very high.
- Demoability: high — a clean audit dashboard is an easy, credible demo for quality/compliance stakeholders.
- Difference from standard vision assembly verification: reframes the "confirmation" the problem statement asks for as an AUDIT ARTIFACT (retrievable, VIN-linked evidence) rather than only a real-time green-light — a genuinely different deliverable (defensible record vs. momentary confirmation).

### B2. Coverage-completeness via perimeter density mapping (spatial, not just point-count)
- Target user: process engineer designing/validating where the "predefined points" should even be.
- Ground pain: predefined discrete points are a simplification; real bead-adhesion needs continuous, evenly distributed pressure, and a fixed point list may leave gaps between points untouched.
- Problem: verify not just "were the N designated points visited" but "was pressure applied with reasonably even spatial coverage along the whole perimeter," using hand-position tracking accumulated as a heatmap.
- Hypothesis: an accumulated spatial heatmap of hand-contact positions across the full press sequence reveals coverage gaps between nominal points that a simple point-checklist would miss.
- Core mechanism: same hand-tracking baseline, but accumulate ALL contact positions (not just nearest-designated-point snapping) into a continuous coverage map compared against a minimum-coverage-density spec.
- PHYSICAL OBSERVABLE: spatial distribution/density of hand-contact positions over the full perimeter during the operation.
- Why it correlates with force: again, explicitly does not — pure coverage/completeness signal, complementary to A1-A3's force-adjacent signals.
- WHEN THE PROXY DECOUPLES: decouples from adequacy the moment coverage is confused with correctness — full coverage with zero real force everywhere would score perfectly on this metric while being a total process failure; must be paired with a force-adjacent signal (Part A) or downstream outcome data to mean anything about actual seating.
- Workflow change: none — passive accumulation of existing tracked motion.
- Inputs: hand-tracking baseline, perimeter geometry model per vehicle type.
- Outputs: coverage heatmap, gap-flagging, feed into process design to refine predefined point placement.
- Assumptions: predefined point list may be imperfect; useful primarily as an engineering feedback tool, secondarily as a per-VIN QA gate.
- Data requirements: perimeter geometry per model; no force ground truth needed.
- Technical requirements: same baseline tracking, spatial heatmap accumulation, geometric coverage-spec comparison.
- Difficulty: low-medium.
- Adoption risks: could create false confidence if mistaken for a force/quality signal rather than a coverage/process-design tool.
- Prototype feasibility: very high.
- Demoability: high (heatmap visuals are persuasive) but must be captioned carefully to avoid overclaiming.
- Difference from standard vision assembly verification: shifts unit of analysis from discrete "points" (as literally specified in the problem statement) to continuous spatial coverage — a genuinely different data model, useful for refining the point-list design itself.

---

## VERDICT

Vision-only, sensor-free TRUE FORCE MEASUREMENT is not physically achievable to the fidelity a torque/force-instrumented tool provides. Force is fundamentally a contact-mechanics quantity (Newtons at an interface); a camera measures light, i.e., geometry, motion, and color over time. Every path from "light" to "was force adequate" therefore necessarily passes through an intermediate physical effect that force merely CAUSES, and every candidate above shows that intermediate effect is also caused, confounded, or masked by something other than force alone (local stiffness variance, bead volume/rheology, viscoelastic creep, gloves, technique gaming, camera occlusion). That is not a vision-engineering limitation to be solved by a better camera — it is a genuine physics gap: several independent causal factors map onto the same visible effect, so the inverse problem (observable → force) is underdetermined without an independent calibration reference, which is exactly what a load cell/instrumented tool provides and vision cannot.

That said, vision is NOT useless here, and the strongest three candidates below define what "as far as vision alone can honestly go" looks like:

1. **A2 — Bead squeeze-out geometry.** Strongest candidate overall: it uses the industry's OWN stated acceptance criterion (squeeze-out to roughly half bead height) as the target signal, is standard 2D machine vision (not exotic metrology), and — crucially — can be VALIDATED directly against the downstream water-leak test outcome that the problem statement says is currently the only late, expensive check. If squeeze-out geometry statistically predicts leak-test pass/fail, that's a vision-only early-warning system with real evidentiary weight, honestly scoped as "did the joint show the expected consequence," not "was the force N newtons."

2. **A1 — DIC-based glass strain/deflection.** Highest scientific credibility (published DIC precision is genuinely sub-mm) and the most direct optical analog to "feeling" the press, but the hardest to deploy at factory-floor speed/vibration and needs per-model calibration; best positioned as a lab-validated method that could migrate to production once de-risked, not a v1 line solution.

3. **B1 — Process-evidence audit trail.** Not a force proxy at all, and that is exactly its strength: it fully and honestly solves the OMISSION half of the problem (sequence, completion, dwell, traceability) with low-risk, mature technology, and gives quality engineers the VIN-linked record needed to root-cause leaks after the fact — closing the "defects caught late, expensively" pain even without solving COMMISSION.

Recommendation to the team: do not promise vision-only force verification as a like-for-like replacement for an instrumented tool. The honest, defensible framing is a layered system — B1 (process/coverage evidence, cheap and reliable) + A2 (squeeze-out geometry, medium effort, validated against real leak outcomes) as the practical near-term stack, with A1 (strain-based) as a longer-horizon research track, and A4/A5 flagged as weak or confound-prone and not recommended for primary reliance.
