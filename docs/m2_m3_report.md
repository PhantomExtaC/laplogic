# Paired checkpoints — M2 and M3

## M2: Core pages
Committed separately as `432fd3f`. See m2_core_report.md for file migration and feature details. The milestone passed type checking, lint, 53 tests and production build before M3 work began.

## M3: Arena and Compare
- Added features/arena with winner-accuracy and Top-3 definitions, champion/challenger/baseline status, season/stage filters, one common eligibility cohort, cumulative accuracy chart/table, per-forecast correctness labels and exclusions. Each row links to frozen picks and its outcome. Filters update both summary and detailed denominators.
- Added immutable snapshot/outcome routes and guarded sample archives. Services validate archive IDs and refuse identity mismatches. Existing archives are skipped on export rerun; no current model or version is substituted into old records.
- Added features/compare with two driver selectors, URL context, season/track context, normalized radar and raw-value/sample-count tables. Same-driver URLs, unsupported tracks, unknown normalization/direction, incompatible units and insufficient samples produce explicit unavailable states. Numeric zero remains zero.
- Extended canonical evaluation contracts and kept the actual conflicting legacy feeds untouched. A future real versioned evaluation supersedes legacy archive conflicts; the shipped sample contract continues to withhold champion promotion.
- Added schemas, typed services/hooks, domain logic, fixture exporters and contract/component tests for all new resources. No new dependencies or changes to the main analytics pipeline.

## Contracts and placeholders
Replacement scripts below live in analytics_engine/src/export/placeholders/. Detailed field lists, units and null semantics are in data_contracts.md.

| Root placeholder file | Replacement script |
|---|---|
| arena_history.json | export_arena_history.py |
| asset_manifest.json | export_asset_manifest.py |
| driver_registry.json | export_registries.py |
| evaluation.json | export_evaluation.py |
| head_to_head.json | export_head_to_head.py |
| manifest.json | export_manifest.py |
| momentum.json | export_momentum.py |
| prediction_stages.json | export_prediction_stages.py |
| track_registry.json | export_registries.py |
| snapshots/<id>.json (15 sample files) | export_arena_history.py |
| outcomes/<id>.json (5 sample files) | export_arena_history.py |

season_stats.json is a real derived-count export, not a sample analytics feed. Its scopes come from shipped directory/standings/calendar flags; unique circuits is null without calendar track IDs. Sample momentum, stage probabilities, evaluations, comparison metrics and outcomes are illustrative, not measured performance.

M3 discrepancies: canonical metrics use fractions, while legacy evaluation files use percentages and disagree on champion. Archive model versions are absent from the first sample snapshot files and stay explicitly unavailable. Track-specific sample counts are never replaced by overall counts. Identity joins use canonical IDs and explicit registry aliases, not names.

## Verification
From web_app, the M3 checks passed:
- `npx --no-install tsc -b`
- `npm run lint` — no warnings
- `npm test` — 86 passing tests across 13 files
- `npm run build` — no chunk-size warning
- `git diff --check`

Contracts validate every shipped root JSON and every frozen snapshot/outcome file, then verify archive references, identities, picks and outcomes agree. Additional tests cover a shared cohort and exclusions, no-data metrics, direction inversion, raw zero, insufficient/track-specific samples, same-driver links, source replacement with a real canonical evaluation, unsafe archive paths and mismatched identity, and superseded resource responses.

Exporter checks: all new placeholder scripts generated their files. The helper refused to overwrite the real derived season-count feed. An exporter rerun under a write spy skipped all existing snapshot/outcome paths; byte hashes remained unchanged.

## Browser review against the production preview
- Loaded Home, Race Hub, Drivers, Teams, Tracks, Calendar, Arena and Compare at 360px, 768px and 1280px. Each has one main landmark. No page-wide horizontal overflow remains; wide data tables use named scroll regions. A phone-width radar/grid overflow was found, fixed and rechecked at all three widths.
- Verified Home section sequence, driver search URL persistence, two-driver checkbox selection and navigation to Compare, same-driver deep-link guard, and sparse comparison availability.
- Verified stage source selection, post-quali → pre-weekend changes, a full 22-driver sample field, missing prior-stage deltas, and persistent sample labels. Unbound real telemetry remains withheld.
- Verified Arena stage filtering: post-quali has 4 shared eligible / 1 excluded forecasts; all-stage view has 12 eligible / 3 excluded. Filtered summary and detailed denominators agree. These are sample-fixture counts, not real evaluation claims.
- Followed actual frozen-pick and outcome links and checked their immutable record pages and sample labels.
- Production preview console showed no errors. Earlier development hot reload errors occurred while modules were being migrated; the stable production build was reviewed separately.
- Existing keyboard navigation, focus trap, route focus and reduced-motion source tests remain green. An OS-level reduced-motion toggle was not exercised.

Final production bundle: entry approximately 347.41 kB / 108.50 kB gzip; shared chart modules remain lazy-loaded (largest shared chart module approximately 258.12 kB). Home, Arena and Compare load their own route code. Total route payload has not been represented as just the entry chunk.

## Open owner decisions and next pair
Still unresolved: authoritative real champion/evaluation cohort, freshness budgets and event/snapshot metadata, calendar track/session/timezone fields, legacy degradation scale/sample window/pit-stop denominator, and real inference endpoint. Unknown values remain unavailable and sample data remains labeled.

M4 + M5 are the next pair: simulator providers and stale-result handling, immutable Insights stories, then removal of dead compatibility code and a final audit. The full rebuild is not yet complete.
