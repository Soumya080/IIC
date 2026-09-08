# E7 — Cross-Domain Mechanism Transfer

Strategy: take a mechanism that already works in an unrelated domain and transplant its STRUCTURE (not its vocabulary) into one of the five target problems. 8-12 candidates below. Each states source mechanism, target problem, structural difference between domains, and why the transfer survives or breaks.

---

## 1. Server-advertised capacity admission control → Farmer procurement queues (Problem 1)

- **Source mechanism:** TCP flow control / hospital ambulance diversion. The receiver advertises its own real-time processing capacity (receive window / bed availability); the sender is only allowed to send up to that window. Admission is capped by the SERVER's measured state, not the client's schedule.
- **Target problem:** Procurement centres issue e-tokens against a calendar slot count with no live model of gunny bags, weighbridge-hours, or truck lifting capacity — so the "window" advertised to farmers is fictional.
- **Structural difference:** TCP's receive window is a single well-defined integer updated every packet; a procurement centre's capacity is a joint constraint across several consumable/renewable resources (bags, weighbridge time, truck-trips, storage space) that deplete and replenish on a daily cycle, not a packet cycle.
- **Why it survives:** The core structural requirement — the resource-holder emits a number it derives from its own state, and admission is gated by that number rather than an external estimate — transfers cleanly. You just need a daily "effective capacity" computed from the binding constraint (usually gunny bags or weighbridge-hours) each morning, and the token system admits farmers only up to that number, recomputed as the day depletes. This is mechanical, not metaphorical: it is literally admission control with a multi-resource min() instead of a single window.
- **Target user:** Procurement centre supervisor / mandi committee; farmers via e-token app or SMS.
- **Ground pain:** Tokens promise more slots than the centre can physically clear, so farmers wait 2-3 days with grain sitting in the sun and paid transport idle.
- **Core mechanism:** Centre publishes each morning (and updates intraday) a capacity number = min(gunny bags available / avg bags per farmer, remaining weighbridge-hours / avg weighing time, remaining truck-lift slots). Token issuance stops when cumulative admitted farmers hit that number; overflow rolls to next day automatically with priority.
- **Workflow change:** Centre operator logs opening stock of bags/trucks/weighbridge hours each morning into a simple form; system computes and caps token pool; farmers see real remaining slots instead of a fixed calendar.
- **Inputs:** Daily bag stock, weighbridge count/hours, truck arrivals, historical per-farmer service time.
- **Outputs:** A capacity number, live remaining-slot count, automatic next-day rollover queue.
- **Assumptions:** Centre staff will report inputs honestly (or inputs are directly measurable, e.g., bag inventory scan); demand can be deferred a day without spoilage catastrophe.
- **Data requirements:** Historical service-time-per-farmer, current consumable stock — mostly available locally, no new sensors strictly required (manual count works for pilot).
- **Technical requirements:** Simple constraint-calculation backend + SMS/app front end; no ML.
- **Difficulty:** Low-medium — mostly an operations/process change plus lightweight software.
- **Failure modes:** Commission agents capture the recomputed slots same as before if identity isn't verified; staff under-report or over-report capacity to game throughput; centres without any digitization resist daily data entry.
- **Adoption risks:** Requires state procurement agency buy-in; may be seen as reducing agents' discretionary power (political resistance).
- **Prototype feasibility:** High — a spreadsheet/small app for a single mandi is buildable in days.
- **Demoability:** High — show a live "slots remaining today" counter that shrinks accurately and blocks overbooking, vs. current fixed calendar.

---

## 2. Incoming inspection (pre-commitment testing) → Produce rejection after transport (Problem 2)

