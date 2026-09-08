# E1 — Assumption Inversion: Move the Decision Upstream

Strategy: intervene at the farmer's GO/DON'T-GO moment before loading the truck — hours before any procurement-centre system (e-token, AI grain analyser, CV grading) has anything to say. Core object: net realisation under uncertainty, not produce quality.

---

## C1. Net-Realisation Estimator (voice/IVR + SMS)

- Target user: smallholder/marginal farmer deciding tonight whether to load tomorrow's truck for the MSP centre vs. sell to the local trader.
- Ground pain: farmer compares only headline MSP price vs. trader's on-the-spot price; ignores transport, hired labour, food-during-wait, and rejection risk because those costs are diffuse and paid later, while the trader's price is one number now.
- Problem: decision is made on incomplete, single-number comparison; MSP "wins" on paper but loses in practice.
- Hypothesis: if farmer sees an expected net-realisation range (MSP path vs trader path) computed from local wait-time and rejection data, some fraction will choose correctly, or negotiate the trader up, or delay loading a day.
- Core mechanism: a simple expected-value calculator — Net(MSP) = MSP price − transport − labour-days×wage − food×wait-days − P(rejection)×reload cost, compared against Net(trader) = trader price (immediate, certain). Feed with crowd-reported wait times and rejection rates from the last N farmers at that specific centre (self-reported via missed-call/SMS after their own visit).
- Workflow change: none imposed — purely informational, consulted before loading, via a phone call (IVR, works on any handset) or SMS to a fixed number naming crop + centre.
- Inputs: crop, quantity, home village/distance to centre, today's date; centre-level running average of wait days and rejection % (crowdsourced), local wage rate, transport cost/km (can default from state schedules).
- Outputs: two numbers — "expected net if you go to [centre]" vs "expected net if you sell to trader at ₹X" — plus the confidence band (data thinness warning if centre has <5 recent reports).
- Assumptions: farmers will self-report wait/rejection outcomes without incentive (weak); trader price is knowable/quotable by farmer without app; farmers trust a government-adjacent phone number.
- Data requirements: crowdsourced wait-time and rejection-rate logs per centre, updated continuously; no historical dataset exists today — must be bootstrapped from zero, which is the single biggest risk.
- Technical requirements: IVR/SMS gateway, a small rules-based (not ML) calculator, lightweight per-centre aggregation store; no smartphone or app store dependency.
- Difficulty: low-medium technically; the hard part is the cold-start data problem, not the software.
- Failure modes: empty/stale data at low-traffic centres gives false confidence either way; farmers distrust a number that contradicts what the arhtiya tells them; if the estimate is wrong even once publicly, trust collapses fast in a small community.
- Adoption risk: arhtiya has strong incentive to suppress this — he profits from farmers staying in the MSP+credit relationship regardless of net outcome; may actively spread distrust.
- Prototype feasibility: high — can build with a static average table per centre and a phone tree in days.
- Demoability: high, easy to show as a "before/after" comparison on stage.
- Differs from prior art: prior art (e-token, AI grain analysers, Agrograde) all activate at or after arrival; the farmer app in Agrograde gives a quality overview post-harvest for negotiation, not a pre-loading go/no-go comparison of two full channels. This is upstream of the whole procurement pipeline and never touches produce quality assessment.

---

## C2. Community Wait-Time Relay (peer-to-peer, no infrastructure)

