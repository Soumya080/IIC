# E2 — Constraint exploitation: backpressure and credible commitment

Strategy frame: the deployed e-token systems are **open-loop admission control against a calendar**. A queueing system without backpressure oscillates and dumps its overflow onto the road. The fix region is: (a) make the *server* (the mandi's daily bag/weighbridge/truck/space position) the thing that emits admission rights, and (b) make an admitted slot a promise that costs someone something to break. Non-software mechanisms are first-class here.

Assumption challenged: "scheduling is a demand-side problem." It is a supply-advertisement problem.

Hard rule compliance: candidates C1, C2, C3, C4, C7, C9 work with **zero** state adoption or integration.

---

## C1. Morning Capacity Board (physical, painted, at the gate)

- **Target user:** mandi gate staff / farmer union volunteer; farmers arriving and farmers still at home.
- **Ground pain:** farmers travel 30–60 km on a rumour, then wait 2–3 days because nobody told them the centre had 400 gunny bags for 900 trolleys.
- **Problem:** the centre's morning resource position is known locally and never leaves the office.
- **Hypothesis:** simply *publishing the service rate* collapses arrivals toward it, without any allocation authority at all.
- **Core mechanism:** a fixed board at the gate, filled in each morning by hand: bags on hand, working weighbridges, trucks confirmed for lifting today, free platform area. Bottom line converts to one number — **"trolleys we can actually close today: N"** — plus a running "closed so far: k". Photographed daily and pushed to a WhatsApp broadcast list; the photo, not an app, is the API.
- **Workflow change:** the arrival decision moves from "the calendar said Tuesday" to "the board said 60 and 55 are already in".
- **Inputs:** four integers from the stock register the centre already keeps.
- **Outputs:** one number, daily, publicly, timestamped.
- **Assumptions:** staff will write a number they can't later hide behind; farmers act on it.
- **Data requirements:** none beyond the existing register. No integration.
- **Technical requirements:** paint, marker, a phone camera, a broadcast list.
- **Difficulty:** very low.
- **Failure modes:** the number is inflated to avoid blame; the board is written at 11am after arrivals; nobody photographs it on bad days (missing data is exactly the days that matter).
- **Adoption risks:** staff see it as self-incrimination; needs a non-state custodian (union, FPO) to keep it honest.
- **Prototype feasibility:** one mandi, one week, one volunteer.
- **Demoability:** high — photo series + arrival counts, before/after.
- **Vs e-token:** issues no tokens. Advertises capacity instead of rationing entry.

## C2. Bag-backed slot (the token *is* the resource)

- **Target user:** farmer, gate clerk.
- **Ground pain:** a token guarantees nothing; gunny bag shortage is the actual binding constraint on the day.
- **Problem:** the promise (token) and the resource (bags/weighing turn) are decoupled, so promises can be printed infinitely.
- **Hypothesis:** if a slot cannot be created without physically reserving the consumable it depends on, over-issuance becomes physically impossible.
- **Core mechanism:** **token conservation** — a fixed set of numbered physical tallies equal to the day's real capacity (one tally per ~N quintals of bags + one weighbridge cycle). A tally is handed out only when the corresponding bundle is set aside; it is returned to the pool when the trolley is emptied. The pool size *is* the backpressure signal; when the box is empty, admission stops because there is nothing to hand over. Kanban, not scheduling.
- **Workflow change:** admission control becomes a hardware invariant instead of a policy.
- **Inputs:** morning bag/bundle count; recycle events at unloading.
- **Outputs:** tally in hand = a claim on a specific bundle.
- **Assumptions:** bag stock is the dominant constraint (officials say it is one of three); tallies are hard enough to forge locally.
- **Data requirements:** none.
- **Technical requirements:** numbered tokens/tags, a lockable box, a return desk.
- **Difficulty:** low; the hard part is discipline at return.
- **Failure modes:** tallies leak / resold — same capture problem as e-tokens if the pool is scarce and unattributed; weighbridge, not bags, binds that day; mid-day truck arrival changes capacity and the pool can't expand cleanly.
- **Adoption risks:** the arhtiya will try to become the tally desk. Must be issued at the gate to whoever holds the trolley, not to a firm name.
- **Prototype feasibility:** high.
- **Demoability:** very high — physically shows why 900 tokens can't exist.
- **Vs e-token:** the token is not a database row; it cannot be over-issued from Chandigarh.

## C3. Waiting-place market instead of waiting-in-place (queue position that is transferable and dated)

- **Target user:** farmer with a perishable/moisture-risk load; farmer who can wait.
- **Ground pain:** all waiting cost is paid in trolley-days on a public road; there is no way for the person who can wait to trade with the person who can't.
- **Problem:** FIFO plus no exit option converts scarcity into road occupation.
- **Hypothesis:** if queue position is explicitly swappable and *leaving does not lose your place*, physical road occupancy decouples from queue length.
- **Core mechanism:** a **standing-place registry with re-entry guarantee** run by the union/FPO: your position is recorded at registration, you go home, you are recalled by phone at position−10. Positions may be voluntarily swapped between two named farmers, recorded publicly; swaps are logged so capture is visible. The recall list, not the road, holds the queue.
- **Workflow change:** the queue becomes virtual and *auditable* while remaining local.
- **Inputs:** registration ledger, phone numbers, recall calls.
- **Outputs:** position, recall time, swap log.
- **Assumptions:** farmers within recall distance; the recall is trusted enough to go home.
- **Data requirements:** a ledger; optionally a spreadsheet.
- **Technical requirements:** phone, register. No state system.
- **Difficulty:** low technically, high socially.
- **Failure modes:** swaps become coerced sales to arhtiyas (must cap or make swaps free-only); recall trust collapses after one broken recall; distress sellers systematically trade down.
- **Adoption risks:** the state's own gate order may ignore the union list.
- **Demoability:** medium — a ledger and a phone log.
- **Vs e-token:** does not schedule anyone; only changes where waiting is stored.

## C4. Bonded slot / forfeit deposit (credible commitment, symmetric)

- **Target user:** mandi operator (or FPO acting as one), farmer.
- **Ground pain:** a slot is a costless promise on both sides — the centre breaks it with no consequence, farmers hold slots they don't use.
- **Problem:** no side forfeits anything, so both over-promise.
- **Hypothesis:** a small **two-sided forfeit** turns a slot from an announcement into a contract, and cuts the no-show tail that inflates apparent demand.
- **Core mechanism:** farmer posts a token deposit (or a signed commitment through the FPO) to hold a slot; **the issuer posts a matching penalty** — if the centre fails to weigh you on the promised day, the deposit is returned with a fixed compensation from a pre-funded pool (union/FPO-held, or insurance-style). The pool's balance is the real backpressure: it becomes cheap to issue only as many slots as the centre can serve.
- **Workflow change:** the issuer now has a *financial* reason to model its own service rate.
- **Inputs:** slot register, deposits, outcome log.
- **Outputs:** honoured/broken slot record; pool balance.
- **Assumptions:** farmers can post any deposit at all (many cannot — must allow zero-cash commitment via FPO guarantee).
- **Data requirements:** honoured-vs-broken outcomes, which nobody currently records.
- **Technical requirements:** an escrow/pool ledger; can be a bank account plus register.
- **Difficulty:** medium; regulatory shape matters.
- **Failure modes:** deposits regressive → excludes the poorest, the exact people who wait 15 days; pool drains in a genuinely bad rain week and the guarantee dies publicly; deposit becomes another thing the arhtiya fronts, deepening dependence.
- **Adoption risks:** looks like charging farmers to sell at MSP — politically toxic if framed wrong. Zero-cash variant is the only safe one.
- **Prototype feasibility:** medium (FPO pilot).
- **Demoability:** high — the compensation event is the story.
- **Vs e-token:** the promise is backed; breaking it costs the promiser.

## C5. Service-rate meter and daily closing-rate publication (measurement as the intervention)

- **Target user:** district administration, unions, media; indirectly farmers.
- **Ground pain:** nobody knows a given centre closes 40 trolleys/day, so targets are set in quintals from the state capital.
- **Problem:** no one measures service rate; therefore admission can't be matched to it.
- **Core mechanism:** independent observers (student volunteers, union members) time-stamp **gate-in and weighment-out** for a sample of trolleys and publish a weekly per-centre **closing rate and P90 dwell time**. It is a measurement instrument, not a scheduler; the output makes over-issuance falsifiable.
- **Inputs:** arrival/exit timestamps, trolley counts.
- **Outputs:** closing rate, dwell distribution, per-centre comparison.
- **Assumptions:** observation is tolerated at the gate.
- **Data requirements:** sampled observations; no official data.
- **Technical requirements:** a phone form, offline-capable.
- **Difficulty:** low technically; sustaining observers is the cost.
- **Failure modes:** observers excluded; sampling bias to easy centres; becomes a dashboard nobody acts on (explicit risk given the brief's avoid-list — justified only as an input to C1/C6).
- **Adoption risks:** confrontational framing.
- **Demoability:** medium.
- **Vs e-token:** measures the server; the e-token systems model only the calendar.

## C6. Decentralised issuance quota derived from measured capacity

- **Target user:** the state token system's operators (this one **does** need adoption — flagged).
- **Ground pain:** tokens issued centrally from Chandigarh, wrong dates, uneven per-arhtiya counts, passes for mandis where the holder doesn't operate.
- **Hypothesis:** the correct fix to central issuance is not better central logic but a **capacity budget delegated to the centre**: the state sets the day's *ceiling* only from the centre's own declared morning position; the centre issues.
- **Core mechanism:** invert the flow — centre publishes capacity upward each morning (four integers, SMS/IVR), tokens are minted only against that declaration, and the centre is scored on declaration accuracy over time (declare high and miss, your ceiling is trimmed). Backpressure with a reputation term.
- **Difficulty:** medium technically, high politically.
- **Failure modes:** centres learn to under-declare for an easy day, throttling procurement — the scoring must penalise both directions; declaration becomes a formality.
- **Adoption risks:** **requires state adoption. Not one of the three.**
- **Vs e-token:** changes who mints and what the mint is constrained by.

## C7. Constraint pooling club — bags, scales, tarpaulins across neighbouring centres

- **Target user:** FPO / cluster of 4–8 nearby centres or villages.
- **Ground pain:** the shortage is often *local and transient* — one centre is out of bags while another 12 km away has slack; lifting trucks idle at one and are missing at another.
- **Hypothesis:** the binding constraint is less absolute scarcity than **non-poolable inventory**; pooling raises the effective service rate without any new capacity.
- **Core mechanism:** a physical **mutual-aid pool** with a call list and a simple lending rule (return-in-kind within 48h, a shared tarpaulin and weighing-scale set, a jointly hired lifting vehicle). Governance is a club, not an app; the phone tree is the protocol.
- **Inputs:** daily shortfall calls.
- **Outputs:** transfers; a settled ledger.
- **Assumptions:** neighbouring centres' peaks are imperfectly correlated (they are — rain and cutting dates vary by a few days).
- **Difficulty:** low-medium; logistics of moving bags is real.
- **Failure modes:** peaks correlate perfectly in a regional rain event and the pool is empty exactly when needed; official bag stock may not be legally lendable (use FPO-owned stock instead); free-riding.
- **Adoption risks:** low if FPO-owned assets only.
- **Demoability:** high — one lending event with the timing.
- **Vs e-token:** raises the service rate rather than rationing demand.

## C8. Moisture-conditioned admission (drying as an admission gate, with a place to dry)

- **Target user:** farmer with over-moisture paddy; centre.
- **Ground pain:** rejection/re-testing for excess moisture is a named cause of delay; a rejected trolley does not leave, it *waits* and occupies space.
- **Hypothesis:** much of the queue is not waiting to be served, it is waiting to become *servable*. Separating "not ready yet" from "ready and queued" shortens the real queue.
- **Core mechanism:** a **holding-and-drying yard adjacent but outside the queue**, with pre-gate moisture check; you get a queue position only when you pass, and drying space is free while you don't. Two queues, one of which is not a queue.
- **Inputs:** existing moisture meter reading at a pre-gate point.
- **Outputs:** ready/not-ready, position issued only on ready.
- **Assumptions:** land for a drying yard; pre-gate testing is accepted.
- **Difficulty:** medium — land and a fair pre-test are both hard.
- **Failure modes:** pre-gate testing becomes a second rent-extraction point; disputes over two different readings; no land available.
- **Adoption risks:** needs the centre's cooperation for the test, or an FPO-run test whose reading the centre won't honour (then it is only advisory).
- **Demoability:** medium.
- **Vs e-token:** admits on *readiness*, not on a date.

## C9. Arrival smoothing by pre-committed village convoys

- **Target user:** village cluster / FPO; farmers.
- **Ground pain:** everyone arrives on day one and after rain; the peak is self-inflicted and jointly harmful.
- **Hypothesis:** a coordination failure, not a scarcity problem, produces the day-one spike; a **rotating, self-enforced village order** with a visible rota is enough to flatten it.
- **Core mechanism:** villages agree a rota (village A Mon/Thu, B Tue/Fri), enforced socially and by the shared transport booking — one hired truck/tractor slot per village per day makes the rota *physically* self-enforcing. Commitment is credible because the transport is the bottleneck the village itself controls.
- **Inputs:** rota, transport bookings.
- **Outputs:** smoothed arrivals.
- **Assumptions:** village-level cohesion; rota order perceived as fair (rotate the first slot each season).
- **Difficulty:** low technically, entirely social.
- **Failure modes:** defection when rain is forecast — everyone breaks the rota at once, exactly when it matters; large farmers exit the rota; harvest timing is not actually flexible.
- **Adoption risks:** none from the state.
- **Demoability:** medium — arrival-count comparison across two villages.
- **Vs e-token:** the demand side coordinates itself; no issuer exists.

## C10. Standing offer / put option outside the mandi gate

- **Target user:** farmer facing a 15-day wait with a road-parked load.
- **Ground pain:** the wait is only endurable because there is no alternative; the arhtiya is the only exit and prices accordingly.
- **Hypothesis:** the queue's power comes from being the only buyer at that moment. A credible **alternative exit at a known price** caps the cost of waiting and shrinks the queue.
- **Core mechanism:** FPO or warehouse operator posts a standing offer — deposit the load in a certified warehouse today, take an immediate advance against a warehouse receipt, sell later. It is a real backpressure valve: excess arrivals overflow into storage instead of onto the road.
- **Inputs:** warehouse space, an advance facility (this exists as a financing product — WDRA-style negotiable warehouse receipts).
- **Outputs:** receipt, advance, later sale.
- **Assumptions:** warehouse within reach; advance terms beat waiting; the later sale can still access MSP or a comparable price — **this is the weak link**, since MSP is realised at the centre.
- **Difficulty:** medium-high — financing partner needed.
- **Failure modes:** if the deposited grain cannot later be procured at MSP, this converts a queue into a price loss; small lots uneconomic to store; storage cost eats the gain.
- **Adoption risks:** needs a lender, not the state.
- **Demoability:** low-medium.
- **Vs e-token:** does not touch admission at all; relieves pressure by adding an exit.

---

## Region honesty note

The region is **not thin**, but it is narrower than 12 genuinely distinct mechanisms. Distinct mechanism families found: (i) advertise capacity (C1, C5), (ii) conserve tokens physically (C2), (iii) relocate/trade the queue (C3), (iv) bond the promise (C4), (v) invert issuance (C6), (vi) raise the service rate by pooling (C7), (vii) gate on readiness (C8), (viii) demand-side self-coordination (C9), (ix) add an exit valve (C10). Ten is where real differentiation stopped; padding to 12 would have produced variants of C1 and C4.
