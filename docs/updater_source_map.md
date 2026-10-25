# U1 — source inventory and replacement gates

Local read-only inventory; no upstream fetch or engine execution was performed.
See source_inventory.json for every CSV, row count, columns and available dates.
Ready means a source is available for implementation, not production-certified.

## Coverage finding
master_historical.csv contains 10,822 rows through 2026-08-23, but raw races.csv
and clean_races.csv end 2024-12-08. The training matrix has 4,626 rows and ends
in 2024. The updater must reconcile these separate lineages before refreshing
predictions. Feature tables have 10,822 rows but no year column; their freshness
must be established through event-ID joins, not file modification time.

## Complete frontend resource map
Paths below are relative to public/data. Owners U2–U7 are implementation checkpoints.

| Resources | Source / producer and owner | Readiness and publication gate |
| --- | --- | --- |
| manifest.json | U2/U7 release publisher | Blocked: coherent validated release, source dates, resource versions |
| asset_manifest.json | U3 public filesystem scan | Ready: exact case and existing paths |
| driver_registry.json | U3 directories/standings | Ready: unique IDs, explicit aliases, reject unresolved joins |
| track_registry.json | U3 circuits.csv circuitRef | Ready: exact IDs; unmatched engine IDs null |
| calendar.json | U3 FastF1 schedule / json_builder.py | Blocked: explicit season, sessions/timezones, circuit IDs and status |
| drivers.json, teams.json | U3 directory refresh plus historical drivers/constructors | Blocked: current roster and career/season provenance; historical files alone insufficient |
| driver_standings.json, constructor_standings.json | U3 generate_standings.py | Blocked: explicit season, shared completed-round coverage and IDs |
| season_stats.json | U3 export_season_stats.py | Ready for supplied-file counts only; current counts depend on refreshed inputs |
| pointsProgression.json | U3 master_historical.csv / json_builder.py | Blocked: reconcile/backfill results; validate cumulative points by round |
| momentum.json | U4 power_rating.py / power_ratings.csv | Blocked: event joins, latest-five window, directions and metric definitions |
| insights.json | U4 json_builder.py using power/mastery | Blocked: canonical IDs and directional metadata |
| head_to_head.json | U4 power/mastery/track features | Blocked: normalization, units, sample counts and minimum coverage |
| tracks.json, tracksDeg.json | U4 circuits.csv, track_profile.py, json_builder.py | Blocked: preserve directory schema; define degradation/window/pit-stop denominator |
| evaluation.json | U5 arena.py plus retained per-race predictions | Blocked: single authoritative run, cohort, metric definitions and versioned models |
| arena_metrics.json, evaluation_metrics.json | U5 legacy evaluation compatibility | Blocked: derive from the same canonical run; never independently select champions |
| predictions.json, prediction_stages.json | U5 approved model and event-stage feature rows; prediction engines require reconciliation | Blocked: source cutoff, full field, model version, raw probability coverage and snapshot identity |
| weekend_state.json | U5 weekend_builder.py / session data | Blocked: event/snapshot/session identity, observed-vs-forecast provenance |
| arena_history.json, snapshots/*.json, outcomes/*.json | U5 frozen predictions and verified results | Blocked: append-only identities; never reconstruct historic picks using future data |
| simulator_scenarios.json | U6 approved inference and grid-penalty features | Blocked: real inference, defined assumptions, baseline parity and pp deltas |
| stories/index.json, stories/*.json | U6 frozen evidence and reviewed editorial content | Blocked: immutable originals, evidence links and review policy |
| driverTrends.json, next_race.json, stats.json | Retained legacy archives | Not applicable to active UI replacement; keep contract validation, no freshness claims |

## Runner defects to address in U2
The scheduled workflow invokes the default lab profile. main.py only calls cleaning,
dataset assembly and arena evaluation; it does not wire ingestion, features or exports.
Missing scripts are skipped. Production failures may continue and the final message
still reports completion. Profile flags do not enforce publication isolation.
Dependencies are unpinned and PyYAML is not explicitly installed by the workflow.

Ingestion selects rounds greater than the maximum stored round, which misses earlier
gaps and corrections. Pit-stop request failures become zero. Its source path is
resolved from src/ingestion to src/data, whereas arena resolves the engine data root;
feature scripts and json_builder have the same src/data path pattern. Paths must be
centralized before orchestration. Standings output also depends on working directory.

Arena retrains on every execution, divides by eligible race count without an empty
cohort guard, and emits aggregate percentages without model versions or per-race
records. A missing grid feature yields a zero baseline rather than unavailable.
Separate refresh from model promotion and retain immutable evaluation evidence.

## Freshness and acceptance policy
Core results/standings: weekly after official results, with explicit source-through
round and correction handling. Schedule/roster: weekly and event changes. Features:
only after their result inputs pass validation. Forecast stages: before weekend,
after FP2 and qualifying, requiring additional triggers beyond Monday. Frozen stories,
forecasts and outcomes retain publication/source dates; age alone does not rewrite them.
Numerical age budgets remain an owner decision; no invented freshness thresholds.

First backfill reconciles 2025–2026 event identities and missing rounds across master,
clean and training inputs. Later updates use keyed upserts and a correction window.
Each candidate must pass schema, unique-ID, join, event/season, units, null/zero,
source-cutoff and sample-flag checks. Critical failure preserves the previous release;
optional unavailable data keeps its original timestamp. Publication uses an explicit
allowlist and a coherent release boundary with tested rollback.

## U0 verification
Home no longer requests or renders Momentum / Form window. Removed introductory
filler and shortened prediction/progression copy. Other sections and truthful sample
labels remain. Strict TypeScript, lint, 99 tests and production build passed.
Browser responsive recheck is not claimed for this checkpoint.
