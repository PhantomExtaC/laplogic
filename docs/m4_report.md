# M4 — Simulator and Insights

Implemented lookup-only sample simulation, configurable HTTP provider integration,
validated controls, abort/request ordering, stale and error preservation, reset,
accessible completion status and model/assumption context. Added filtered Insights
archive, four immutable sample articles, safe block renderer, percentage-point
revision, frozen picks/outcome audit, snapshot links and per-article social metadata.

Validation: strict TypeScript, lint, 97 tests across 16 files and production build
passed. Tests include an abort-ignoring provider, out-of-order responses, failed
requests preserving a stale result, baseline reset, exact fixture lookups, all JSON
contracts, article deep-link binding and no fetch of current evaluation. Forced
story exporter rerun preserved all four article hashes. Production browser checked
scenario run/edit/reset and audit article deep link; full responsive audit follows
in M5. HTTP provider is an integration stub; a live inference API is not supplied.
