# Step 4 (continued) — Ground Reality, Tier B

Reduced-depth pass, per the adaptive-compute rule: enough evidence to characterise the gap, not a
full independent-exploration cycle unless Tier A candidates collapse under red-teaming.

---

## PS-027 — Pollution-aware navigation

**SECONDARY_EVIDENCE — the dose/concentration distinction is real and technically load-bearing.**
Research explicitly separates *ambient concentration along a route* from *inhaled dose*: dose
depends on breathing rate, and cyclists/pedestrians have intake rates 2–3x resting levels, so a
route with lower ambient concentration can still deliver a higher dose if it is slower or more
strenuous. Studies use heart-rate-derived breathing rate for individualised dose calculation.
([Toxics 2026 PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12945186/))

**SECONDARY_EVIDENCE — spatial resolution exists at street scale.** Systems like ATMO-Street
model at ~10 m resolution; mobile-platform measurement confirms considerable pollutant variation
along a single travelled route, not just between routes.
([Springer](https://link.springer.com/article/10.1007/s11869-024-01529-y))

> **Gap confirmed (INFERENCE, well supported):** almost all "pollution-aware navigation" concepts —
> including the ones implied by PS-027's own wording ("exposure") — actually optimise ambient
> concentration, which is the wrong objective for an active traveller. A route recommender that
> ingests activity type (walk/cycle/auto) and computes minutes × concentration × intake-rate
> multiplier, rather than average AQI along the path, is a genuine and non-cosmetic mechanism
> change grounded directly in the literature.

**UNKNOWN** — whether Indian cities have public street-level AQ data at the resolution the
academic examples used (mostly European/Chinese studies); this needs a direct data-availability
check before commitment, not assumption.

---

## PS-029 — Landslide early warning

**SECONDARY_EVIDENCE — the prediction half is not where warnings fail.** Warnings fail when people
distrust the source, have no safe shelter nearby, or have ignored earlier false alarms — a
last-mile and trust problem, not a modelling problem.
([Business Standard](https://www.business-standard.com/india-news/indian-weather-warnings-system-issues-up-storm-viral-video-126052001090_1.html),
[PrepareCenter](https://preparecenter.org/resource/last-mile-ews-report/))

**SECONDARY_EVIDENCE — regional systems cannot answer the question communities actually ask.**
Local people want slope-specific, house-by-house forecasts; regional systems can only flag a large
district, which creates an impossible evacuation logistics problem — remote villages are often cut
off by the very landslides they are fleeing. There is no forced-evacuation protocol comparable to
what exists for cyclones.
([Down To Earth](https://www.downtoearth.org.in/natural-disasters/stemming-the-landslide-heres-why-localised-early-warnings-in-india-still-an-uphill-battle))

> **Gap confirmed:** this reproduces exactly the pattern found in the Tier A problems — the stated
> ask (identify + predict) is well served, and the actually decisive failure sits downstream, in
> the credibility and actionability of the warning at household level. This is consistent with G6's
> shape (trust and institutional response, not detection) and reduces confidence that PS-029 offers
> a genuinely different opportunity from PS-023 — it may be the same underlying mechanism gap
> (warnings/reports that don't convert to trusted action) recurring in a different domain.

---

## PS-009 — Vernacular pedagogy / real-time translation

Not independently researched at Tier B depth; normalization (Step 3) already surfaced the load-
bearing ambiguity: the statement conflates *translation of material* with *pedagogy*, and it is
unclear whether real-time translation targets teacher speech, textbook content, or child speech.
This ambiguity is itself informative — it suggests the real constraint is likely teacher language
proficiency and classroom device access rather than translation quality, but this is HYPOTHESIS,
not evidence, and would need direct field input (see validation protocol) before further pursuit.

**Disposition:** held at Tier B. Not promoted, because Tier A already fully occupies the
exploration budget and no result above suggests PS-009 out-competes any Tier A candidate on
differentiation or evidence strength.

---

## PS-031 — Land record digitisation & validation

Not independently researched at Tier B depth beyond Step 3. The load-bearing tension identified in
normalization stands: "validation" of a land record is a legal act (adjudicating conflicting
claims), while digitisation tools can only support a technical act (OCR, structuring, search).
Any credible candidate here must be honest that it produces a *searchable draft record*, not a
validated title — conflating the two is a serious, foreseeable harm (false confidence in land
ownership). This alone is enough reason to hold PS-031 at reduced depth: the ceiling on what a
prototype can honestly claim is low relative to Tier A candidates, even though the ground pain is
real.

**Disposition:** held at Tier B, not promoted.

---

## Effect on final selection

Tier B research confirms the corpus-wide pattern already established in Tier A (Ground Reality
Cross-Cutting Observation, Section E) rather than surfacing a materially stronger, differently-
shaped opportunity. PS-027's dose-vs-concentration gap is real and will be preserved as a
secondary/backup candidate. PS-029 and PS-009/PS-031 do not independently justify promotion to
full depth given the adaptive-compute rule — effort stays concentrated on Tier A.
