# Data contracts — M0–M5 handoff

## Swap-in procedure
Replace the relevant placeholder export body with real computation, preserve its schema under `web_app/src/data/schemas/`, run the export, and set `meta.placeholder: false` only when every value is real. Run `npm test` before shipping. Placeholder exporters refuse to overwrite real or unclassified legacy files unless `--force` is passed. They are not wired into the pipeline.

## Conservative provenance policy
Legacy data is never assigned a guessed event, season, model or timestamp. Missing provenance renders STALE / UNVERIFIED. No age threshold can establish freshness without a source timestamp. Combined Race Hub data is suppressed until event and snapshot IDs exist. Home and Race Hub use the same date-aware `nextEvent` function. Calendar dates have day precision; countdowns and timezone conversion wait for session instants.

A missing manifest is tolerated by the hook, but resources remain unverified. Manifest IDs currently remain null. Registry metadata is sample, although rows are derived from directories. Numeric circuit IDs map only through exact circuitRef IDs in the circuits CSV; unmatched engineCircuitId values remain null. Registries use explicit source abbreviations and IDs, never display names.

## Discrepancies and units
- Evaluation legacy runs disagree on champion and accuracies. Display a conflict warning; withhold canonical champion. Aggregate legacy counts cannot establish a shared cohort or Top-3 metric definition.
- Predictions are only ten drivers, total probability mass 98.4%. Keep raw values. Full event field size is unknown; current directory size is not a valid denominator for an unbound snapshot.
- Driver `polePositions` maps to `poles`; missing birth date, age and race finishes stay null. Directory career totals and standings remain separate resources.
- Track `turns` maps to `corners`, `layoutImage` to `layout`; legacy `lapRecord.milliseconds` contains seconds. The adapter exports `seconds` unchanged, verified with 69.593 → 1:09.593. Missing laps and DRS zones stay null.
- Driver standings numbers are numeric.
- Calendar has no track or country fields. Adapter adds null, never `unknown-track`. Status supports cancelled and postponed.
- Weather legacy fields stay validated in their original shape at M0; no observed/forecast or session provenance is claimed.
- Degradation is constrained to 1–5; direction and sample window require owner confirmation. Average pit stops appears to be a field total; it is withheld from per-driver displays until confirmed.
- Driver trends are historical arrays without event labels; they are not current-form estimates. Insight directions remain unconfirmed and are not used for comparison.

## Resources
All unavailable values are null; numeric zero remains zero. Probability units are fractions, evaluation legacy accuracy units are percent, temperatures are Celsius, pit deltas are seconds, points are championship points. Schemas reject nonfinite numbers.

### `arena_metrics.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | champion, models | data/services/index.ts (evaluation conflict check) |

### `asset_manifest.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| 1.0.0 | placeholder | analytics_engine/src/export/placeholders/export_asset_manifest.py | array of asset paths | data/services/directories.ts (asset availability) |

### `calendar.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | round, grandPrix, date, sprintWeekend, status | data/services/index.ts / useCalendar |

### `constructor_standings.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | id, position, points, wins, teamName, nationality, imagePath | data/services/directories.ts / useTeamStandings |

### `driver_registry.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| 1.0.0 | placeholder | analytics_engine/src/export/placeholders/export_registries.py | canonicalId, aliases, abbreviation, number | data/services/index.ts / canonical alias resolution |

### `driver_standings.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | id, position, points, wins, driverName, driverNumber, nationality, currentTeamId, imagePath | data/services/directories.ts / useDriverStandings |

### `drivers.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | id, fullName, image, nationality, number, abbreviation, currentTeamId, active, seasons, yearsActive, championships, raceEntries, raceStarts, wins, podiums, polePositions, fastestLaps, careerPoints, winRate, podiumRate, poleRate, fastLapRate, pointsPerEntry, currentPoints, dnfs, championshipYears | data/services/directories.ts / useDrivers |

