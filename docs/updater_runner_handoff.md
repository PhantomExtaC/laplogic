# U2/U3 implementation progress

The candidate runner now converts a Jolpica season snapshot into frontend calendar,
driver standings and constructor standings resources. Directory career statistics
remain cached with unknown freshness. This is staging; website publication and
weekly scheduling remain U7 work.

Run from the repository root:

```text
python analytics_engine/updater.py --season 2026 --live --dry-run
```

Omit --live to validate the cached public/data bundle. --input-dir selects another
cached bundle; --work-dir changes the isolated artifact location. Both modes build
ten core resources, validate them against frontend Zod contracts and place complete,
content-addressed candidates under .updater/releases. Non-dry runs update only
.updater/candidate.json. Neither mode writes website data.

## Source handling

The adapter reads the complete season schedule and paginated race results, then
standings at the same result cutoff. Full-season rereads catch earlier corrections
and gaps. Requests use a custom User-Agent, 20-second timeout, three bounded
attempts for transient failures and capped retry delays. Pagination, season and
round checks reject incomplete or mismatched responses. API reference:
https://github.com/jolpica/jolpica-f1/blob/main/docs/README.md.

Raw snapshots are saved under .updater/sources/<content-hash>.json. Calendar and
standings envelopes retain source snapshot identity, observation time and result
cutoff. Sessions preserve supplied UTC instants; missing times stay null. Events
are completed only when results exist; missing results do not imply cancellation.
Track directory joins and local timezone names remain null pending verified mapping.
Driver teams come from their latest recorded race result, avoiding transfer errors
from the ordering of constructors in standings. Missing numbers stay null; zero
points remain zero. Live identities extend the driver registry without name joins.
Mixed directory/live registries and season counts retain unknown aggregate freshness.

## Replay and safety

Replay without network access using the original observation timestamp:

```text
python analytics_engine/updater.py --season 2026 --source-snapshot .updater/sources/8e54ba2a0d3efa080dd94342.json --source-observed-at 2026-10-25T14:09:19.864035+00:00 --dry-run
```

Identical replay inputs reuse a candidate ID. A fresh live observation has a new
observation timestamp and may create another candidate even if race data is unchanged.
Duplicate entities, ambiguous aliases, unresolved standings team joins, source samples
in the cached bundle and wrong seasons fail validation. Failed validation cannot
expose a partial release. Existing candidate content is verified before reuse.
The overlap lock is not reclaimed automatically after a process crash: verify no
updater is running before removing .updater/update.lock. Candidates use atomic
same-filesystem rename; this is not yet a website deployment/rollback mechanism.

## Verification and remaining work

The saved source was converted through round 17, with results through 2026-10-11.
Candidate 79641de7b5191fdf30ced532 passed all ten frontend resource contracts.
Python checks cover ingestion retries/pagination, isolation, immutable candidates,
provenance, transfer handling, missing values, timestamp validation and replay.
Frontend checks cover envelope metadata retention and compatibility with legacy arrays.

Remaining U2/U3 gates include verified circuit mapping, complete profile freshness
policy, and real-source outage/recovery rehearsal. Later checkpoints populate
analytics, forecasts, Simulator and stories before coherent scheduled publication.
See weekly_updater_plan.md and updater_source_map.md.
