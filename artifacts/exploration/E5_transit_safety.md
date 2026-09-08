# E5: Human-Machine Boundary — Severing the 7% Gate

Strategy: mechanisms that do NOT require the victim to self-identify or act during the incident.
Global constraints applied to every candidate: (1) no passenger surveillance, (2) no uncontestable false-accusation risk, (3) no reporter de-anonymisation, (4) no assumption of police responsiveness.
Blacklist respected: no classifiers, no scream/gesture detection, no CCTV behaviour recognition.

---

## C1. Corroboration-Gated Disclosure Pool
- Target user: women who experience harassment but won't file a formal complaint.
- Ground pain: 7% report because individual disclosure = individual exposure (retaliation, stigma, disbelief).
- Problem: no way to register "this happened" without becoming a named complainant.
- Hypothesis: if disclosure carries zero individual exposure until corroborated, participation rises far above 7%.
- Core mechanism: victim submits a private, timestamped, route/coach-tagged incident record (free text + metadata) to a held pool. Record stays inert (never surfaced, never actionable) unless a second independent record matches on route+time-window+coach, at which point BOTH become visible only to a designated escalation body (not police by default) as a corroborated pattern, still without exposing either identity to each other.
- Workflow change: victim's action shifts from "confront/report" to "deposit," a much lower-friction act with no immediate consequence.
- Inputs: free-text description, route, approximate time, coach/vehicle ID, optional descriptor of perpetrator (non-biometric).
- Outputs: aggregated, corroborated pattern alerts to transit operator/oversight body; individual reporters never named to each other or the public.
- Assumptions: enough women will deposit even without immediate payoff; matching logic can work on coarse metadata without needing exact identity.
- Data requirements: none about identity beyond what victim volunteers; no camera/sensor feed.
- Technical requirements: encrypted submission form, matching/dedup logic on coarse fields, access-controlled review layer, retention/expiry policy.
- Difficulty: medium — mostly workflow/policy engineering, not ML.
- Failure modes: too few deposits to ever corroborate (cold-start); matching false positives (different incidents, same coach/time) muddying signal; the "escalation body" itself may be non-responsive (see constraint 4).
- Adoption risks: needs institutional buy-in for who receives corroborated alerts and what they must do; without a defined obligation, output goes nowhere.
- Prototype feasibility: high — a form + matching backend can be mocked in a hackathon.
- Demoability: strong — show two independent submissions merging into one flagged pattern live.
- Ethical constraints:
  1. No surveillance — only self-reported text/metadata, no passive monitoring of anyone.
  2. No uncontestable accusation — output is a pattern flag to an oversight body, not a named accusation; any downstream action against a person requires separate due process outside this system's scope.
  3. No de-anonymisation — reporters never see each other's identity; only the corroborating body sees the match, and only pattern data, not personal identity, unless the reporter opts to escalate further.
  4. No police-responsiveness assumption — the escalation target can be the transit operator's internal safety unit, contractually obligated by an SLA, not the police.
- Difference from panic buttons/CCTV/maps: doesn't require real-time action, doesn't watch everyone, doesn't rely on crime-report base rates for "safety" scoring — it builds its own corroborated dataset independent of police statistics.

---

