# Verification needed

Entries marked **Unverified** in the app carry values or section numbers that were transcribed from memory or from drawing text. This list says what document is needed to confirm each one. The container this was built in could not reach tn.gov or access-board.gov, so none of these could be checked live.

Formulas and the values computed from them (SSD, K, R_min, ISD, DSD, curve elements, runoff, spirals, tapers, length of need) are tested against the Green Book design values and need no further check beyond a spot review of the test file.

## AASHTO Green Book, 7th edition (2018)

| Entry | What to confirm | Where |
|---|---|---|
| Passing sight distance | The 13 design values 400–1,400 ft (20–80 mph) | Table 3-4 |
| Superelevation runoff | Recommended portion of runoff on the tangent by speed and lanes rotated (currently the 60–90 % range only) | Table 3-18 |
| Spiral curve transition | Desirable spiral lengths (currently 2.94·V) and the "maximum radius for use of a spiral" thresholds | Tables 3-19, 3-20 |
| Cross slope, minimum grade, clearance | Vertical clearance by facility type and the 6 in resurfacing allowance; lane width statements | §3.4 (structures), §4.2, §4.3 |

## TDOT Roadway Design Guidelines

| Entry | What to confirm | Where |
|---|---|---|
| All TDOT citations | Chapter titles and section numbering for Chapters 3–6; only Chapter 2 sections (2-302, 2-302.05, 2-601) are cited by number | Table of contents, Chapters 2–6 |
| Slopes and barrier warrants | Critical-fill exemption (100 ft, 10 ft drop) and the 35 mph low-speed urban rule | §2-302.05 |
| Taper length | Whether TDOT breaks the taper formula at 45 mph as the MUTCD does | Chapter 2 lane transitions; §2-601 |
| Planned entries | Standard design criteria tables by functional class (design speed, lane and shoulder width, maximum grade by terrain, clearance) | Chapter 2 design criteria tables |

## TDOT standard drawings

| Entry | What to confirm | Where |
|---|---|---|
| Clear zone distance; clear zone table | All 20 cells × 5 slope columns of Table A, including the backslope columns (added from memory of RDG Table 3-1) | S-CZ-1 Table A, rev. 06-28-2019 |
| Curve correction K_cz table | All 12 radius rows × 7 speed columns of Table B | S-CZ-1 Table B |
| Clear zone distance (note) | 4 ft minimum / 6 ft enhanced lateral offset on curbed streets posted ≤ 45 mph | S-CZ-1 Figure B |
| Length of need; runout table | Runout rows at 20, 25, 35, 45, 55 and 65 mph (TDOT interpolations); confirm the 80 mph row exists; "begins at post 3" | S-PL-1 Table B and layout notes, rev. 03-01-2023 |

## AASHTO Roadside Design Guide, 4th edition (2011)

| Entry | What to confirm | Where |
|---|---|---|
| Slopes and barrier warrants | Shy-line offsets by speed; suggested flare rates inside and beyond the shy line | Tables 5-7, 5-9 |
| Runout table | The 30, 40, 50, 60, 70 and 80 mph rows (believed to be the revised 2011 values) | Table 5-10(b) |

## MUTCD, 11th edition (2023)

| Entry | What to confirm | Where |
|---|---|---|
| Taper length | Section and table numbers for L = WS²/60 and L = WS (Part 6 was renumbered in the 11th edition) | Part 6 taper criteria table |
| Street crossings | Section number for the 3.5 ft/s pedestrian clearance speed | Chapter 4I (pedestrian signals) |

## PROWAG, final rule (August 2023)

| Entry | What to confirm | Where |
|---|---|---|
| Curb ramps | Sub-section numbers for clear width, flared sides and grade breaks; 15 ft length limit wording | R304 |
| Detectable warnings | 6–8 in setback from the curb line; sub-section numbers | R305.2 |
| Street crossings and signals | 2 in pushbutton size; refuge island length; 30 × 48 in clear space | R209, R306, R403 |
| Ramps, stairs and handrails | Stair riser 4–7 in and tread 11 in limits; nosing projection | R408 |
| Accessible on-street parking | The count table (1–25: 1 … 151–200: 6; over 200: 4 %) | R214 |

## How to clear an item

1. Open the source and compare the printed value with the registry in `src/criteria.js`.
2. Correct the value if needed and run `npm test`.
3. Remove the `verify: true` flag in the registry and the `unverified` text on the entry in `src/entries/*.js`.
4. Delete the row here.
