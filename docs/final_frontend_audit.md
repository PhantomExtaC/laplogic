# LapLogic frontend — M4 / M5 final audit

## 1. Changes and checkpoints

M4 (`72d5299`) completes the Simulator and Insights workflows. Added the simulation
provider interface, lookup-only sample provider, HTTP integration stub selected by
public configuration, validated form, baseline/scenario results, percentage-point
deltas, request cancellation/order protection, stale/error preservation and reset.
Added a filtered story archive, four article types, immutable snapshot/outcome links,
safe text blocks, before/after revisions and article social metadata. Added matching
schemas, fixtures, guarded Python exporters and lifecycle/contract/component tests.

M5 moves the router into `web_app/src/app/App.tsx`, consolidates live directory
loaders under `data/services/directories.ts`, and extracts driver/track adapters.
Removes obsolete components/cards/layout/chart wrappers, empty simulator stubs,
old pages/Simulator, PlannedPage, legacy types/services and the unused registry
re-export. Existing real JSON archives are preserved. It also fixes the canceled
request busy state when users edit inputs and then return to their original values;
a regression test covers this. Simulator captions now show raw field coverage.

`npm run audit` checks source reachability, static and lazy import resolution,
domain purity, UI/chart isolation from data, fetch location, explicit any, debug
logging and case-sensitive asset references. All 89 production TypeScript modules
are reachable from the application; unreachable-file and rule-violation lists are
empty. This is a module reachability audit, not a proof about every possible runtime
branch. Shared design primitives and pure contracts remain intentional public APIs.

Evidence: `docs/frontend_audit.json`, `docs/browser_audit.json`,
`docs/asset_audit.json`, and the individual M0–M4 checkpoint reports.

## 2. Contract discrepancies and conservative handling

- The engine supplies no real simulation endpoint or scenario response. The frontend
  uses published synthetic fixtures only. Unsupported combinations return a clear
  unavailable message. VITE_SIM_API_URL selects a validated GET integration stub;
  an actual service was not called or deployed. Probabilities are never calculated
  by the browser; displayed coverage is a sum of published values.
- Archived sample snapshots omit model versions. Articles preserve that absence and
  display unavailable; they never fetch today's evaluation to fill it in.
- Published stories, forecasts and outcomes are immutable. Rerunning the story
  exporter with --force preserved all four article hashes. Updates require new IDs.
- Legacy evaluation runs disagree; the champion remains unresolved. The real legacy
  prediction file has ten drivers and 98.4% raw mass, without a verified event or
  full-field denominator. It remains visibly unverified and unnormalized.
- Calendar instants, track IDs and timezones remain absent. No session times, current
  event circuit join, weather/telemetry binding or freshness threshold is invented.
- Circuit mapping uses exact source circuitRef IDs. Degradation direction, window,
  pole conversion and average-pit-stop denominator remain unconfirmed or unavailable.
- Exact case audit finds zero mismatches. There are 99 existing missing image
  references: 77 track layouts, 21 driver-standings images and one constructor-
  standings image. Missing layouts are withheld by the adapter and use the supplied
  fallback; standings do not request their missing images; Avatar handles failures.
  Real exports and the user's preexisting image directories were not rewritten.

## 3. Remaining placeholder contracts and owners

All scripts below are in `analytics_engine/src/export/placeholders/`. They use the
shared guarded writer and are not wired into the production pipeline. SAMPLE DATA
remains visible wherever these resources are rendered. Registry/asset rows can be
source-derived, but their metadata remains conservatively marked placeholder.

| JSON resource | Replacement script |
| --- | --- |
| manifest.json | export_manifest.py |
| driver_registry.json, track_registry.json | export_registries.py |
| asset_manifest.json | export_asset_manifest.py |
| evaluation.json | export_evaluation.py |
| momentum.json | export_momentum.py |
| prediction_stages.json | export_prediction_stages.py |
| arena_history.json; 15 snapshots/<id>.json; 5 outcomes/<id>.json | export_arena_history.py |
| head_to_head.json | export_head_to_head.py |
| simulator_scenarios.json | export_simulator_scenarios.py |
| stories/index.json; four stories/sample-<type>-v1.json | export_stories.py |

