# Step 4 — Ground Reality Investigation (Tier A)

Every claim below carries an evidence label. Where direct user evidence does not exist, that is
stated rather than papered over.

---

## A. PS-015 + PS-004 — The procurement centre (investigated jointly)

The triage hypothesis was that these two statements describe the same physical event. The evidence
confirms it: a farmer arriving at a procurement centre with a loaded vehicle faces **one** compound
risk — *how long will I wait, and will my produce be accepted when I reach the front?*

### A.1 What actually happens

**SECONDARY_EVIDENCE — waiting is measured in days, not hours.** During peak arrival, farmers wait
two to three days for produce to be purchased; in worse cases harvests are not lifted for 15–20
days. Farmers unload paddy onto roads because mandi space is exhausted.
([Tribune](https://www.tribuneindia.com/news/haryana/procurement-delays-create-space-shortage-in-mandis/),
[Deccan Chronicle](https://www.deccanchronicle.com/southern-states/telangana/delays-at-paddy-procurement-centres-add-to-farmers-woes-1951954))

**SECONDARY_EVIDENCE — the wait has a direct cash cost that can exceed the MSP premium.** Farmers
without their own transport pay for transport, labour and food while waiting. These costs "can wipe
out the additional amount they would have earned by selling at MSP."
([101Reporters](https://101reporters.com/article/agriculture/In_Bundelkhand_wheat_farmers_cant_afford_to_wait_for_MSP))

> This is the single most consequential finding in the whole investigation. It converts the problem
> from "farmers lack information" into **"farmers face a channel-choice decision under uncertainty
> whose payoff can be negative."** The farmer's real question is not *when is my slot* but
> *is going at all worth it, versus selling to the private trader at my gate today.*

**SECONDARY_EVIDENCE — the causes of delay are physical, not informational.** Officials attribute
slowdown to untimely rain, excess moisture in paddy, and logistical constraints: shortages of gunny
bags, weighing scales and trucks, plus infrastructure gaps. ([Deccan Chronicle](https://www.deccanchronicle.com/southern-states/telangana/delays-at-paddy-procurement-centres-add-to-farmers-woes-1951954))

**FACT (contradicts the problem statement) — the information system PS-015 asks for already exists
and is deployed.** Punjab issues e-tokens/e-passes for mandi entry via a platform built with Ola;
Madhya Pradesh runs e-Uparjan slot booking for wheat.
([Tribune](https://www.tribuneindia.com/news/punjab/punjab-ties-up-with-ola-for-app-to-issue-e-passes-to-farmers-71547),
[MP e-Uparjan](https://mp-e-uparjan.com/mp-e-uparjan-slot-booking-2026/))

**SECONDARY_EVIDENCE — and it fails in a specific, diagnosable way.** On day one of wheat
procurement, e-tokens were released for the wrong date. Tokens were issued centrally from
Chandigarh; some commission agents received one token per day and others three; some received
passes for mandis where they do not even operate. Farmers and agents jointly demanded
decentralisation of token issuance.
([Tribune 1](https://www.tribuneindia.com/news/punjab/wheat-procurement-confusion-over-tokens-mars-day-1-in-punjab-71586),
[Tribune 2](https://www.tribuneindia.com/news/punjab/decentralise-e-token-system-demand-farmers-arhtiyas-72550))

> **Mechanism diagnosis (INFERENCE, well supported):** the deployed token systems perform
> *admission control without capacity modelling*. They schedule arrivals against a calendar, not
> against the centre's actual service rate — which is gated that day by gunny bags, weighbridge
> availability, truck lifting, and space. A token is therefore a promise the physical system
> has not agreed to keep. Adding more scheduling UI cannot fix a scheduler that does not know
> its own service capacity.

**SECONDARY_EVIDENCE — the token is allocated to the intermediary, not the farmer.** Allocation is
per commission agent (arhtiya). The unit of scheduling is not the person who waits.

### A.2 The rejection risk (PS-004's half)

**SECONDARY_EVIDENCE — rejection happens *after* the farmer has already paid to get there.**
Nashik farmers report that private traders weigh and purchase immediately, while at NAFED
procurement they wait hours for grading only to have substantial quantities rejected. They demand
that grading criteria be made transparent and farmer-friendly, and warn that continued large-scale
rejection will push them to private traders instead.
([Free Press Journal](https://www.freepressjournal.in/pune/nashik-farmers-allege-quality-onion-rejections-in-nafed-procurement-demand-transparent-grading-system))

> Note precisely what farmers asked for: **transparency and contestability of the criteria** — not
> higher grading accuracy. PS-004 assumes the problem is measurement error. The stated grievance is
> about *legitimacy and the timing of the decision*.

**SECONDARY_EVIDENCE — for grain, the dominant rejection criterion is moisture, and it is
non-negotiable.** Wheat above 14% and paddy above 17% moisture is rejected. The Centre has refused
state requests to relax paddy moisture norms.
([Business Standard](https://www.business-standard.com/industry/agriculture/centre-rejects-tn-request-to-relax-moisture-norms-for-paddy-procurement-126021100993_1.html),
[Down To Earth](https://www.downtoearth.org.in/agriculture/centre-may-reduce-moisture-content-limit-for-wheat-paddy-why-this-will-hurt-farmers-81191))

**DIRECT_PRACTITIONER_EVIDENCE — practitioners have explicitly asked for the check to move earlier.**
Arhtiyas state that paddy moisture should be checked *at the entry points of mandis*.
([Tribune](https://www.tribuneindia.com/news/punjab/paddy-moisture-should-be-checked-at-entry-points-of-mandis-say-arhtiyas))
Meanwhile the state's only instrument is a broadcast warning to farmers not to bring high-moisture
paddy. ([Tribune](https://www.tribuneindia.com/news/archive/bathinda/farmers-warned-not-to-bring-paddy-with-high-moisture-666729))

> A broadcast warning is an instruction to solve a measurement problem the farmer has no instrument
> to measure. This is the clearest single gap found in the entire corpus.

**FACT — the rejection decision is being automated *at the centre*, right now.** Gujarat has
deployed AI grain analysers at MSP centres; 341 samples were rejected in early reporting.
([Asianet](https://newsable.asianetnews.com/india/gujarat-uses-ai-grain-analysers-to-grade-paddy-at-msp-centres-341-samples-rejected-articleshow-xae61ss))

> Automating the gate makes rejection *faster, more consistent, and harder to argue with*. From the
> farmer's side that is not unambiguously an improvement: it removes the discretion that previously
> absorbed marginal loads, while leaving the farmer's transport already sunk. **Improving the
> grader can make the farmer worse off.** Any candidate in this space must confront that.

### A.3 Who bears what

| Actor | Bears | Controls | Incentive |
|---|---|---|---|
| Farmer | transport, labour, food, waiting time, rejection loss, distress-sale loss | when to harvest, when to travel, which channel | maximise *net realisation*, not gross price |
| Arhtiya | working capital, farmer relationship | token allocation, credit, sequencing at the centre | preserve the credit interlinkage |
| Centre staff | throughput blame, storage risk | grade decision, service rate | avoid accepting spoilable stock |
| State agency | storage loss, political cost | norms, capacity, opening dates | protect grain quality |

**SECONDARY_EVIDENCE — the arhtiya is a lender, not merely a broker.** The kacha arhtiya functions
as the farmer's bank between seasons, funding daily expenses and inputs, settled when the crop
materialises; rates run roughly 15–24% versus institutional 8–10%. Farmers remain dependent despite
Kisan Credit Cards and subsidised institutional credit.
([IGC working paper](https://www.theigc.org/sites/default/files/2014/09/Haq-Et-Al-2013-Working-Paper.pdf),
[PIDE](https://file.pide.org.pk/uploads/kb-069-the-role-of-arthi-in-agriculture-marketing-an-exploiter-or-facilitator-of-farmers.pdf),
[Ideas for India](https://www.ideasforindia.in/topics/agriculture/addressing-the-economic-trade-offs-of-interlinkages-in-contemporary-agrarian-markets))

> **Adoption consequence (INFERENCE):** any tool that helps the farmer bypass the arhtiya attacks a
> credit relationship the farmer cannot currently exit. Disintermediation-flavoured designs will be
> resisted by the intermediary who controls mandi access and sequencing. A design that *includes*
> the arhtiya has a materially higher chance of surviving contact with the ground.

### A.4 UNKNOWN — needs human validation
- Actual distribution of wait times per centre per day. Not published anywhere found.
- What fraction of arriving loads are rejected, and for which criterion.
- Whether a farmer would trust a wait/rejection forecast enough to act on it.

---

## B. PS-032 — Kabadiwala Connect

### B.1 The statement names an existing company

**FACT.** *Kabadiwalla Connect* is a real Chennai enterprise operating since 2014 that maps and
digitally integrates informal waste aggregators. Its 2015 mapping found ~2,000 kabadiwalas in
Chennai. ([ITU](https://www.itu.int/hub/2021/07/indian-firms-digital-solution-for-urban-waste-pickers/),
[NextBillion](https://nextbillion.net/from-trash-to-resource-how-technology-can-help-informal-waste-pickers-solve-indias-recycling-problem/))

> The problem statement is, in effect, the name and mission of a decade-old company. Rebuilding the
> platform is by definition IDENTICAL prior art. The only defensible move here is to find what
> that approach *structurally cannot* do.

### B.2 The premise of the statement is contradicted by evidence

**SECONDARY_EVIDENCE — the informal chain already works well.** Kabadiwalas already recover ~33% of
Chennai's total recyclable waste. ([ITU](https://www.itu.int/hub/2021/07/indian-firms-digital-solution-for-urban-waste-pickers/))

**SECONDARY_EVIDENCE — collectors do not want what formalisation offers.** Waste pickers do not
perceive the necessity or advantage of formal registration; resistance is attributed to mistrust of
formal actors; caste and municipal inaction are interwoven structural barriers; formalisation
without livelihood protection is resisted by people with no alternative income.
([ScienceDirect — caste, mistrust and municipal inaction](https://www.sciencedirect.com/science/article/pii/S0301479724004997),
[INCLUDE report](https://includeplatform.net/wp-content/uploads/2025/02/FINAL-INCLUDE-REPORT-2024-1.pdf))

**FACT — the device assumption fails.** Only ~30% of kabadiwalas own and operate a smartphone,
which Kabadiwalla Connect itself identified as a barrier to digital platform adoption.

> **The statement's premise — "bring the collector into the formal chain, for the collector's
> benefit" — is not supported.** The collector is efficient, distrustful, mostly without a
> smartphone, and rationally protective of margin that visibility erodes. Formalisation is
> primarily valuable to *municipalities and brands*, not to the collector.

### B.3 Where the actual, severe, well-evidenced pain is

It is not in collection. It is in **proof of collection**, and it belongs to a different actor.

**SECONDARY_EVIDENCE — India's EPR credit system is being defrauded at scale.** CPCB uncovered four
recycling firms across Gujarat, Maharashtra and Karnataka that generated over **600,000 fake EPR
certificates**, claiming collection and processing that never occurred, and sold them to brand
owners meeting regulatory targets. A 2023 Down To Earth investigation found recyclers issuing EPR
certificates without recycling any plastic. CPCB has acknowledged that over 70% of PROs had not
submitted audited recycling data.
([Outlook Business](https://www.outlookbusiness.com/planet/sustainability/avoiding-the-pitfalls-of-epr-fraud-ensuring-transparency-in-plastic-epr-and-plastic-credit-markets),
[Envirosense](https://envirosense.in/eprcredits/))

**SECONDARY_EVIDENCE — verification is self-declared and manual.** CPCB EPR guidelines depend
heavily on manual verification and self-declared documentation, leaving credit issuance vulnerable
to forgery.

**SECONDARY_EVIDENCE — and the people who actually witness collection are excluded from the
policy.** Informal economy workers who collect and segregate waste "get no mention in India's EPR
policy." ([WIEGO](https://www.wiego.org/blog/waste-pickers-and-epr-india/))

> **The structural fact that makes this interesting:** the certificate is generated by the party
> with the incentive to inflate it (the registered recycler), while the party with direct physical
> knowledge of the collection event (the informal collector) is outside the system entirely and has
> no standing. Fraud is not an implementation defect; it is the predicted output of that
> information architecture.

### B.4 UNKNOWN — needs human validation
- Would a collector accept payment in exchange for attesting to a transaction, and at what price?
- Would a brand or PRO pay a premium for independently-witnessed credits, or is cheap paper
  compliance preferred? **This is the question the whole direction rests on.**

---

## C. PS-023 — Women's safety in public transport

**SECONDARY_EVIDENCE — the reporting funnel collapses before technology is reached.** In a Chennai
cross-sectional study of 270 women, of the 57 who experienced harassment, **only 4 complained to
police** — roughly 7%. ([Indian J Community Medicine, 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11156118/))

**SECONDARY_EVIDENCE — prevalence is very high.** Multiple studies report over 70% of women in
major Indian cities experiencing harassment on public transport.

**SECONDARY_EVIDENCE — the barrier is trust and stigma, not interface.** Victims feel unsafe
reporting owing to lack of trust in authorities and social stigma.
([Valan, 2020](https://journals.sagepub.com/doi/abs/10.1177/2516606920927303))

> **Assumption inversion:** PS-021/PS-022/PS-023 all assume the victim will initiate. Any system
> whose first step is *the victim reports* inherits a ~7% ceiling. That is not a UX problem to be
> designed away; it is a structural property of an act that requires public self-identification in
> a stigmatising setting.
>
> The under-explored region is therefore mechanisms that **do not require the victim to
> self-identify at the moment of the incident**, or that decouple *recording* from *reporting*.
> Note this must be pursued without drifting into surveillance of passengers, which trades one
> harm for another. That tension is the design problem.

### C.1 UNKNOWN — needs human validation
- Would deferred, non-confrontational recording actually raise the 7%, or merely relocate it?
- What do transit operators do with a report today, and what is the completion rate?

---

## D. PS-028 — Windshield installation guidance

**FACT — the statement is fully specified**, uniquely in this corpus: identify windshield area,
display predefined pressure points, guide sequential application of *adequate* pressure, track
completion, confirm the standard process was followed.

**SECONDARY_EVIDENCE — this is a textbook poka-yoke problem.** Poka-yoke targets exactly the two
error classes this task exhibits: *omission* (skipping a point) and *commission* (wrong
force/orientation). Control-type poka-yoke halts the process until the error is remedied.
([Wikipedia](https://en.wikipedia.org/wiki/Poka-yoke), [Banner Engineering](https://www.bannerengineering.com/ca/en/solutions/quality-control/error-proofing-poka-yoke.html))

**SECONDARY_EVIDENCE — the physical process explains why sequence matters.** Urethane sealant is
applied as a continuous bead; the glass must be seated into that bead. ([USPTO 5,772,823](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5772823))

> **The unsolved sub-problem, stated plainly:** the statement demands verification of *adequate
> pressure* from a camera. Force is not an optical quantity. A vision system can verify *where* the
> hand went and *for how long*, but not *how hard*. Every honest solution must either (a) add a
> sensing modality, or (b) infer force from an observable proxy and be explicit that it is a proxy.
>
> Sequence and completion tracking is straightforward and is where most implementations will stop.
> **Force verification is where the actual contribution is** — and where most teams will quietly
> substitute an assumption.

**UNKNOWN** — whether the plant would accept an instrumented glove/tool, or insists on
non-contact sensing only.

---

## E. Cross-cutting observation

Four of the five Tier A problems share one shape:

> **The stated problem is an information-display problem. The evidenced problem is a
> commitment-and-trust problem, and the decisive event happens before or after the moment the
> statement is looking at.**

- PS-015: the token is displayed; the capacity behind it is not committed.
- PS-004: the grade is measured; the farmer's transport is already sunk when it is.
- PS-032: the certificate is displayed; the collection event behind it is unwitnessed.
- PS-023: the report channel exists; the willingness to enter it does not.

PS-028 is the exception, and is a genuine, bounded engineering problem.