### `driverTrends.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | michael_schumacher, barrichello, ralf_schumacher, villeneuve, fisichella, zonta, wurz, gene, heidfeld, salo, button, diniz, mazzacane, frentzen, trulli, alesi, hakkinen, verstappen, coulthard, rosa, irvine, herbert, burti, raikkonen, panis, alonso, montoya, marques, bernoldi, enge, yoong, webber, sato, massa, mcnish, davidson, pizzonia, wilson, matta, firman, kiesa, baumgartner, klien, pantano, bruni, glock, karthikeyan, monteiro, friesacher, albers, liuzzi, doornbos, rosberg, speed, ide, montagny, yamamoto, kubica, hamilton, kovalainen, sutil, vettel, markus_winkelhock, nakajima, bourdais, piquet_jr, buemi, alguersuari, grosjean, badoer, kobayashi, hulkenberg, bruno_senna, petrov, grassi, chandhok, resta, ambrosio, maldonado, perez, ricciardo, vergne, pic, gutierrez, bottas, jules_bianchi, chilton, garde, kevin_magnussen, kvyat, ericsson, lotterer, stevens, nasr, sainz, max_verstappen, merhi, rossi, jolyon_palmer, wehrlein, haryanto, vandoorne, ocon, giovinazzi, stroll, gasly, brendon_hartley, leclerc, sirotkin, norris, albon, russell, latifi, aitken, pietro_fittipaldi, tsunoda, mick_schumacher, mazepin, zhou, de_vries, sargeant, piastri, lawson, bearman, colapinto, doohan, antonelli, bortoleto, hadjar, arvid_lindblad | contract validation only; historical archive retained |

### `evaluation.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| 1.0.0 | placeholder | analytics_engine/src/export/placeholders/export_evaluation.py | evaluationId, championId, sampleCount, models, conflict | data/services/index.ts / useEvaluation |

### `evaluation_metrics.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | totalRaces, baselineAccuracy, champion, models | data/services/index.ts (evaluation conflict check) |

### `insights.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | driverId, powerRating, mastery, profile | data/services/core.ts / useInsights |

### `manifest.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| 1.0.0 | placeholder | analytics_engine/src/export/placeholders/export_manifest.py | snapshotId, season, nextRaceId, championModelId, evaluationId, resources | data/services/index.ts / useResource and Footer |

### `next_race.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | round, grandPrix, trackId, country, date, weather | contract validation only; shared calendar nextEvent replaces this feed |

### `pointsProgression.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | round, albon, alonso, antonelli, arvid_lindblad, bearman, bortoleto, bottas, colapinto, gasly, hadjar, hamilton, hulkenberg, lawson, leclerc, max_verstappen, norris, ocon, perez, piastri, russell, sainz, stroll | data/services/index.ts / useProgression |

### `predictions.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | driverId, driverName, winProbability, predictedPosition, insights | data/services/index.ts / usePredictions |

### `stats.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | season, drivers, teams, tracks, completedRaces, remainingRaces | contract validation only; season_stats replaces this feed |

### `teams.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | id, name, principal, base, engine, driverIds, wins, podiums, championships, points, active, logo | data/services/directories.ts / useTeams |

### `track_registry.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| 1.0.0 | placeholder | analytics_engine/src/export/placeholders/export_registries.py | canonicalId, aliases, engineCircuitId | data/services/core.ts / getTrackProfiles |

### `tracks.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | id, name, city, country, lengthKm, turns, direction, circuitType, firstGrandPrix, lastGrandPrix, racesHeld, lapRecord, layoutImage, active | data/services/directories.ts / useTracks |

### `tracksDeg.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | circuitId, tireDegradationIndex, isStreetCircuit, averagePitStops | data/services/core.ts / useTrackProfiles |

### `weekend_state.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | track, weather, telemetry | data/services/index.ts / useWeekend |

## Current delivery and open decisions
M0–M5 frontend work is implemented. See `docs/final_frontend_audit.md` for the final
checks, complete placeholder owner list, bundle measurements and verification limits.
The historical checkpoint reports preserve the checks performed at each milestone.

Engine owner decisions remain: authoritative evaluation run and metric definitions;
event/snapshot freshness budgets; missing calendar track/session/timezone fields;
degradation direction/window/pit-stop denominator; real inference endpoint and
response contract. Unknown values stay unavailable. These decisions do not prevent
using the completed frontend with explicitly labeled sample contracts.

## M1 design-system handoff
The shell and presentation layer now use the Telemetry Terminal tokens. The registry gained the canonical ID `tsunoda` from driver standings because points progression includes it while `drivers.json` does not. Its abbreviation is null; chart labels and team IDs are taken from standings by canonical ID. No display-name joins or invented initials are used for this identity mapping. `export_registries.py` emits the same corrected sample contract.

At M1 the five placeholder files were: `manifest.json` → `export_manifest.py`; `driver_registry.json` and `track_registry.json` → `export_registries.py`; `evaluation.json` → `export_evaluation.py`; `asset_manifest.json` → `export_asset_manifest.py`. All scripts live under `analytics_engine/src/export/placeholders/`. Those temporary unavailable routes were replaced during M3/M4 by the completed feature workspaces and labeled sample contracts described below.

