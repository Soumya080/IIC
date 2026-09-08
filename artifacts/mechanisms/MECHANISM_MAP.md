# Step 7 — Mechanism Extraction

Solutions are collapsed to their underlying mechanism. Differences in UI, model architecture,
framework, cloud provider, or whether the front end is a dashboard or a chatbot are **not**
mechanism differences and are ignored here.

## The mechanism vocabulary found in this landscape

| M# | Mechanism | What it fundamentally does | Instances |
|---|---|---|---|
| M1 | **Perception-and-classify** | convert a physical sample into a category label | S2 grain analysers, S3 Agrograde, S13 vision assembly, most of the corpus's "AI-based detection" statements |
| M2 | **Calendar admission control** | ration entry to a facility by issuing dated permits | S1 e-tokens, e-Uparjan |
| M3 | **Ledger / certificate issuance** | record a claimed event in a durable registry | S7 CPCB portal, S8 QR-geotag, PS-003, PS-006 |
| M4 | **Directory / marketplace matching** | make two parties visible to each other | S6 Kabadiwalla Connect, PS-008 |
| M5 | **Victim-initiated alerting** | let a person in distress signal outward | S9 panic buttons, PS-021 |
| M6 | **Passive recording for retrospective retrieval** | capture continuously, retrieve on request | S10 CCTV |
| M7 | **Aggregate-report cost surface** | turn reports into a spatial score used for routing | S11 safety maps, PS-022, PS-027 |
| M8 | **Physical interlock / instrumented tool** | make the incorrect action impossible or self-reporting | S12 poka-yoke torque tools |
| M9 | **Immediate bilateral settlement** | appraise, weigh, pay, done | S4 private trader |

## Structural observations

**Observation 1 — M1 dominates the corpus overwhelmingly.** Roughly 20 of 35 statements reduce to
"apply perception-and-classify to domain X." M1 is the most saturated mechanism in existence and
has the lowest marginal differentiation available.

**Observation 2 — the corpus contains almost no M8.** Only PS-028 gestures at making an incorrect
action self-reporting. Mechanisms that change what is *physically possible* rather than what is
*known* are nearly absent from the corpus and from the candidate landscape.

**Observation 3 — M9 is the incumbent that every agri solution actually competes with**, and it
appears in no problem statement. The private trader wins on latency and certainty, not accuracy.
Solutions built on M1 compete on accuracy against an incumbent that does not sell accuracy.

**Observation 4 — M2 and M3 share a hidden defect: both issue a claim without binding it to the
physical reality it asserts.**
- M2 issues a slot without committing service capacity → tokens for days the centre cannot serve.
- M3 issues a certificate without witnessing collection → 600,000 fake certificates.

> These are the *same* failure at different sites: **an unbacked promise**. This is the most
> important structural finding of the mechanism analysis, and it is what the exploration strategies
> are pointed at.

**Observation 5 — M5, M6 and M7 all fail on the same gate for PS-023.** Each requires either the
victim to act (M5), a complaint to trigger retrieval (M6), or reports to exist in the first place
(M7). All three are downstream of a ~7% reporting rate. A mechanism that does not depend on
victim-initiated reporting is genuinely absent from the landscape.

## Mechanisms present in adjacent fields but absent here

Recorded as raw material for Step 10, not as recommendations:

- **Commitment / escrow mechanisms** — a promise backed by a bond the promiser forfeits.
- **Attestation by a disinterested or counter-interested witness** — used in auditing and in
  double-entry bookkeeping; absent from EPR.
- **Admission control with backpressure** — standard in queueing and network systems: the server
  advertises its own capacity and refuses admission beyond it, rather than the client scheduling
  blindly.
- **Deferred / pooled disclosure** — allegations held in escrow and released only on corroboration.
  Used in some workplace-misconduct reporting systems. Absent from transit safety here.
- **Pre-commitment testing** — moving a pass/fail test to *before* the irreversible cost is
  incurred. Standard in manufacturing incoming inspection; absent from farmer-side procurement.