- **Source mechanism:** Supplier qualification / pre-purchase inspection in manufacturing — the pass/fail test is moved to BEFORE the irreversible cost (shipping, assembly) is incurred, using a cheap proxy test at the source.
- **Target problem:** Grain moisture is graded only on arrival at the procurement centre; the farmer has already paid transport by the time of rejection.
- **Structural difference:** In manufacturing, the inspector and the cost-bearer are typically different (buyer inspects supplier's goods before shipment.) Here the farmer IS the party who would benefit from self-inspection, and there's no counter-interested inspector at the farm gate — so this leans toward simple instrumentation, not two-party inspection.
- **Why it survives:** The mechanical claim is narrow but real: moving the SAME test (moisture measurement) earlier in the timeline, before the irreversible transport cost, changes the decision the farmer can make (dry further / sell locally to trader / choose which lot to transport) even with zero change to the grading criterion itself. This is mechanical only insofar as "test timing relative to sunk cost" is the lever — it does not by itself solve who pays for or trusts the pre-test device.
- **Target user:** Farmer, pre-harvest/pre-transport.
- **Ground pain:** Transport cost is paid before finding out the grain will be rejected; no instrument at hand to self-test.
- **Core mechanism:** Cheap handheld/shared moisture meter available at village level (cooperative-owned, rented, or crowd-shared) used before loading; farmer compares reading against the known threshold and decides whether to dry more, sell to local trader, or transport to the centre.
- **Workflow change:** A pre-loading test step inserted into farmer's routine, likely via a shared device at the village aggregation point rather than individual ownership.
- **Inputs:** Grain sample, calibrated moisture meter.
- **Outputs:** Moisture % reading compared to procurement threshold; a go/no-go transport recommendation.
- **Assumptions:** A meter's reading correlates well enough with the centre's official test (calibration risk); farmers will act on the reading rather than transport anyway hoping for leniency.
- **Data requirements:** None beyond device calibration; this is hardware, not data/ML.
- **Technical requirements:** Off-the-shelf grain moisture meters (cheap, existing tech) + a distribution/access model (co-op ownership, rental kiosk).
- **Difficulty:** Low technically, medium on distribution/access economics — who buys and maintains the meters.
- **Failure modes:** Farmer-side meter and centre's official meter disagree (calibration drift, sampling variance within a lot) causing false confidence; device access bottleneck recreates a queue of its own; doesn't address farmers who have no viable alternative buyer and transport regardless.
- **Adoption risks:** Devices cost money to place at scale; needs someone to own upkeep and calibration.
- **Prototype feasibility:** High — one pilot village with a handful of shared moisture meters and an SMS reporting loop.
- **Demoability:** Medium-high — a before/after transport-then-reject vs test-then-decide comparison is easy to show numerically, though it is more an instrumentation-access fix than a novel mechanism.
- **Note:** This transfer is the WEAKEST of the mechanical ones — the "mechanism" is really just "test earlier," which is closer to common sense than a structural transplant. Flagging as borderline metaphorical: worth keeping but not oversell as the E7 strategy's best output.

---

## 3. Counter-interested attestation → EPR recycling-credit fraud (Problem 3)

- **Source mechanism:** Double-entry bookkeeping / adversarial collateral in auditing — a claim only counts as evidence when a party with OPPOSED financial interest is forced to co-sign it, because that party would rather report truthfully than certify a claim that will cost them later.
- **Target problem:** Registered recyclers self-declare tonnage and the portal accepts it uncontested; the informal waste collectors who physically handle the material have no standing, no incentive to contradict an inflated claim, and no channel to submit one.
- **Structural difference:** In bookkeeping, both co-signing parties are inside the same firm and share downstream liability (so lying is self-harm for both). Here the recycler and the informal collector are different economic actors with NO shared liability — the collector has nothing to lose from the recycler's fraud and no reason to attest at all unless given one.
- **Why it survives (partially) / where it breaks:** It survives structurally IF the system creates an actual opposed interest — e.g., collectors are paid per verified kg and get a share of the credit price only when their attested tonnage matches, so a collector benefits from being the one who caps the recycler's inflated number, and the recycler needs the collector's sign-off to monetize the credit at all. It breaks if collectors are just added as another self-interested party with no consequence for over- or under-stating jointly with the recycler (collusion risk) — counter-interested attestation only works when the two parties' incentives are actually opposed, not merely different. This is a real structural design constraint, not just an add-a-signature step.
- **Target user:** EPR credit issuing authority / registered recycler / informal waste collector who supplies input material.
- **Ground pain:** 600,000+ fake certificates because the sole declarant (recycler) has all the incentive to inflate and no one to contradict them.
- **Core mechanism:** Certificate issuance requires two independently-submitted, matching tonnage figures — one from the recycler, one from the input supplier/collector — where the collector's payment or credit share is contingent on their number being upheld, making it costly for the collector to rubber-stamp the recycler's inflated figure.
- **Workflow change:** Split single-party self-declaration into a two-submission reconciliation step before certificate issuance; discrepancies beyond tolerance trigger hold/investigation instead of automatic approval.
- **Inputs:** Recycler-declared tonnage, collector-declared input tonnage (independently submitted, e.g., via separate SMS/app channel not controlled by the recycler).
- **Outputs:** Matched (issuable) vs. discrepant (held) certificate records.
- **Assumptions:** Collectors can be reached and given a real channel independent of the recycler (recycler often controls collector's payment today, so "independence" needs a structural fix — e.g., payment routed through the issuing authority, not the recycler).
- **Data requirements:** Collector-side reporting capability (even basic — weighed receipts via SMS).
- **Technical requirements:** A simple two-sided submission and reconciliation portal; no ML, no blockchain (per constraint, mass-balance-style reconciliation instead of ledger traceability).
- **Difficulty:** Medium-high — the hard part is engineering genuine incentive opposition, not the software.
- **Failure modes:** Recycler and collector collude if collector's payment still ultimately depends on staying in the recycler's good graces; informal collectors are hard to register/reach at all; reconciliation tolerance thresholds gamed by splitting fraud into many small consistent-looking discrepancies.
- **Adoption risks:** Recyclers who benefit from status quo will lobby against a mechanism that removes their sole authorship of the number; requires regulatory mandate to force two-sided submission.
- **Prototype feasibility:** Medium — needs a real (even if small) collector network to pilot with, not just software.
- **Demoability:** Medium-high — a side-by-side "declared vs counter-attested" tonnage mismatch report is a clean, legible demo artifact.

---

## 4. Mass-balance / reconciliation auditing → EPR recycling-credit fraud (Problem 3), independent of #3

- **Source mechanism:** Customs/metering reconciliation — fraud is detected not from any single document's content but from an INCONSISTENCY between independently produced quantities that should sum/balance (e.g., input electricity metered at a substation vs. output billed to consumers).
- **Target problem:** Same EPR fraud problem, but this variant does not require identifying/onboarding informal collectors — instead it uses external, independently-observable proxies that must be consistent with any claimed recycling volume.
- **Structural difference:** Customs reconciliation compares two quantities measured by two different metering INSTRUMENTS in the same physical flow (a natural conservation law: what enters must equal what leaves, minus known losses). EPR recycling has no equivalent physical bottleneck that is independently metered today — electricity consumption, machine throughput hours, and vehicle trips in/out of a facility are all proxies, not exact conservation.
- **Why it survives: at the level of "flag implausible claims by cross-checking against an independent physical proxy that scales with true throughput," not at the level of "prove fraud."** A recycler claiming 50,000 tonnes processed but drawing electricity consistent with 5,000 tonnes, or logging vehicle-weighbridge entries consistent with 5,000 tonnes, is a real, mechanically sound red flag — this is exactly the customs logic (throughput implies a resource footprint) applied to a new physical process. It breaks if used as sole proof (proxies have wide variance across recycling technologies) — it should function as a triage/audit-prioritization signal, not an automatic accept/reject.
- **Target user:** EPR issuing authority / auditors.
- **Ground pain:** No cheap way to check plausibility of the 600,000+ certificates already issued or catch the next batch before issuance.
- **Core mechanism:** Cross-check each recycler's declared tonnage against independently-sourced proxies with a known plausible throughput-to-proxy ratio: grid electricity billing records, weighbridge logs at the facility gate (if state-mandated separately from the recycler's own portal), or municipal/industrial power authority data — flag claims whose declared tonnage is inconsistent with the proxy by more than a wide tolerance band.
- **Workflow change:** Before/alongside certificate issuance, an automated reconciliation check pulls proxy data (already collected by an unrelated authority — power utility, industrial licensing) and flags outliers for manual audit, rather than accepting the recycler's number outright.
- **Inputs:** Recycler's declared tonnage; independently-held proxy data (electricity bills, weighbridge/vehicle logs, machine capacity ratings).
- **Outputs:** A plausibility score / flag list for audit prioritization.
- **Assumptions:** Proxy data (electricity billing etc.) is itself hard for the recycler to fake or is held by a party with no stake in the recycler's fraud (power utility) — this is the load-bearing assumption.
- **Data requirements:** Access to utility billing records or facility logs — a data-sharing/regulatory access problem, not a technical one.
- **Technical requirements:** Simple ratio/statistics check; no ML required for a first pass (rule-based tolerance bands).
- **Difficulty:** Medium — mechanism is simple, but getting access to independent proxy data across jurisdictions is an institutional lift.
- **Failure modes:** Proxy ratio varies hugely by recycling process/technology, causing high false-positive or false-negative rates; recyclers game the proxy too once they know it's checked (e.g., run machines idle to inflate electricity draw); utility data may be stale or hard to obtain at required granularity.
- **Adoption risks:** Cross-agency data sharing (power utility to environment regulator) is often slow/political.
- **Prototype feasibility:** Medium — feasible as a retrospective audit exercise on the known fraud cases (electricity records probably obtainable for the four firms already caught) to validate the ratio approach before going live.
- **Demoability:** High — a scatter plot of "declared tonnage vs. electricity consumption" showing the four known-fraudulent firms as clear outliers would be a compelling retrospective demo.

---

## 5. Deferred pooled disclosure → Transit harassment reporting (Problem 4)

- **Source mechanism:** Misconduct-reporting escrow systems (e.g., Callisto in the US campus context) — an allegation is held sealed, encrypted, and only released/acted upon once a second independent report names the same perpetrator/location, so no single reporter bears sole exposure or retaliation risk.
- **Target problem:** ~70% prevalence but ~7% reporting; the barrier is fear of stigma/disbelief/retaliation from being the sole named accuser, especially against a repeat offender who is hard to identify from one report alone (crowded transit, no fixed employer relationship).
- **Structural difference:** Campus misconduct escrow matches on a NAMED perpetrator (a person with an identity within a bounded community). Transit harassment perpetrators are usually strangers — victims often cannot name them, only describe circumstances (route, time, physical description, vehicle number). So the matching key must shift from identity to circumstance.
- **Why it survives:** The core structural claim — "hold reports sealed, release/act only on independent corroboration, so the individual reporter is never the sole exposed party" — is identity-agnostic in principle; it just needs a workable matching key. Route/vehicle-ID/time-window/physical-description matching is a weaker but real corroboration key (transit vehicles have IDs; routes are fixed; repeat offenders on a fixed route are a known phenomenon). This transfers mechanically for the specific sub-case of route-based repeat harassment; it is weaker (verging metaphorical) for one-off strangers with no fixed vehicle/route, where no corroboration key exists at all.
- **Target user:** Transit riders (esp. women), transit authority/police liaison.
- **Ground pain:** Only 7% report because reporting means being the sole named accuser against disbelief/stigma with no critical mass.
- **Core mechanism:** Victim submits a sealed report (route, vehicle ID if known, time window, description) via app/SMS; report stays private and un-actioned unless and until a second independent report matches the same vehicle/route/time-pattern within a window, at which point both reporters are notified and the matched, corroborated report is escalated to transit authority/police with the reporters' consent.
- **Workflow change:** Reporting shifts from "report and immediately expose yourself to an investigation with disbelief risk" to "report privately, get escalated only when corroborated" — lowering the perceived cost of the first report.
- **Inputs:** Route/vehicle ID, time, description, incident type — all victim-supplied, no new sensing required.
- **Outputs:** Matched incident escalations to transit authority.
- **Assumptions:** Enough report volume exists for matches to occur in reasonable time (cold-start problem: at low volume, most reports never match and effectively vanish, silently discouraging users further); vehicle/route IDs are knowable to riders.
- **Data requirements:** None beyond the report text itself; matching logic is rule-based (route+time window+optional vehicle ID), not ML.
- **Technical requirements:** Simple sealed-storage backend + matching job; encryption for report privacy.
- **Difficulty:** Medium — the matching-key design and cold-start volume problem are the real engineering challenges, not the storage/escrow itself.
- **Failure modes:** Low volume means most reports never surface (need a minimum critical mass per route to be useful — may not exist on lightly-trafficked routes); false sense of security if reports silently expire unmatched; matching on vague descriptions produces false corroborations.
- **Adoption risks:** Transit authority must agree to act on escalated-but-anonymous-until-matched reports; riders must trust the "sealed until matched" promise (technical implementation, not just policy, must back it).
- **Prototype feasibility:** Medium-high — buildable as an app/SMS pilot on a single dense route; the escrow/matching logic itself is simple to implement.
- **Demoability:** High — a clear before/after narrative ("today: report and be alone; new: report and stay silent until someone else confirms your pattern") demos well, and the matching mechanic is visually simple to show.

---

## 6. Parametric / index-based payout → Produce rejection after transport (Problem 2), alternate framing

- **Source mechanism:** Parametric crop insurance — payout triggers on an objective, independently observable index (rainfall at a weather station) rather than an investigated individual claim, eliminating adjudication disputes.
- **Target problem:** Instead of trying to prevent rejection, compensate the DOWNSIDE risk of transporting a variable-quality lot to a variable-moisture-threshold market using an index-based instrument, so the farmer's decision to transport is de-risked rather than the grading process being changed.
- **Structural difference:** Crop insurance indexes on a fully external variable (rainfall) that no party can manipulate and that has a long clean historical record for pricing. Grain moisture-at-arrival is NOT external — it depends on the farmer's own harvest/drying/storage choices and the transport duration, so it's partially within the insured party's control (classic moral hazard problem for parametric design), unlike rainfall.
- **Why it survives / where it breaks:** This is the weakest of the set — it borders on metaphorical. Rainfall-indexed insurance works BECAUSE the index is exogenous; moisture-at-arrival is endogenous to the farmer's actions, which breaks the core precondition that makes parametric insurance viable (no moral hazard). A genuinely mechanical version would need an exogenous proxy correlated with rejection risk but outside farmer control — e.g., an index on regional humidity/rainfall in the days before harvest (which does affect ambient grain moisture risk broadly) paying out a small buffer to affected farmers in a district regardless of individual outcome. That's a real parametric instrument, but it addresses a much narrower slice (weather-driven moisture risk across a region) than "produce rejection" generally, and it's insurance/compensation, not a fix to the underlying queue/certainty problem the farmer actually faces at the point of decision.
- **Verdict:** Flagging this explicitly as CLOSER TO METAPHORICAL than mechanical for the general rejection problem; keeping it only as a narrow, honestly-scoped regional weather-index buffer product, not a general solution. Not recommending as a strong candidate.

---

## 7. Bonded commitment / forfeitable promise → Farmer procurement queues (Problem 1), alternate to #1

- **Source mechanism:** Performance bonds — a promise is backed by something the promiser forfeits if broken, making the promise self-enforcing without needing after-the-fact investigation.
- **Target problem:** Commission agents capture tokens meant for individual farmers by gaming the allocation system, since there's no cost to claiming a token you don't have grain to fill (or filling it on behalf of someone else).
- **Structural difference:** Classic performance bonds involve a large capital-holding party (contractor) posting a bond they can afford to lose. Farmers and commission agents are not symmetric in capital — a bond sized to deter a commission agent (who profits at scale across many tokens) would be crushing for an individual smallholder farmer if misapplied.
- **Why it survives (narrowly):** The mechanism transfers cleanly to the AGENT-CAPTURE sub-problem specifically, not to farmers generally: require anyone booking a token to forfeit a small refundable deposit, returned automatically on arrival-with-matching-grain-quantity and forfeited on no-show/mismatch. Since commission agents book at volume, even a small per-token deposit accumulates into a real deterrent for bulk gaming while remaining a trivial, refundable cost for a genuine smallholder who shows up. This is structurally sound (the bond size doesn't need to be symmetric across actor types — it needs to be sized to the marginal cost of the behavior you want to deter, which differs for a volume-booking agent vs. a one-token farmer).
- **Target user:** Procurement centre / token booking system.
- **Ground pain:** Commission agents capture tokens at scale because there's zero cost to over-booking or booking under others' names.
- **Core mechanism:** Small refundable deposit (e.g., via mobile money) required per token booking, auto-refunded on verified arrival with grain, forfeited (small amount, but adds up at agent volume) on no-show.
- **Workflow change:** Token booking gains a deposit step; arrival verification triggers automatic refund.
- **Inputs:** Mobile money/UPI linkage, token booking record, arrival confirmation.
- **Outputs:** Refunded/forfeited deposit ledger.
- **Assumptions:** Farmers have access to a mobile payment method (increasingly true in India via UPI) and can absorb a small temporary deposit; deposit size can be tuned to deter bulk agents without excluding poor farmers.
- **Data requirements:** None beyond booking/arrival records.
- **Technical requirements:** UPI/mobile-money integration; no ML.
- **Difficulty:** Low-medium technically; politically sensitive (looks like a fee on farmers even though refundable).
- **Failure modes:** Perceived as an access barrier by the poorest farmers regardless of refundability (cash-flow timing matters); agents route deposits through farmers' own accounts anyway (identity capture persists even with a bond, unless combined with identity verification at arrival); deposit set too low to deter agents at scale, too high excludes farmers.
- **Adoption risks:** Framing risk — "farmers must pay to sell to government" is a bad headline even if refundable; needs careful communication/UX.
- **Prototype feasibility:** Medium — needs real payment rail integration to pilot credibly, not just a mockup.
- **Demoability:** Medium — the deposit/refund flow is easy to show, but the actual deterrence effect on agent behavior can't be demoed, only argued.

---

## Summary table (quick scan)

| # | Source mechanism | Target problem | Mechanical strength |
|---|---|---|---|
| 1 | Admission control (server-advertised capacity) | Procurement queues | Strong |
| 2 | Incoming inspection (pre-commitment test) | Produce rejection | Moderate (borderline commonsense) |
| 3 | Counter-interested attestation | EPR fraud | Strong, conditional on real incentive opposition |
| 4 | Mass-balance reconciliation | EPR fraud | Strong as triage signal, not proof |
| 5 | Deferred pooled disclosure | Transit harassment reporting | Strong for repeat/route cases, weak for one-off strangers |
| 6 | Parametric index payout | Produce rejection | Weak / metaphorical — flagged, not recommended |
| 7 | Bonded commitment (forfeitable deposit) | Procurement queues (agent capture) | Moderate-strong, narrowly scoped to agent capture |

Problem 5 (windshield force verification) is excluded — none of the listed mechanisms (escrow, admission control, attestation, disclosure, inspection timing, reconciliation, parametric index, prediction markets, reverse auction) transfers mechanically to "verify a physical force optically." Any attempted transfer there would require either a physical sensor (out of scope for a mechanism transfer) or would collapse into the excluded classifier/CNN approach. Not forcing a candidate here — stated explicitly per the "say so if weak" rule.

