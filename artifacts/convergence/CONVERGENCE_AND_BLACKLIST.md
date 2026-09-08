# Step 8 — Convergence Map and Common Solution Blacklist

## Saturation by region

| Region | Saturation | Evidence basis |
|---|---|---|
| CV classification of produce quality | **Saturated — commercially, at national scale** | Agrograde: 70+ units, 12 states, ~99% claimed accuracy; Gujarat state deployment of AI grain analysers |
| Medical image classification (DR, ASPECTS, OA) | **Saturated** | multiple regulator-cleared commercial products; among the most published ML application areas |
| Panic-button / SOS safety apps | **Saturated, with documented low sustained usage** | large app population; ~7% reporting rate shows the bottleneck is elsewhere |
| Blockchain supply-chain traceability | **Saturated in proposals, thin in deployment** | proposed repeatedly (PS-003, PS-006, PS-008 commentary); oracle problem unresolved everywhere |
| Job/skill matching portals | **Saturated** | large existing product population |
| SIEM / ML threat detection | **Saturated industrially** | mature vendor field |
| Crime-data safety routing | **Moderately explored, and known-flawed** | documented reporting-bias and feedback-loop critiques |
| Calendar slot booking for mandis | **Deployed by states already** | Punjab e-pass, MP e-Uparjan |
| Vision + AR work instruction | **Moderately explored** | established industrial category |
| **Farmer-side pre-commitment decision support (go / don't go, net-of-cost)** | **Weakly explored** | no instance found; farmers demonstrably make this decision with no support |
| **Capacity-aware admission control for procurement centres** | **Apparently unexplored** | all found systems schedule arrivals without a service model |
| **Independent witnessing of the collection event underlying an EPR credit** | **Apparently unexplored** | informal collectors explicitly absent from EPR policy |
| **Non-victim-initiated transit-safety mechanisms** | **Weakly explored** | every found mechanism sits downstream of victim reporting |
| **Vision-based force/pressure verification** | **Weakly explored** | industry practice instruments the tool instead |

**Search-coverage caveat, applied to every "unexplored" row above:** these rest on English-language
web search without systematic patent or non-English practitioner coverage. They mean *not found by
this process*, and must be read as **POTENTIALLY_UNDEREXPLORED / INSUFFICIENT_EVIDENCE**, never as
"nobody has done this."

---

## COMMON SOLUTION BLACKLIST

Approaches that must **not** be treated as innovative merely because a surface detail was changed.
An idea landing in this list is not forbidden — it is forbidden from being *called differentiated*.

1. **"CNN/transformer classifies images of X."** Includes every crop disease, retinal, CT, defect
   and produce-grading variant in the corpus. Changing the backbone, adding Grad-CAM, or calling
   the heatmap "explainable AI" does not exit this bucket.
2. **"Dashboard/portal that shows existing data to a new audience."** Includes slot-status displays,
   collector directories and placement portals.
3. **"Blockchain/QR/geotag for supply-chain traceability."** Adding a ledger under an unverified
   input records the unverified input immutably. Rejects PS-003 and PS-006 as stated.
4. **"Panic button, but with AI trigger."** Gesture, scream or shake detection still terminates in a
   victim-initiated alert to an unmodelled responder.
5. **"Safe route from crime data."** Inherits reporting bias as the routing objective.
6. **"Chatbot/LLM wrapper over domain documents."** Includes advisory bots, case-taking assistants
   and "operations assistants" with no formal model underneath.
7. **"Marketplace connecting A and B."** Matching is rarely the binding constraint; trust, credit
   and enforcement usually are.
8. **"Mobile app for a user population that does not have smartphones."** Directly applicable to
   PS-032 (~30% ownership) and much of the rural set.
9. **"IoT sensor network"** proposed without an answer to who installs it, who powers it, who
   maintains it and who pays.
10. **"Digital twin / simulation"** without validated domain physics and a baseline to beat.

---

## Anti-convergence directives carried into Step 10

- **Mechanism M1 (perception-and-classify) is crowded.** Explorers may use perception only as a
  *component* of a mechanism whose novelty lies elsewhere. No explorer may propose a candidate whose
  core contribution is a classifier.
- **The corpus's own proposed mechanisms (blockchain, IoT nodes, portals) are crowded** and are
  treated as hypotheses to be contradicted, not requirements to be satisfied.
- **The recurring structural gap — unbacked promises (M2/M3) — is the designated under-explored
  region** and receives disproportionate exploration budget.
- **Do not converge on "add a sensor."** At least one explorer must be required to solve force
  verification (PS-028) *without* adding a sensor, so that the sensor answer is chosen rather than
  defaulted to.