- Target user: farmers in the same village/cluster who send trucks to the same centre on different days.
- Ground pain: no one at home knows today's actual queue length at the centre; only the guy who is there right now knows, and he has no channel back except word of mouth days later.
- Problem: information about current queue state exists only at the point of the sunk cost (farmer already there, already waited).
- Hypothesis: if the farmer already at the centre can cheaply broadcast "queue is N trucks deep, moisture rejection is happening today" to his village before others load their trucks, next-day arrivals can delay or reroute.
- Core mechanism: a missed-call-triggered broadcast — farmer at centre gives a 3-button IVR input (queue length bucket / rejection happening yes-no / days-waiting-so-far), system pushes as voice blast to a village WhatsApp/SMS group or local FM-style community bulletin.
- Workflow change: adds one voluntary act by farmers already at the centre (2 minutes); no change to procurement process itself.
- Inputs: real-time self-report from farmers physically present.
- Outputs: near-real-time (same-day) centre status broadcast to a village group, distinct from the aggregated historical averages in C1 (this is "today," C1 is "typically").
- Assumptions: farmers at the centre are willing/able to spend 2 minutes reporting; village groups exist and are checked before next day's loading decision.
- Data requirements: none pre-existing; purely live peer input, no historical store needed (though could feed C1's aggregate over time).
- Technical requirements: IVR + broadcast list (WhatsApp Business API or plain SMS fan-out); trivial to build.
- Difficulty: low.
- Failure modes: reporting fatigue/no one bothers after first few days; strategic misreporting (a farmer wanting to discourage others from taking his queue slot could lie); news travels too late for farmers who load before dawn.
- Adoption risk: low cost to try, but needs a local champion or panchayat buy-in to seed the first broadcast list.
- Prototype feasibility: very high, essentially a phone-tree app.
- Demoability: high — simple live demo showing broadcast latency.
- Differs from prior art: e-token systems show official slot status only to those already checking the app AFTER deciding to go; this is unsolicited, peer-sourced, same-day intelligence pushed before the decision, requiring no app and no interaction with the procurement centre's own systems.

---

## C3. Pre-Commit Sale Option ("lock a fair price without moving the grain")

- Target user: farmer with produce still at home/farm, undecided between MSP centre and trader.
- Ground pain: farmer must physically move produce to discover its fate (price + accept/reject) — the transport and labour cost is spent BEFORE any pricing certainty exists.
- Problem: information about produce grade is entangled with physical delivery; there's no way to get a provisional grade/price without incurring transport risk first.
- Hypothesis: if a farmer can get a low-cost provisional assessment of moisture/quality at the farm (not at the centre), he can decide which channel to commit to before spending transport cost, cutting the cases where he transports and then gets rejected.
- Core mechanism: this is essentially validating cheap handheld moisture meters (already commercial) as a decision input feeding into the C1 calculator — NOT a new sensor. The mechanism is procedural: pair meter reading + C1's expected-rejection-probability model to give a "transport or don't" recommendation before the truck is loaded.
- Workflow change: farmer takes a moisture reading at home/threshing floor, inputs it into the same IVR system as C1, gets a rejection-probability-adjusted net-realisation figure.
- Inputs: self-measured moisture (from a meter the farmer owns or borrows from a cooperative), crop type, centre-level rejection threshold data.
- Outputs: "at 15% moisture, on-arrival rejection probability ≈ X%, adjust net-realisation accordingly" — a probability output, not a pass/fail.
- Assumptions: farmers already own or can borrow a meter (global rules note these are commercially available — but ownership among smallholders is low; a cooperative-lending model would be needed).
- Data requirements: historical rejection curves by moisture % per centre/crop — does not exist publicly; would need extraction from mandi records or extrapolation from published thresholds (14%/17%).
- Technical requirements: none beyond the meter (existing hardware) + integration into C1's calculator logic.
- Difficulty: medium — mostly a data/partnership problem (getting mandi rejection records) not a hardware problem.
- Failure modes: farmers distrust self-measurement vs. official gate measurement (different meters, different readings — legitimacy gap identical to the "transparent grading" demand in the prompt); meter access remains the bottleneck for the poorest farmers who most need this.
- Adoption risk: medium; overlaps with existing handheld-meter market, so this candidate's real contribution is the decision layer around the reading, not the reading itself — must be careful not to just be "buy a moisture meter," which is prior art.
- Prototype feasibility: medium — can demo the probability calculator with synthetic/estimated rejection curves.
- Demoability: medium — needs a believable rejection curve to be convincing, which requires some real mandi data.
- Differs from prior art: distinct from Gujarat's AI grain analysers and Agrograde (both operate ON PRODUCE AT THE GATE/post-harvest); this operates on a self-taken reading at the farm, feeding a load/don't-load decision, never touching the actual grading event.

---

## C4. Arhtiya-Bypass Timing Advisory

- Target user: farmer whose sale sequencing is effectively controlled by his commission agent/informal lender.
- Ground pain: the "decision" is not actually free — the arhtiya, who is owed money and controls mandi access, decides when and where the farmer's produce goes, often against the farmer's own net-realisation interest, because the arhtiya has separate incentives (commission, loan recovery timing).
- Problem: the real decision-maker upstream is not the farmer at all; any tool aimed at "the farmer's" decision may be moot if the arhtiya overrides it.
- Hypothesis: making net-realisation numbers visible to farmers in a form shareable/citable (e.g., an SMS the farmer can literally show the arhtiya) creates social leverage to contest bad sequencing decisions, even without changing the underlying power structure.
- Core mechanism: same net-realisation output as C1, but packaged as a shareable printable/showable slip with a timestamp and source attribution, designed to be brandished as a semi-official reference point in a negotiation with the arhtiya, not just consumed privately.
- Workflow change: adds a "citation" step to the farmer-arhtiya negotiation that didn't exist before — a third-party number the arhtiya can't easily wave away as opinion.
- Inputs: same as C1.
- Outputs: a physical/showable artifact (printed slip or a phone-screen message with an official-looking source and timestamp), not just a private number.
- Assumptions: this is the weakest link — an arhtiya holding both debt leverage and gate access is not obligated to honor a farmer's numbers, and can simply refuse. This candidate's mechanism only works if it shifts a norm/social contract, not a hard rule — high uncertainty on real-world effect.
- Data requirements: same as C1.
- Technical requirements: same as C1, plus a printable output (could piggyback on existing kiosk/CSC printers in villages).
- Difficulty: low technically, but the effect is a social intervention, hardest to validate.
- Failure modes: arhtiya retaliates (delays loan, worse terms next season); farmer has no real alternative even with better information, so nothing changes materially — information alone may not shift power.
- Adoption risk: highest of all candidates here — touches an entrenched credit relationship.
- Prototype feasibility: high for the artifact itself, but demoing "effect on negotiation" is not really prototypable, only arguable.
- Demoability: low — can show the slip, cannot show it changing behavior.
- Differs from prior art: none of the listed prior art touches the arhtiya relationship at all; all assume the farmer is a free agent making his own procurement decision, which the problem context says is frequently false. Flagged as the most speculative candidate in this set.

---

## C5. Multi-Centre Routing Advisory

- Target user: farmer within reach of more than one procurement centre (common in denser agricultural belts).
- Ground pain: farmers default to the nearest/customary centre regardless of its current queue or rejection pattern, because comparing centres requires information they don't have.
- Problem: decision is under-optimized across space, not just across channel (MSP vs trader) — nearest centre is not necessarily best net-realisation centre.
- Hypothesis: if wait-time/rejection data (per C1/C2) is available for multiple centres within feasible driving distance, some farmers will choose a farther-but-faster centre and come out ahead net of extra transport.
- Core mechanism: extends C1's per-centre net-realisation calculator to compare 2-3 centres within a radius, factoring incremental transport cost against each centre's differential wait/rejection profile.
- Workflow change: farmer must be willing to consider a non-default centre; otherwise none — same phone-based lookup as C1, just multi-output.
- Inputs: farmer's location, list of centres within reasonable distance, per-centre live/historical data.
- Outputs: ranked list of centres by expected net realisation.
- Assumptions: sufficient centre density near the farmer to make comparison meaningful (only applies in some regions, e.g. parts of Punjab/Haryana; useless in sparse areas).
- Data requirements: same as C1 but multiplied across centres — harder cold-start problem.
- Technical requirements: same stack as C1 plus simple ranking logic.
- Difficulty: low-medium, mostly a data-coverage scaling problem.
- Failure modes: recommending a farther centre that then also gets flooded once many farmers redirect there (self-defeating equilibrium — an advisory that changes the very queues it's predicting); stale data misleads.
- Adoption risk: medium; requires trust in an unfamiliar centre, breaks habitual/relationship ties (may have his usual arhtiya only at one centre).
- Prototype feasibility: medium — needs a real multi-centre pilot area to be credible.
- Demoability: medium.
- Differs from prior art: existing tools (e-token/e-pass) manage slots WITHIN one already-chosen centre; this decides WHICH centre before travel, a decision layer that doesn't exist in any listed system.

---

## Honest region assessment

This region (upstream decision support) is real but structurally thin as a technology problem, and I want to say that plainly rather than pad the list:

- The strongest, most defensible candidate is C1 (net-realisation estimator) — it's a genuinely different mechanism (decision support over a multi-cost comparison, not grading or slot management) and cleanly avoids all listed prior art and all global-rule violations (no classifier, no blockchain).
- C2 (peer relay) is a legitimate, cheap complement to C1, addressing the cold-start data problem C1 has by generating live rather than historical signal. Together C1+C2 form essentially one system (estimator + its own data feed) — flagging this so it isn't miscounted as two independent ideas at the portfolio level.
- C3 is honest but weak as a *novel* candidate: it risks reducing to "use a moisture meter," which is explicitly prior art. Its only real contribution is the probability-based decision layer, which is a thin, incremental addition, not a new mechanism. Include with that caveat.
- C4 and C5 are the two "thin ice" candidates. C4 confronts the single most powerful force in this system (the arhtiya's debt leverage) but a phone number and a slip of paper is not a proportionate mechanism to counter debt bondage — I'm including it because the strategy demands facing upstream causes, but its real-world efficacy is speculative at best, closer to a "note this needs a different intervention type" than a strong product idea. C5 depends heavily on regional centre density and risks a self-defeating dynamic (advice that destroys its own advantage once followed by many).
- Overall: the region yields ONE strong, well-differentiated mechanism (net-realisation decision support, C1/C2 combined) and several weaker variations/extensions (C3, C5) plus one that honestly belongs to a different problem category — social/credit power, not information/technology (C4). I would not inflate this into 8-12 truly distinct mechanisms; 5 candidates is what the region actually supports without resorting to feature-variation filler.

## Strongest 3

1. **C1 — Net-Realisation Estimator**: the core mechanism of this whole region; reframes the decision as an expected-value comparison across full cost stacks, not a price or grading question.
2. **C2 — Community Wait-Time Relay**: cheap, high-feasibility complement that solves C1's cold-start data problem with live peer reporting.
3. **C5 — Multi-Centre Routing Advisory**: the most genuinely novel extension (spatial optimization, not just channel choice), though it only works in centre-dense regions and can undermine itself if adopted at scale.
