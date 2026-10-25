# Connecting computed exports to the website

The updater now supports --publish for live and saved source runs. It validates a
complete candidate against frontend contracts, saves previous affected JSON under
.updater/backups/<candidate>/previous.json, and writes an explicit allowlist into
web_app/public/data. Those files are now included in this change, rather than
remaining only under ignored .updater staging folders. The live fetch on 2026-10-25
returned the same source as the earlier snapshot: round 17, results through
2026-10-11. Export metadata reports that coverage accurately.

Calendar, standings, registries, season counts and finishing form are connected.
A real manifest binds their source snapshot. The calendar resolves 22 of 23 track
profiles; Madring remains unavailable. One missing profile no longer hides all
mapped circuits. Cached career totals/rosters retain unknown historical coverage.

Race Hub has one published forecast view. Source/stage selectors and the sample
stage workflow are removed from that page. Resource hooks withhold sample exports;
unbound legacy forecasts are unavailable. Fixture files remain for contract tests
and future migrations, but their dummy values do not render in the final UI.
Provenance appears as compact coverage text rather than repeated warning panels.

The weekly workflow now installs frontend dependencies from package-lock.json,
runs updater recovery tests, calls --live --publish, checks the website and commits
only reported output paths. It has concurrency/timeout limits and stores candidate
and backup evidence. Identical live source snapshots preserve their original
export timestamp to avoid timestamp-only data commits. No workflow was dispatched
and no remote push or hosting deployment was performed in this local session.

Publication targets a build checkout: Linux uses atomic file replacements; Windows
readers that deny rename may require an in-place write after saving the backup.
Caught write failures restore changed files. Process/power-loss recovery and hosted
release switching are not yet guaranteed; deploy only after a complete successful
build. CI never commits a failed run. For a prior release, restore its validated
JSON set from Git and rebuild/deploy the whole site, rather than editing live files.

Remaining computation work: canonical time-split model evaluation/promotion,
event-bound inference inputs, forecasts frozen before outcomes, real simulator
scenarios, reviewed stories, and verified degradation/racecraft definitions. The
old RF exporter guesses a driver subset and takes the first track feature row;
it cannot safely supply the final UI. Existing stage/arena archives are synthetic.
These require actual producer work, not removing placeholder flags. The current
changes do not claim every analytical resource has been computed or U4–U7 finished.