`docs/m1_design_report.md` records presentation changes, browser checks, remaining limits and bundle measurements. `docs/asset_audit.json` lists existing missing asset references. Real exports are preserved; image failures use a labeled fallback and missing track layouts use the supplied placeholder image.


## M2 contracts and conservative limits
| Resource | Schema / fields | Status and owner | Consumer |
|---|---|---|---|
| momentum.json | 1.0.0 envelope; definition; drivers[].driverId; points[<=5]: raceId, round, nullable momentum/racecraft/delta, direction | Sample; placeholders/export_momentum.py; intended real source per-race power ratings | useMomentum / Home, Drivers, Teams |
| prediction_stages.json | 1.0.0 envelope; raceId, eventName, fieldSize; stages[].stage/snapshotId/modelId/modelVersion/generatedAt/predictions | Sample; placeholders/export_prediction_stages.py; intended frozen inference stages | useStages / Race Hub |
| season_stats.json | 1.0.0 envelope; season, seasonEntrants, currentLineup, teams, scheduledEvents, nullable uniqueCircuits, completedRaces, scope | Real counts of shipped files; placeholders/export_season_stats.py. Requires --force to regenerate an existing real count export. | useSeasonStats / Home |

Momentum fixtures are explicitly synthetic. Their delta is index points (not percentage points). A team's sample momentum is the arithmetic mean of the full listed roster only when every ID resolves and latest rounds agree. Counts use source status/active flags, not inferred outcomes. Standings entrant count and directory active-lineup count have different scopes. Unique circuits remains null because calendar track IDs are missing.

Calendar adapter derives a stable event key `YEAR-rROUND` from existing numeric round and date year; this does not infer a circuit identity. Optional session instants and track timezones remain null/empty when absent. The raw race CSV ends in 2024, so it cannot provide an authoritative 2026 calendar join. Circuit numeric IDs can, however, be mapped to public track IDs through the raw circuits CSV's exact `circuitRef`; that explicit mapping is stored in the track registry. Degradation scale/direction/window and pit-stop denominator are still unconfirmed, and pole conversion is unavailable.

Weather is adapted to canonical airTemperature/trackTemperature names, with observed/forecast/unknown kind. Missing session, lap count and stint age remain null. Legacy predictions keep their raw probability mass and unknown field denominator. Stage sample snapshots never inherit real weekend telemetry. A combined weekend view requires non-null matching event and snapshot IDs. The current real export cannot meet this condition, so its combined view remains suppressed.

Resource loading now reads the manifest first, cancels on unmount, shows a dev-only notice if the manifest is unavailable, and returns loading when a new loader or retry supersedes an older result. These rules preserve existing section independence.


## M3 Arena and comparison contracts
| File / resource | Version and fields | Units / null semantics | Owner and consumer |
|---|---|---|---|
| evaluation.json | 1.0.0 envelope; evaluationId, championId, sampleCount, dateRange.fromDate/toDate, metricDefinitions, baseline{id,label,accuracy}, models{id,version,accuracy,top3}, conflict | Canonical accuracy/top3 are fractions 0–1; legacy evaluation files remain percentages. Null champion means unresolved; zero eligible rows require unavailable metrics in the UI. | placeholders/export_evaluation.py → useEvaluation / Home and Arena |
| arena_history.json | 1.0.0 envelope; evaluationId, baselineId, modelIds, races[].raceId/eventName/season/round/stage/snapshotId/outcomeId/outcomeWinner/results[] | Each result: modelId, nullable modelVersion, nullable predictedWinner/winProbability, eligible, nullable correct/top3Covered, exclusionReason. Probability is a fraction. Unknown is not incorrect. | placeholders/export_arena_history.py → useArenaHistory / Arena |
| snapshots/<id>.json | 1.0.0 envelope; snapshotId, evaluationId, raceId, eventName, season, round, stage, frozenAt, predictions[].modelId/modelVersion/predictedWinner/winProbability | Frozen picks contain no recomputed model output. Missing model version remains unavailable; it is not borrowed from the current evaluation. | placeholders/export_arena_history.py → useFrozenSnapshot / Arena archive |
| outcomes/<id>.json | 1.0.0 envelope; outcomeId, raceId, eventName, winnerId, recordedAt | Sample outcomes are fictional fixtures, visibly labeled. Nullable winner cannot enter a performance cohort. | placeholders/export_arena_history.py → useOutcome / Arena archive |
| head_to_head.json | 1.0.0 envelope; season, metricDefinitions; drivers[].driverId/metrics/tracks[].trackId/metrics | Metrics contain nullable raw and normalized, sampleCount, minimumSamples, higherIsBetter, unit. Normalized is 0–100 on the raw direction; the frontend inverts lower-is-better axes. | placeholders/export_head_to_head.py → useComparison / Compare |

