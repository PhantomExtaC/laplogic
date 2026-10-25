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
