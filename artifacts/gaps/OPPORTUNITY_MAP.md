# Step 9 — Negative Space and Opportunity Map

Not solutions. Regions where existing approaches structurally fail.

---

## G1 — The decision is made before the system starts observing (procurement)

Every found system acts **at the gate**: the token controls entry, the analyser grades on arrival.
The farmer's decisive, irreversible act — loading the truck and leaving the farm — happens hours
earlier, with no support at all. By the time any deployed system has an opinion, the cost is sunk.

- Shared assumption being violated: *the procurement centre is the place where the problem lives.*
- Who is underserved: the farmer at the moment of loading.
- What is ignored: net realisation after transport, waiting, and rejection risk.
- Inverting it: **support the go/no-go decision, not the queue.**

## G2 — Admission control without a service model

Tokens are issued against a date. Service capacity that day is set by gunny bags, weighbridges,
lifting trucks and space. Nothing connects the two, so the system issues promises the facility
cannot honour, and the failure lands on the farmer as an unpaid wait.

- Assumption violated: *demand-side scheduling is sufficient.*
- Adjacent-field mechanism absent here: **backpressure** — the server advertises capacity and
  refuses admission beyond it.
- Constraint to exploit rather than fight: the centre *already knows* its bag and truck position
  each morning. That information exists and is not published.

## G3 — Quality is measurable, but not by the person who bears the risk

Moisture decides acceptance; moisture is not visible; the farmer has no instrument; the state's
only lever is a broadcast warning. Meanwhile CV grading — which cannot see moisture at all — is the
saturated, well-funded answer.

- Underserved user: the farmer pre-loading.
- Information gap: farm-level, criterion-aligned quality knowledge.
- **Caution:** cheap moisture meters exist. The gap is distribution, calibration and *trust in the
  reading as predictive of the centre's verdict* — not sensing physics. A candidate must not
  pretend to invent a sensor.

## G4 — The witness of the event has no standing in the record

EPR certificates are issued by the party that benefits from inflating them. The informal collector,
who physically handles the material, is absent from the policy entirely. Fraud at the
600,000-certificate scale is the predictable output of that architecture, not a bug in it.

- Assumption violated: *the recycler's declaration is the best available evidence.*
- Incentive conflict: issuer and beneficiary are the same party.
- Adjacent mechanism absent here: **counter-interested attestation** (the auditing principle).
- Trap to avoid: adding a ledger under the same unverified declaration (blacklist item 3).

## G5 — Formalisation is designed for the institution and sold as help to the worker

Collectors already recover ~33% of recyclables, mistrust formal actors, and mostly lack smartphones.
Visibility erodes informal margin. The statement's premise inverts the actual beneficiary.

- Underserved: the collector's *interest*, as distinct from the collector's *data*.
- Design constraint that is usually ignored: the collector must be **better off transaction by
  transaction**, in cash, immediately — not promised eventual formal-sector benefits.

## G6 — Every safety mechanism sits downstream of a 7% gate

Panic buttons need the victim to act; CCTV needs a complaint to trigger retrieval; safety maps need
reports to exist. All three are multiplied by a ~7% reporting rate driven by distrust and stigma.

- Assumption violated: *the victim will initiate.*
- Neglected workflow: what happens between an incident and any institutional response — currently,
  in ~93% of cases, nothing.
- Adjacent mechanism absent here: **deferred, corroboration-gated disclosure** — record privately,
  release only when independently corroborated, so no individual bears sole exposure.
- Hard constraint: this must not become passenger surveillance. A design that watches everyone to
  protect someone has traded one harm for another and will be rejected on those grounds.

## G7 — Force is demanded from a modality that cannot measure it

PS-028 asks a camera to verify *adequate pressure*. Industry solves this by instrumenting the tool.
The statement implicitly asks for something the standard answer does not provide.

- Constraint to exploit: **the windshield and the sealant bead deform under correct pressure.** The
  effect of force may be observable even though force is not. This is a proxy, and must be labelled
  a proxy.
- Neglected requirement: *evidence that the process was followed*, which is separable from, and
  easier than, force measurement — and may be the more valuable half commercially.

---

## Opportunity map summary

| ID | Region | Strength of evidence | Differentiation potential | Risk |
|---|---|---|---|---|
| G1 | pre-commitment decision support | strong | high | trust/adoption |
| G2 | capacity-aware admission control | strong | high | institutional access |
| G3 | farmer-side criterion-aligned quality | strong | medium (sensor exists) | distribution |
| G4 | counter-interested attestation for EPR | very strong | high | market willingness |
| G5 | collector-benefit-first design | strong | medium | device access |
| G6 | non-victim-initiated safety | strong | high | ethics, verification |
| G7 | vision-observable force proxy | medium | medium-high | physics may not cooperate |
