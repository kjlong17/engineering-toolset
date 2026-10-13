# Civil Engineering Tools

An engineering reference for street design. For the inputs you enter, each tool gives the standards-based design values for street geometry, roadside safety and stormwater, from the **Transportation & Street Technical Standards (TSTS), 2025 edition** (published by the City of Franklin, Tennessee), and the TDOT, AASHTO, MUTCD and FHWA criteria the Standards reference.

> Engineering reference only. It does not replace engineering judgment, a sealed design, or the approving agency's review. The adopted Standards and the approving agency's determinations govern.
>
> Independent tool. Not affiliated with, produced by or endorsed by the City of Franklin, Tennessee.

## Tools

| Tab | Card | Main sources |
|---|---|---|
| Alignment | Vertical curve: SSD, K, minimum length, PVC/PVT and high/low point | TSTS Table 2.3(2), §2.3.9; AASHTO GB §3.2.2, §3.4.6 |
| Alignment | Horizontal curve: minimum radius, tangents, curve elements, sightline offset | TSTS Tables 2.3(2), 2.3(4), §2.3.8; AASHTO GB §3.3 |
| Alignment | Grade, grade break and cross slope limits | TSTS Tables 2.3(2), 2.3(5), §2.3.8(7), §2.3.9 |
| Intersections | Intersection sight distance | TSTS §2.3.10; AASHTO GB §9.5.3 |
| Intersections | Turn lane need and length | TSTS Table 2.3(1), §2.3.13(8)–(10), §2.3.23(7); TDOT HSAM Vol. 3 Tables 3-11, 3-12 |
| Intersections | Taper lengths | TSTS §2.3.11; TDOT HSAM Figs. 3-21, 3-22; MUTCD Table 2C-3 |
| Intersections | Intersection and access spacing | TSTS Table 2.3(2), §2.3.13, §2.3.15, §2.3.16, §2.3.23 |
| Cross section & access | Typical section widths, cul-de-sac, clearances | TSTS Typical Sections TS-1 to TS-7, Table 2.3(1), §2.3.7, §2.3.21 |
| Cross section & access | Driveway dimensions and number allowed | TSTS §2.3.23, Tables 2.3(8), 2.3(9) |
| Roadside safety | Clear zone, shielding need and length of need | TSTS §2.3.18–2.3.19, Ch. 7 §7.8; TDOT S-CZ-1, S-PL-1, RDG §2-302 |
| Drainage | Design storm, allowable spread and gutter capacity | TSTS Table 3.1, §3.2.1(2), §3.2.2; FHWA HEC-22 |
| Drainage | Storm sewer pipe size | TSTS §3.2.1(3), Ch. 7 §7.3; Manning |

## How it is built

- Static HTML, CSS and JavaScript. No build step, no server code, no cookies, no analytics, no external requests (enforced by a Content Security Policy).
- Each card takes design inputs and returns design values with their citations. It does not compare against a proposed design or give pass/fail results.
- `js/criteria.js` is the single registry of design values, each with its source, section and edition. Cards read values from it; to move to a new edition, update this file.
- `js/formulas.js` holds the calculations, each citing its equation source.
- `js/cards/*.js` — one file per tool: inputs, design values, SVG diagram and basis notes.
- AASHTO material is copyrighted: Green Book values are computed from the published equations and cited, not reproduced as tables. Roadside values are shown as adapted and published by TDOT.

## Run locally

Serve this folder with any static web server (for example GitHub Pages, or `python -m http.server` from this folder) and open `index.html`. Opening the file straight from disk may be blocked by the page's Content Security Policy in some browsers.

## Tests

Open `tests/formulas.test.html` through the same server. It checks the formulas against published design values (AASHTO stopping and intersection sight distance, K values, TSTS Table 2.3(2) radii, TDOT tables, and Manning and HEC-22 hand calculations).

## Before public release

- Verify the TDOT values transcribed from drawing sheets: S-CZ-1 Tables A and B and the low-speed urban offsets, and the S-PL-1 runout lengths for 20, 25 and 35 mph. These are listed on the About tab.
- Legal review of the terms-of-use text.
- Accessibility check (axe or similar, plus keyboard and screen reader pass).