## C2. Operator-Accountability Duty Shift (Ambient Ridership Signal, No Identity)
- Target user: transit operators (metro/bus corp), indirectly all women riders.
- Ground pain: operators have no incentive to act because there's no visible signal — the 93% who don't report leave zero institutional trace.
- Problem: institutions optimize for what's measured; unreported harassment is invisible to management dashboards.
- Hypothesis: if the burden of noticing shifts from victim-initiated complaints to an operator-side passive signal that costs the victim nothing, operators will get pressure to act even without individual reports.
- Core mechanism: an anonymous, opt-in "discomfort ping" — a single low-friction button (not an SOS, not real-time-urgent) riders can press any time in the following 24 hours after any commute, tagged only to route+coach+time-band, aggregated into a public/operator dashboard of "discomfort density" per route/hour. No incident detail required — literally one tap, after the fact, whenever convenient.
- Workflow change: institution must publish and respond to aggregate discomfort density, shifting "who must act" from victim to operator.
- Inputs: single anonymous tap + route/time-band (auto or manual selection), no free text required (optional).
- Outputs: public heatmap of discomfort density by route/hour, updated periodically; operator SLA to respond to high-density segments (extra staffing, women's coach adjustment, lighting).
- Assumptions: aggregate discomfort correlates with actual risk even without formal incident detail; operators can be made contractually/publicly accountable to respond.
- Data requirements: none personal; just tap counts by route/time bucket.
- Technical requirements: simple app/SMS/USSD tap endpoint, aggregation dashboard, minimum-count thresholding to prevent single-user spam skewing results.
- Difficulty: low-medium.
- Failure modes: could be gamed (spam taps); density without detail may not tell operator WHAT to fix; still exposed to the same under-reporting bias if the tap itself has friction — though far less than a formal complaint.
- Adoption risks: operator may treat dashboard as PR rather than actionable; needs external audit/regulatory teeth to bite.
- Prototype feasibility: very high — literally a button and a counter.
- Demoability: strong — live heatmap responding to simulated taps.
- Ethical constraints:
  1. No surveillance — opt-in, active, momentary tap; no passive monitoring; no tracking of who tapped beyond a coarse route/time bucket, and even that isn't linked to a rider profile.
  2. No uncontestable accusation — the entire mechanism produces zero individual accusations, only aggregate density; no person is ever named.
  3. No de-anonymisation — by design there's no identity attached to a tap in the first place.
  4. No police-responsiveness assumption — accountability target is the transit operator, not police; response is operational (staffing/coach policy), not law enforcement.
- Difference from panic buttons/CCTV/maps: not urgent/real-time, not evidentiary, and explicitly NOT crime-report-based — it captures discomfort at the moment of choice to disclose it, decoupled from the decision to file a complaint.

---

## C3. Deferred, Self-Paced Disclosure Window
- Target user: victims currently deterred by the immediacy/publicness of on-the-spot reporting.
- Ground pain: existing SOS mechanisms need action DURING the incident, when fear, freeze response, and social visibility (other passengers watching) are highest.
- Problem: even willing reporters often can't act in the moment — freeze response is well documented in harassment/assault literature.
- Hypothesis: separating "the moment something happened" from "the moment you're ready to talk about it" recovers reports lost to freeze-response and public-visibility deterrence.
- Core mechanism: a private disclosure channel with no time pressure — victim can submit details (as much or as little as they choose) hours, days, or weeks later, referencing a ticket/travel-card timestamp or rough route/time, rather than needing to act in the compartment. Submission is stored privately; victim controls if/when it's escalated (kept private / added to corroboration pool per C1 / sent to operator).
- Workflow change: reporting decouples from the incident's real-time window entirely.
- Inputs: free-text narrative, approximate journey metadata, victim-chosen escalation level.
- Outputs: private record under victim's control; optional feed into C1's corroboration pool.
- Assumptions: victims who wouldn't act in-moment will act later if genuinely no pressure exists; ticketing/travel-card systems can supply enough metadata to make late reports useful.
- Data requirements: victim-supplied narrative + optional travel-card/ticket lookup (already collected by operator for fare purposes, not new surveillance).
- Technical requirements: secure private-notes-style app, optional integration with existing smart-card trip history (read-only, user-initiated).
- Difficulty: low.
- Failure modes: purely private records with no escalation path help the individual (as a record) but do nothing systemically unless the victim opts to escalate; risk of becoming a diary with no teeth.
- Adoption risks: minimal risk since it's opt-in and private by default; main risk is under-selling its value if there's no visible downstream use.
- Prototype feasibility: very high — a private form is trivial to build.
- Demoability: medium — showing "private note now, escalate later" flow is less visually dramatic than a live dashboard.
- Ethical constraints:
  1. No surveillance — entirely victim-initiated, whenever they choose; nothing passive.
  2. No uncontestable accusation — nothing leaves the victim's control unless she explicitly escalates, at which point it follows the same due-process path as any complaint.
  3. No de-anonymisation — private by default; escalation choices are opt-in and victim-controlled.
  4. No police-responsiveness assumption — victim can choose non-police escalation paths (operator, corroboration pool, NGO helpline).
- Difference from panic buttons/CCTV/maps: explicitly removes the time-pressure/action-during-incident requirement that panic buttons impose, and doesn't rely on footage retrieval gated by a same-day complaint.

---

## C4. Bystander-Initiated Ambient Concern Log (No Victim Action Required At All)
- Target user: co-passengers who witness something but aren't the target.
- Ground pain: victims frozen or unwilling to act; but bystanders often notice and could act if given a low-stakes channel — currently they have almost none (intervening directly is risky/awkward; calling police over "seemed off" feels disproportionate).
- Problem: the entire existing mechanism stack assumes the VICTIM is the sole possible reporter, wasting the bystander channel entirely.
- Hypothesis: bystanders, who are not the target and thus face different (usually lower) stigma/retaliation risk, can supply a corroborating or even primary signal without needing the victim to act at all.
- Core mechanism: a same-code-as-C1 deposit channel, open to any passenger (bystander or victim) to log a coarse observation (route/coach/time + brief description), feeding the same corroboration pool. No obligation to intervene, no naming, no urgency.
- Workflow change: reporting responsibility broadens beyond the victim to anyone present, diluting individual exposure further.
- Inputs: same as C1 but submitter can be anyone.
- Outputs: same corroboration pool as C1, now with more potential submitters per incident, raising corroboration likelihood.
- Assumptions: bystanders are willing to submit even where victims are not; bystander accounts are accurate enough to be useful even if partial.
- Data requirements: none beyond submitted text/metadata.
- Technical requirements: same backend as C1, extended access (any rider, not just self-identified victims).
- Difficulty: low incremental (extends C1).
- Failure modes: bystander accounts could be less accurate (didn't experience it directly) or, rarely, malicious; needs same non-accusatory gating as C1 to avoid constraint-2 violation.
- Adoption risks: bystanders may still not bother without a clear "why does this matter" hook; needs light UX nudge to make it feel meaningful, not intrusive.
- Prototype feasibility: high — same infra as C1, just widened submitter pool.
- Demoability: strong — pairs naturally with C1's live-merge demo.
- Ethical constraints:
  1. No surveillance — still opt-in, active submission only, no passive sensing of bystanders or anyone else.
  2. No uncontestable accusation — same corroboration gating as C1; a single bystander account alone does not trigger any accusation, only contributes to a pattern requiring independent corroboration.
  3. No de-anonymisation — bystander identity, like victim identity, stays behind the same access-controlled layer.
  4. No police-responsiveness assumption — same operator/oversight-body routing as C1, not police-dependent.
- Difference from panic buttons/CCTV/maps: this is the one direction fundamentally unavailable to panic buttons and CCTV-retrieval models, since both are structurally victim/incident-gated; also independent of crime-report base rates, since it generates fresh non-police data.

---

## Stopping condition reached

Beyond C1–C4, the space narrows fast. Two further directions were considered and discarded rather than padded in to hit a quota:

- **Discarded: automatic anomaly flagging from ridership/ticketing patterns (e.g., a woman who normally rides a certain route stops abruptly).** This requires tracking individuals' travel patterns over time to notice deviation — that IS passenger surveillance (violates constraint 1) even without a camera; discarded.
- **Discarded: "trust score" or reputation flagging of repeat-flagged individuals surfaced directly to other riders.** Even if built on corroborated data, surfacing a named or quasi-named "risk" flag to third parties who cannot contest it is an uncontestable-accusation mechanism (violates constraint 2); discarded. A corroborated pattern can go to an accountable oversight body (as in C1/C4) but must not become a public or peer-visible label on a person.

Four candidates (C1–C4) is the honest yield for this region — they are variations on one underlying mechanism (deferred/pooled/corroboration-gated disclosure, opened to bystanders, decoupled from real-time action) rather than four independent architectures, because the ethical constraints (especially "no uncontestable accusation") rule out most of the more powerful-sounding pattern-detection ideas that would otherwise fill out a longer list.

## Hardest constraint to satisfy
Constraint 2 (no uncontestable false-accusation risk) was the binding one throughout. Every candidate that tried to move beyond "aggregate pattern to an accountable institution" toward anything resembling a flag on a specific person, visible to peers or usable without due process, had to be discarded or heavily gated (hence the corroboration-and-oversight-body design repeated across C1/C4 rather than direct publication). Constraint 4 (no assumption of police responsiveness) was handled by deliberately routing all outputs to the transit operator/an oversight body under an SLA rather than police, which the evidence does not support as responsive.