Arena excludes the same entire forecast row for all models if any required model is missing, ineligible, has unknown correctness, or lacks a winner pick, or if the outcome is missing. Per-model denominators therefore match. All-stage views count event-stage forecasts, not distinct races. Cumulative charts follow season/round/stage order. Filtered summary metrics and cards use the same selected cohort; the published evaluation date range remains archive provenance. Top-3 means winner inclusion in the model's top-three winner candidates; it does not mean overlap with the actual podium.

A real versioned evaluation (`meta.placeholder: false`) supersedes the unbound historical evaluation files. The sample evaluation keeps `conflict: true` and `championId: null`; no champion is selected from the conflicting legacy runs. Below-baseline warnings can operate once a real champion exists.

Archive services validate filename-safe IDs and verify requested IDs against parsed metadata and records. Exporter reruns skip existing snapshot/outcome files, including samples; updates require new immutable IDs. The sample files currently omit per-model frozen versions, so the archive explicitly displays unavailable rather than reading today's model version. Model IDs and winner IDs remain those stored in the frozen record.

Comparison rejects identical drivers, inverts lower-is-better normalized values, retains raw zeros, withholds sparse or directionless metrics, and reports track-specific sample counts. Selecting an unsupported track does not silently fall back to overall mastery. The deliberately sparse sample record is an availability fixture, not a claim about that real driver's experience.

All newly introduced M2/M3 analytics fixtures are clearly labeled sample. `season_stats.json` is the sole new real derived-count feed; it describes shipped file scopes rather than live championship truth.


## M4: Simulator and immutable stories

| File | Schema | Owner | Status | Consumer |
| --- | --- | --- | --- | --- |
| simulator_scenarios.json | 1.0.0; events, drivers, scenarios | placeholders/export_simulator_scenarios.py | Sample | data/services/simulation.ts |
| stories/index.json | 1.0.0; story headers | placeholders/export_stories.py | Sample | data/services/stories.ts |
| stories/<id>.json | 1.0.0; header, blocks, chartRefs, socialLinks | placeholders/export_stories.py | Immutable sample archive | data/services/stories.ts |

Simulator results bind snapshotId, raceId, driverId and integer gridPenalty (0..10).
Baseline/scenario entries contain canonical driverId, driverName and probability in
0..1; deltasPp are signed percentage points, schema-checked against the field.
Zero penalty must equal the frozen baseline. Model ID/version, ISO generatedAt,
assumptions and placeholder are required. Fixtures cover three supplied drivers at
all eleven penalties; unsupported combinations return unavailable. The browser
never constructs probability values. It ignores superseded requests, marks edited
inputs stale, preserves the previous result on failure and resets to the original
zero-penalty fixture. Sample field mass is shown raw, without normalization.

Set public VITE_SIM_API_URL to select the HTTP provider. The integration stub uses
GET with snapshotId, driverId and gridPenalty query parameters, validates the same
result contract and enforces input identity. This endpoint shape must be agreed
with the backend owner before enabling it. No credentials belong in Vite variables.

Story headers contain id, type, raceId, eventName, publishedAt, snapshotId, modelId,
nullable modelVersion, title and summary. Blocks are paragraph/heading text,
delta (nullable before/after fractions) or audit (immutable outcomeId). chartRefs
contain snapshotId and a plain-language summary. socialLinks contain reviewed
HTTP(S) links; samples have none. Null model versions remain unavailable, never
borrowed from the current evaluation. Article metadata binds its original event
and snapshot; audit joins suppress mismatched event IDs. No current evaluation
is fetched by an article. All four story types ship as explicit samples.

Published article files are never overwritten, even with --force. A changed
article needs a new ID; index generation reads the actual stored article headers.
The standard write guard protects a real index unless --force is intentional.
The scripts are not wired into production pipelines.


## M5: final structure and verification
The app entry and router live in `src/app/App.tsx`. Directory loaders now live in
`data/services/directories.ts`, with driver and track conversion in
`data/adapters/directories.ts`. The old components, pages, services and types
compatibility directories have no remaining source files. Real JSON archives are
preserved and validated even where their old UI consumers were retired.

`npm run audit` writes `docs/frontend_audit.json` and `docs/asset_audit.json`.
It checks source reachability (including static types and lazy imports), unresolved
imports, domain purity, presentational-layer data imports, fetch location, explicit
any, debug logging and exact asset-path casing. It reports existing missing asset
references separately from source failures. See the final audit for scope and limits.
