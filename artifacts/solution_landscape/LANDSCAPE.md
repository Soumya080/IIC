# Step 6 — Existing Solution Landscape

Solutions are described by how they *work*, not by name. Search coverage limitations are recorded
at the end and are material.

---

## PS-015 / PS-004 — Procurement and grading

### S1. Government e-token / slot booking (Punjab e-pass with Ola; MP e-Uparjan)
- **Goal:** regulate vehicle movement into grain markets.
- **User:** in practice, the commission agent; nominally the farmer.
- **Mechanism:** central allocation of dated entry permits against a calendar.
- **State modelled:** a date and a mandi. **Not modelled:** that day's service rate, gunny-bag
  stock, weighbridge availability, lifting trucks, storage headroom.
- **Human role:** agents distribute tokens; officials override.
- **Failure handling:** none evident — wrong-date issuance and misallocated mandis went uncorrected
  in-season.
- **Limitation that matters:** it is an *arrival* scheduler with no *service* model, so it can
  promise slots the centre cannot serve. It also allocates to intermediaries, who capture it.

### S2. AI grain analysers at MSP centres (Gujarat, deployed 2026)
- **Mechanism:** imaging + analysis of a drawn sample for foreign matter, damaged/discoloured
  grain, immature grain, admixture and moisture, at the procurement centre gate.
- **Human role:** operator draws sample; system grades; FCI lab verifies a subset.
- **Limitation that matters:** it improves consistency of a decision *taken after the farmer has
  already committed transport*. It speeds and hardens rejection. It does not move the decision.

### S3. Agrograde / Occipital Technologies — CV grading and sorting
- **Mechanism:** custom CV + ML, cloud-deployed, classifying multiple quality parameters; robotic
  sorting hardware.
- **Scale:** 10 MT/hour, up to ~99% grading accuracy, ~80% manpower reduction; 70+ units across 12
  states grading ~24,000 quintals daily across onion, potato, tomato, arecanut, apple.
- **Also ships a farmer-facing app** giving a quality overview of harvested produce, explicitly
  positioned as negotiation support with buyers.
- ([Agrograde](https://agrograde.com/), [YourStory](https://yourstory.com/2026/08/agrograde-onion-potato-sorting), [NITI FrontierTech](https://frontiertech.niti.gov.in/story/accurate-ai-sorting-enables-indian-fpos-to-double-daily-shipments-2))

> **This is decisive for PS-004.** The stated solution — "standardise onion grading with computer
> vision" — is a commercially deployed product at national scale, including the farmer-app variant.
> A team building CV onion grading is producing IDENTICAL prior art, and will be compared against
> 99% accuracy on purpose-built hardware.

### S4. The private trader at the farm gate
- **Mechanism:** immediate visual appraisal, immediate weighing, immediate cash.
- **Why it wins:** it prices *certainty and speed*, which the formal channel does not offer.
- Must be treated as the incumbent competitor in any adoption analysis.

### S5. Handheld grain moisture meters
- **Mechanism:** capacitance/resistance measurement of a grain sample.
- **Status:** commercially available and inexpensive relative to a rejected truckload.
- **Limitation that matters:** distribution and calibration trust, not physics. **Note this
  carefully — it means the moisture gap is a distribution/trust problem, not a sensing invention
  problem.** Any candidate claiming to *invent* farm-level moisture sensing is on weak ground.

---

## PS-032 — Informal recycling and EPR

### S6. Kabadiwalla Connect
- **Mechanism:** map informal aggregators, digitally connect them to formal recyclers, provide
  visibility and demand aggregation. Operating since 2014, Chennai.
- **Limitation that matters:** ~30% smartphone ownership among the target users, acknowledged by
  the company as an adoption barrier.

### S7. CPCB Centralized EPR Portal + plastic credits
- **Mechanism:** registered recyclers self-declare recycled tonnage and upload to the portal, which
  issues certificates; PIBOs purchase certificates to close their target gap.
- **Trust model:** self-declaration plus manual, document-based verification.
- **Observed failure:** 600,000+ fabricated certificates from four firms; recyclers issuing
  certificates without recycling; >70% of PROs not submitting audited data.
- **Limitation that matters:** the issuer of evidence is the party that benefits from inflating it,
  and the party that physically witnesses collection has no role.

### S8. QR/geotag batch traceability proposals
- **Mechanism:** assign a code per waste batch, geotag handovers, track through the chain.
- **Status:** widely *proposed* in industry commentary; not evidenced as deployed at scale.
- **Limitation that matters:** this is the classic oracle problem. A QR code attests that a scan
  happened, not that material moved. If the scanning party is the fraudulent party, the code adds
  precision to a lie. **This is the saturated answer and it is the one the corpus itself proposes
  in PS-003 and PS-006.**

---

## PS-023 — Transit safety

### S9. Panic-button apps and SOS hardware
- **Mechanism:** victim-initiated alert to contacts and/or police, with location.
- **Limitation that matters:** requires the victim to act, visibly, during the incident. Runs into
  the ~7% reporting rate and the stigma/distrust barrier directly.

### S10. CCTV in vehicles and stations
- **Mechanism:** continuous recording; retrospective retrieval on complaint.
- **Limitation that matters:** evidence exists but is only retrieved *if a complaint is filed* —
  so it inherits the same 7% gate. Also raises passenger-surveillance concerns.

### S11. Crowd-sourced safety maps (crime/perception layers on routing)
- **Mechanism:** aggregate reports/crime statistics into a route cost function.
- **Limitation that matters:** reported-crime data reflects reporting propensity, which is exactly
  the variable that is broken here. Under-reported areas appear safe. This creates a documented
  feedback-loop and bias risk.

---

## PS-028 — Windshield / assembly guidance

### S12. Poka-yoke with instrumented tools
- **Mechanism:** the *tool* measures torque/force and gates the step; the process halts until the
  step is correct.
- **Status:** established, dominant industrial practice.

### S13. Vision-based assembly verification / AR work instruction
- **Mechanism:** camera confirms presence, position, orientation, and step completion; AR or
  monitor overlays the next step.
- **Limitation that matters:** verifies geometry and sequence. Does not measure force.

---

## Search coverage and limitations (mandatory honesty)

- Searches were English-language and web-indexed. Practitioner discussion in Hindi, Marathi, Tamil,
  Punjabi and in closed WhatsApp/Telegram groups was **not** reachable and is likely where the
  richest direct user evidence lives.
- **No direct user evidence was obtained for any problem.** Everything above is journalism, NGO and
  academic reporting *about* practitioners, or company self-description. Company performance figures
  (99% accuracy, 10 MT/hour) are vendor claims, not independently verified.
- Patent search was cursory (one windshield patent surfaced incidentally). No systematic patent
  landscape was run; claims of differentiation must be read with that limit in mind.
- Absence of a search result is recorded as *not found*, never as *does not exist*.
- Government portal internals (e-Uparjan, CPCB) were assessed from public description only.