`season_stats.json` is a real derived count of supplied directories/calendar flags,
owned by export_season_stats.py; it is not a claim of live championship status.
All original legacy JSON remains real historical/unbound input, with its provenance
limits visible. Full fields, units, null semantics and consumers are documented in
`docs/data_contracts.md`. Real replacements keep these schemas and set placeholder
false only when all output is genuine. Immutable archives require new IDs.

## 4. Verification results

Commands run from `C:/Projects/Fanalytics/web_app`, in milestone order:

| Command | Final result |
| --- | --- |
| npx --no-install tsc -b | PASS, strict TypeScript |
| npm run lint | PASS, no lint warnings |
| npm test | PASS, 99 tests / 16 files |
| npm run build | PASS, no chunk-size warning |
| npm run audit | PASS, zero unused source files, architectural violations or case mismatches |

Tests validate all root and nested shipped JSON contracts and prevent new JSON
subfolders from silently escaping coverage. Additional checks cover canonical IDs,
raw probability mass, null versus zero, units, common cohorts, sparse comparison,
resource errors/order, keyboard controls, sample chips, abort-ignoring simulation
providers, canceled busy state, reset, stale/error preservation and immutable story
identity. The story deep-link test also asserts that current evaluation is not read.
Python story-export rerun preserved four frozen files byte-for-byte.

Production browser verification:

- All ten primary pages at 360, 768 and 1280 pixels: one main landmark, loaded
  content, no page-wide horizontal overflow and no data-error alerts.
- All four article types at the same three widths: original snapshot/model data,
  article titles and metadata resolve; no overflow or error alerts.
- Simulator: keyboard submit, changed-input stale marker, exact fixture lookup,
  unsupported-driver error preserving the previous result, and reset from that
  error to the original driver/event/zero-penalty baseline.
- Insights: type filter, article deep link, frozen pre-race picks versus recorded
  sample outcome, and dynamic social/title metadata. Empty comparison URL guard
  works at /compare?a=&b=. Race Hub and Arena direct URLs were included above.
- Mobile menu: Enter opens, Shift+Tab/Tab wrap focus, Escape closes and returns
  focus to the opener. Automated menu tests also cover background inertness.
- No warning/error console entries were captured in the production review tab.
- Reduced motion: CSS media rules and automated source/token checks pass. The OS
  reduced-motion preference was not exercised; the available browser controls do
  not expose media emulation. No claim of a manual reduced-motion pass is made.

Bundle review (Vite's reported decimal kB / gzip): M0's single 708.32 / 210.82 kB
chunk became a 347.84 / 108.41 kB entry. Charts remain lazy-loaded, with shared chart
code 258.12 / 79.54 kB and LineTrendChart 95.24 / 24.49 kB. Simulator route code is
7.48 / 2.92 kB and Insights 7.24 / 2.82 kB. A route's total payload includes its
shared chunks; the entry size alone is not its full download cost. The machine
report uses Node gzip defaults, which differ slightly from Vite's compression.

## 5. Remaining engine-owner decisions

Confirm the authoritative evaluation run/champion and cohort/metric definitions;
publish active event/snapshot IDs and freshness budgets; supply verified calendar
track/session/timezone fields; define degradation direction/sample windows and
pit-stop denominators; and agree on the real inference endpoint shape/model
assumptions. The implemented HTTP stub expects GET query parameters snapshotId,
driverId, gridPenalty and a SimulationResult response. No secrets belong in public
Vite variables. These are data/backend handoff decisions; the frontend feature and
design sequence M0–M5 is complete with explicit sample/unavailable states.
