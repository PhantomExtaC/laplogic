# U2/U3 implementation progress

Implemented an isolated, standard-library Python candidate runner and ten core
resource builders. This is the staging foundation, not the completed live updater.

Run from the repository root:
`python analytics_engine/updater.py --season 2026 --dry-run`

The default input is the existing public/data bundle. --input-dir selects another
cached bundle, and --work-dir changes the isolated artifact location. Outputs are
content-addressed under .updater/releases. Validation uses frontend Zod contracts
through Vitest. Successful non-dry runs update only .updater/candidate.json; neither
mode publishes website data. No schedule has been changed.

Sources are never stamped with invented current provenance. Original directory,
calendar and standings payloads are preserved. Derived registries, asset inventory
and counts describe supplied files; timestamps remain null. Track registry engine
IDs remain unavailable in this bundle builder, pending verified circuit mapping.
Source samples, duplicate entities, wrong seasons and unresolved active team joins
are rejected. No-op reruns retain the same candidate ID. Validation failure cannot
expose a partial release. A corrupt existing candidate fails verification.

The overlap lock is intentionally not reclaimed automatically after a process crash:
verify no updater is running before removing .updater/update.lock. Candidates use
atomic same-filesystem rename. This does not constitute a website deployment or
rollback mechanism; those remain U7 work.

Validation: Python lock, failure isolation, path escape and immutable rerun tests;
core provenance/season/sample-input tests; a real cached-bundle dry run through all
ten Zod contracts. No live upstream request or official-current-data claim was made.

Remaining before U2/U3 completion: incremental/backfill keyed ingestion, bounded
network retries, official source adapters, correction-window handling, complete
profile policy, verified calendar instants and roster/standings provenance, and
real-source outage/recovery rehearsal. Keep production data unchanged until those
gates pass. See weekly_updater_plan.md and updater_source_map.md.


## Live ingestion continuation
`--live` now collects schedule, complete paginated race results and standings at the
same result cutoff through Jolpica. The source is saved separately under
.updater/sources/<content-hash>.json; the ten core candidate files still come from
the cached bundle until source-to-contract conversion is complete. The report
explicitly distinguishes these two sources. No website files are published.

The adapter uses a custom User-Agent, 20-second request timeout, three bounded
attempts for transient failures, capped retry delay, pagination completeness checks
and explicit season/round checks. Full-season rereads include earlier corrections
and gaps; absent results remain absent. No pit-stop values are invented. The API
contract was checked against https://github.com/jolpica/jolpica-f1/blob/main/docs/README.md.
Twelve Python tests pass, including retries, permanent failures, split race pages,
truncated pagination and noncontiguous rounds. Live source verification is recorded
in .updater/last-run.json; a failed attempt preserves existing validated candidates.
