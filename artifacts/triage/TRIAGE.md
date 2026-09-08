# Step 2 — Triage of 35 Problem Statements

## Triage method

Because the statements carry no problem-side detail, they cannot be ranked on stated content.
They are ranked instead on the **structural properties of the problem behind the statement**:

| Axis | What it measures |
|---|---|
| GP | Ground pain — is there a real, frequent, costly human experience behind this? |
| SR | Solution-space richness — do several genuinely different mechanisms exist? |
| DP | Differentiation potential — is there room to be non-obvious? |
| PF | Prototype feasibility — buildable and testable by an external team? |
| DA | Data availability — can the team actually get the data, legally and practically? |
| DM | Demoability — can success be *shown*, not asserted? |
| AC | Assumption-challenge opportunity — does the statement contain a questionable premise? |

Scores are coarse (1–5) and deliberately imprecise. They order problems; they do not measure them.

---

## Disqualifying structural filters applied first

Three filters removed problems before scoring, because no amount of good ideation repairs them:

**F1 — Institutional-access gate.** The problem cannot be validated or demonstrated without
access to a system the team cannot obtain (a government integration bus, an issuer's transaction
stream, a national identity trust anchor).
→ Removes **PS-016, PS-018, PS-019, PS-020**.

**F2 — Physical/validation gate.** The core difficulty is hardware chemistry or validated domain
physics, where a software artefact cannot honestly evidence the claim.
→ Removes **PS-013, PS-024**. (PS-026 partially: the full problem is gated, sub-problems are not.)

**F3 — Mechanism pre-specification.** The statement names its own solution ("blockchain",
"IoT nodes"), which forecloses the exploration this process exists to perform. These can still be
answered, but the interesting work would consist of *contradicting the statement*.
→ Demotes **PS-003, PS-006**.

---

## Scores

| ID | Problem | GP | SR | DP | PF | DA | DM | AC | Tier |
|---|---|---|---|---|---|---|---|---|---|
| PS-015 | Farmer procurement waiting / info / payment status | 5 | 5 | 4 | 5 | 3 | 5 | 5 | **A** |
| PS-032 | Kabadiwala Connect — informal collector | 5 | 4 | 5 | 4 | 2 | 4 | 5 | **A** |
| PS-028 | Windshield installation guidance | 3 | 4 | 4 | 5 | 4 | 5 | 4 | **A** |
| PS-004 | Onion grading standardisation | 5 | 4 | 4 | 4 | 3 | 5 | 5 | **A** |
| PS-023 | Women safety in public transport | 5 | 4 | 4 | 3 | 2 | 3 | 5 | **A** |
| PS-027 | Pollution-aware navigation | 4 | 4 | 4 | 5 | 4 | 4 | 4 | B |
| PS-029 | Landslide early warning | 5 | 4 | 3 | 3 | 3 | 3 | 4 | B |
| PS-009 | Vernacular pedagogy / translation | 5 | 4 | 3 | 4 | 3 | 4 | 5 | B |
| PS-031 | Land record digitisation & validation | 5 | 3 | 3 | 3 | 2 | 3 | 5 | B |
| PS-034 | Manufacturing operations assistant | 4 | 4 | 3 | 3 | 2 | 3 | 3 | B |
| PS-025 | Tropical cyclone patterns | 4 | 3 | 2 | 4 | 5 | 3 | 2 | B |
| PS-005 | Livestock disease | 5 | 3 | 3 | 3 | 2 | 3 | 4 | C |
| PS-030 | Urban parcel / cadastral extraction | 4 | 3 | 3 | 3 | 3 | 3 | 3 | C |
| PS-033 | Assembly inspection | 3 | 3 | 2 | 4 | 2 | 4 | 3 | C |
| PS-014 | Patient case-taking | 4 | 3 | 2 | 4 | 2 | 3 | 3 | C |
| PS-001 | Pearl millet disease detection | 4 | 2 | 2 | 3 | 2 | 3 | 4 | C |
| PS-021 | Women safety alert system | 5 | 2 | 1 | 4 | 2 | 2 | 4 | C-sat |
| PS-022 | Safe route recommendation | 4 | 2 | 2 | 4 | 2 | 3 | 4 | C-sat |
| PS-012 | Diabetic retinopathy XAI | 5 | 2 | 1 | 3 | 3 | 3 | 4 | C-sat |
| PS-010 | ASPECTS scoring | 4 | 2 | 1 | 2 | 2 | 3 | 3 | C-sat |
| PS-008 | Academia-industry portal | 3 | 2 | 1 | 5 | 2 | 3 | 3 | C-sat |
| PS-017 | Rural digital payments | 4 | 2 | 1 | 3 | 2 | 3 | 4 | C-sat |
| PS-002 | Virtual plant pathology lab | 2 | 3 | 2 | 4 | 3 | 4 | 3 | C |
| PS-007 | Packaging material recommendation | 2 | 2 | 2 | 4 | 2 | 2 | 4 | C |
| PS-011 | Osteoarthritis risk markers | 3 | 2 | 2 | 3 | 3 | 2 | 4 | C |
| PS-026 | Unstructured-road autonomy | 5 | 4 | 3 | 1 | 2 | 2 | 3 | D (F2) |
| PS-003 | Honey traceability | 3 | 2 | 2 | 3 | 2 | 3 | 5 | D (F3) |
| PS-006 | IoT blockchain nodes | 3 | 2 | 2 | 3 | 2 | 3 | 5 | D (F3) |
| PS-013 | Breath drug detection | 3 | 2 | 3 | 1 | 1 | 1 | 3 | D (F2) |
| PS-024 | Anti-drone simulation | 3 | 3 | 3 | 1 | 1 | 2 | 2 | D (F2) |
| PS-016 | Transaction fraud detection | 4 | 3 | 1 | 2 | 1 | 2 | 2 | D (F1) |
| PS-018 | Govt platform interoperability | 5 | 3 | 2 | 1 | 1 | 1 | 4 | D (F1) |
| PS-019 | Cyber threat detection | 4 | 3 | 1 | 2 | 1 | 2 | 3 | D (F1) |
| PS-020 | Digital identity | 5 | 2 | 1 | 1 | 1 | 2 | 3 | D (F1) |
| PS-035 | Open innovation | — | — | — | — | — | — | — | **wildcard** |

