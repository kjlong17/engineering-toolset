# Verification status

Entries marked **Unverified** in the app carry values or section numbers that were transcribed from memory. This file says what document is needed to confirm each one, and records what has already been checked.

Formulas and the values computed from them (SSD, K, R_min, ISD, DSD, curve elements, runoff, spirals, tapers, lane drop, length of need) are tested against published design values in `tests/formulas.test.js`.

## Checked against the source

| Source | What was checked | Result |
|---|---|---|
| TDOT S-CZ-1, rev. 06-28-19 | Table A, all 20 rows × 5 slope columns; Table B, all 12 rows; Figure B offsets (4 ft min, 6 ft enhanced); general notes 1–10 | Corrected 5 backslope cells at 40 mph and 2 at 65–70 mph, and 6 rows of K_cz. Now matches the drawing. |
| TDOT S-PL-1, rev. 03-01-2023 | Table A (max L_c), Table B (runout), Tables C and D (suggested LON), the LON formula, notes A–F | Removed an 80 mph runout row that is not on the drawing. Tables C and D reproduce from the formula with a 6 ft shoulder. |
| TDOT RDG Chapter 2, rev. 07/31/26 | Controlling criteria and exception types (§2-100, §2-105, §2-201); superelevation practice and spirals (§2-101.01); shoulders (§2-101.03); cross slopes (§2-101.04); vertical clearance (§2-102.05); vertical curve relations (§2-200.02); slopes (§2-200.03, §2-302.02); clear zone notes (§2-200.04, §2-301); design vehicle (§2-200.05); barrier warrants and exceptions (§2-302); barrier type and guardrail (§2-302.07, §2-303); lane drop and Table 2-4 (§2-601); turn-lane tapers (§2-602); median left-turn alignment (§2-800.03) | Entered as cited. Vertical clearance entry rewritten to the TDOT values. |
| TDOT RDG Chapter 3, rev. 07/31/26 | Accessibility triggers (§3-301); Tables 3-1, 3-2 (§3-402); sidewalks (§3-403, §3-404); crosswalks (§3-405); curb ramps and detectable warnings (§3-406); midblock crossings and Table 3-3 (§3-407); curb extensions (§3-408); pushbuttons and APS (§3-410); work zones (§3-417); shared-use paths (§3-600 to 3-614); transit (§3-701 to 3-703) | Entered as cited. |

## Still to verify

### AASHTO Green Book, 7th edition (2018)

| Entry | What to confirm | Where |
|---|---|---|
| Passing sight distance | The 13 design values 400–1,400 ft (20–80 mph) | Table 3-4 |
| Superelevation runoff | Recommended portion of runoff on the tangent by speed and lanes rotated (currently the 60–90 % range only) | Table 3-18 |
| Spiral curve transition | Desirable spiral lengths (currently 2.94·V) and the maximum radius for use of a spiral | Tables 3-19, 3-20 |

### TDOT Roadway Design Guidelines and standard drawings

| Entry | What to confirm | Where |
|---|---|---|
| All TDOT citations | Chapters 4, 5 and 6 are not yet mapped or used | Chapters 4–6 |
| Planned entries | Design speed, lane and shoulder width, maximum grade by terrain, minimum K by classification | RD-CTS and RD18-TS standard drawing series (Chapter 2 defers to them) |
| Superelevation tables | Rates and runoff lengths by speed and radius; spiral thresholds | RD18-SE and RD18-LR series |

### AASHTO Roadside Design Guide, 4th edition (2011)

| Entry | What to confirm | Where |
|---|---|---|
| Barrier type selection and guardrail placement | Shy-line offsets by speed; suggested flare rates inside and beyond the shy line | Tables 5-7, 5-9 |

### MUTCD, 11th edition (2023)

| Entry | What to confirm | Where |
|---|---|---|
| Lane drop | TDOT Table 2-4 cites the 2009 MUTCD Table 2C-4; confirm the 11th edition table number and that Condition A values are unchanged | §2C.05 |
| Street crossings | Section number for the 3.5 ft/s pedestrian clearance speed | Part 4 pedestrian signals |

### PROWAG, final rule (August 2023)

| Entry | What to confirm | Where |
|---|---|---|
| Curb ramps | Sub-section numbers for clear width, flared sides and grade breaks | R304 |
| Detectable warnings | 6–8 in setback from the curb line; sub-section numbers | R305.2 |
| Street crossings and signals | 2 in pushbutton size; refuge island wording | R209, R306 |
| Ramps, stairs and handrails | Stair riser 4–7 in and tread 11 in limits; nosing projection | R408 |
| Accessible on-street parking | The count table (1–25: 1 … 151–200: 6; over 200: 4 %) | R214 |

## How to clear an item

1. Open the source and compare the printed value with the registry in `src/criteria.js`.
2. Correct the value if needed and run `npm test`.
3. Remove the `unverified` text on the entry in `src/entries/*.js`.
4. Move the row to the "Checked" table above.
