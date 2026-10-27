# Roadway Design Reference

A desk reference for design engineers and quality reviewers who know roadway design and need a quick answer to "what was that formula or constant?" and "what is the minimum at this design speed?". It covers geometric design, roadside safety and pedestrian facilities from the **AASHTO Green Book (7th ed., 2018)**, the **TDOT Roadway Design Guidelines** (Chapter 2 Geometric Design Criteria and Chapter 3 Multimodal Design, rev. 07/31/26), the **AASHTO Roadside Design Guide** as adapted on TDOT standard drawings **S-CZ-1** and **S-PL-1**, and **PROWAG (2023 final rule)**. The TDOT source PDFs are kept in the repository root.

> Engineering reference only. It does not replace engineering judgment, a sealed design or the owner's review. Check every value against the cited source.

## How it works

- **One global input: design speed.** Every speed-dependent entry follows it until you change the entry's own input. Tables highlight the row for the selected speed.
- **Search first.** The search box matches titles, synonyms, variable symbols and section numbers ("K sag", "Rmin", "3.2.2", "R304", "clear zone"). Press `/` to focus it.
- **Three kinds of entry.**
  - *Formula*: the equation, each constant with its source, and a worked-values panel that shows the intermediate steps for the conditions you enter.
  - *Table*: a lookup by speed, ADT or class, computed from the equations where the source is copyrighted.
  - *Constants*: single values with citation (PROWAG dimensions, design constants, slope limits).
- **Nothing plan-specific.** Entries take design conditions (speed, grade, radius, ADT), never a proposed value, and give no pass/fail result.
- **Links reproduce the view.** The page address carries the design speed, search and topic; each entry has a Link button that copies a direct link to it.

## Topics and entries

| Topic | Entries |
|---|---|
| Design controls | AASHTO design constants; side friction f by speed; relative gradient Δ; cross slope, shoulders, minimum grade and vertical clearance; TDOT controlling criteria, design exceptions and waivers; TDOT design vehicle |
| Sight distance | SSD formula and table; decision sight distance; passing sight distance; intersection sight distance formula and table |
| Horizontal alignment | Minimum radius formula and table by e_max; circular curve elements; horizontal sightline offset; superelevation runoff and runout; spiral length; approach, bay and departure tapers; lane drop after an intersection with Table 2-4 |
| Vertical alignment | K and minimum length; K table; parabola geometry (PVC, PVT, high/low point); sag under a structure |
| Roadside safety | Clear zone with curve correction; clear zone table; K_cz table; slopes and barrier warrants; barrier type and guardrail placement; length of need; suggested LON table; runout length table |
| Pedestrian | PROWAG pedestrian access route, curb ramps, detectable warnings, crossings and signals, ramps, protruding objects, parking; TDOT Tables 3-1, 3-2, 3-3; midblock crossings and refuge islands; shared-use paths; bus stops; ADA upgrade triggers |

Planned, not yet entered: the TDOT standard drawing criteria by functional class (RD-CTS and RD18-TS series: design speed, lane and shoulder width, maximum grade by terrain, minimum K), the RD18-SE and RD18-LR superelevation tables, Green Book Tables 3-18 and 3-19, and TDOT RDG Chapters 4 to 6. Drainage is out of scope.

## Verification

Values transcribed from memory or from drawing text are marked **Unverified** on the entry and collected on the About page. [VERIFY.md](VERIFY.md) lists the document, table or figure needed to confirm each one.

## How it is built

- Static HTML, CSS and ES-module JavaScript. No build step, no server code, no cookies, no analytics, no external requests (enforced by a Content Security Policy).
- `src/criteria.js`: the registry of every constant and table, each with its source and edition. Entries and formulas read from it; to move to a new edition, change this file.
- `src/formulas.js`: pure calculation functions, each citing its equation.
- `src/entries/*.js`: one file per topic; each entry declares its kind, equation, variables, citations and notes.
- `src/sketches.js`: static definition sketches that label the variables.
- AASHTO material is copyrighted: Green Book and Roadside Design Guide values are computed from the published equations and cited by section, not reproduced as tables. TDOT drawings, TDOT guidelines and PROWAG are public.

## Run locally

Serve the folder with any static server and open `index.html`:

```
npm run serve     # python3 -m http.server 8000
```

ES modules will not load from a `file://` URL.

## Tests

```
npm test
```

Runs under Node's built-in test runner and checks the formulas against the published Green Book design values (SSD, crest and sag K for 15–80 mph, minimum radius, decision and intersection sight distance), curve elements, superelevation runoff, spiral lengths, tapers and the roadside lookups. The same suite runs in GitHub Actions on every push.