---

## The five categories the process asked for

**1. Highest-opportunity problems** — PS-015, PS-032, PS-004, PS-023, PS-028.

**2. Most interesting underexplored problems** — PS-032 (the statement's own premise is
contestable), PS-023 (the *response* half of transit safety, as opposed to the alerting half),
PS-027 (exposure/dose rather than ambient concentration), PS-031 (validation as a legal rather
than technical act).

**3. Highly saturated problems** — PS-021, PS-022, PS-012, PS-010, PS-008, PS-017, PS-016,
PS-019. These are not bad problems; they are problems where the marginal contribution of another
implementation is close to zero, and where a team's effort converts poorly into differentiation.

**4. Problems with insufficient evidence** — every problem in the corpus, at this stage. The
corpus supplies no user evidence at all. This is why Step 4 is load-bearing.

**5. Problems with strong ground-level pain** — PS-015, PS-032, PS-004, PS-023, PS-029, PS-031,
PS-009, PS-005. Note that strong pain and good opportunity are *not* the same axis: PS-005 and
PS-012 have severe pain but crowded, hard-to-differentiate solution space.

---

## Selected for deep investigation

**Tier A, full depth (Steps 3–9 in full):**

- **PS-015** — Farmer procurement waiting, information and payment status
- **PS-032** — Kabadiwala Connect (informal waste collector)
- **PS-004** — Onion grading standardisation
- **PS-028** — Windshield installation guidance
- **PS-023** — Women's safety in public transport

**Deliberate pairing:** PS-015 and PS-004 occur in the *same physical location and the same
workflow* — a farmer arriving at a procurement centre with a truckload of produce. One statement
describes the queue, the other describes the grade. Investigating them together costs little
extra and may reveal that they are two symptoms of a single underlying mechanism. This is
flagged now and tested in Step 4.

**Tier B, reduced depth (ground reality + landscape only, no independent exploration unless
Tier A underdelivers):** PS-027, PS-029, PS-009, PS-031.

**Adaptive-compute justification for exclusions:** Tier C-sat problems are excluded from
exploration not because they lack pain but because Step 8's convergence analysis can be predicted
with high confidence to find them saturated. Confirming saturation is cheap; exploring inside it
is expensive and low-yield. They are revisited only if Tier A collapses under red-teaming.

**PS-035 (Open Innovation)** is held open deliberately. If ground-reality research shows that the
real pain sits adjacent to a Tier A statement rather than inside it, PS-035 is the slot that
permits pursuing the real problem instead of the written one.
