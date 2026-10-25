# Data contracts — M0 checkpoint

## Swap-in procedure
Replace the relevant placeholder export body with real computation, preserve its schema in `web_app/src/data/schemas/index.ts`, run the export, and set `meta.placeholder: false` only when every value is real. Run `npm test` before shipping. Placeholder exporters refuse to overwrite real or unclassified legacy files unless `--force` is passed. They are not wired into the pipeline.

## Conservative provenance policy
Legacy data is never assigned a guessed event, season, model or timestamp. Missing provenance renders STALE / UNVERIFIED. No age threshold can establish freshness without a source timestamp. Combined Race Hub data is suppressed until event and snapshot IDs exist. Home and Race Hub use the same date-aware `nextEvent` function. Calendar dates have day precision; countdowns and timezone conversion wait for session instants.

A missing manifest is tolerated by the hook, but resources remain unverified. Manifest IDs currently remain null. Registry metadata is sample, although rows are derived from directories. Numeric circuit IDs have no proven mapping: `engineCircuitId: null` rather than inferred joins. Registries use explicit source abbreviations and IDs, never display names.

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
| legacy | real legacy | existing engine export; ownership map in outline.md | champion, models | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `asset_manifest.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| 1.0.0 | placeholder | analytics_engine/src/export/placeholders/export_asset_manifest.py | array of asset paths | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `calendar.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | round, grandPrix, date, sprintWeekend, status | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `constructor_standings.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | id, position, points, wins, teamName, nationality, imagePath | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `driver_registry.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| 1.0.0 | placeholder | analytics_engine/src/export/placeholders/export_registries.py | canonicalId, aliases, abbreviation, number | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `driver_standings.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | id, position, points, wins, driverName, driverNumber, nationality, currentTeamId, imagePath | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `drivers.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | id, fullName, image, nationality, number, abbreviation, currentTeamId, active, seasons, yearsActive, championships, raceEntries, raceStarts, wins, podiums, polePositions, fastestLaps, careerPoints, winRate, podiumRate, poleRate, fastLapRate, pointsPerEntry, currentPoints, dnfs, championshipYears | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `driverTrends.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | michael_schumacher, barrichello, ralf_schumacher, villeneuve, fisichella, zonta, wurz, gene, heidfeld, salo, button, diniz, mazzacane, frentzen, trulli, alesi, hakkinen, verstappen, coulthard, rosa, irvine, herbert, burti, raikkonen, panis, alonso, montoya, marques, bernoldi, enge, yoong, webber, sato, massa, mcnish, davidson, pizzonia, wilson, matta, firman, kiesa, baumgartner, klien, pantano, bruni, glock, karthikeyan, monteiro, friesacher, albers, liuzzi, doornbos, rosberg, speed, ide, montagny, yamamoto, kubica, hamilton, kovalainen, sutil, vettel, markus_winkelhock, nakajima, bourdais, piquet_jr, buemi, alguersuari, grosjean, badoer, kobayashi, hulkenberg, bruno_senna, petrov, grassi, chandhok, resta, ambrosio, maldonado, perez, ricciardo, vergne, pic, gutierrez, bottas, jules_bianchi, chilton, garde, kevin_magnussen, kvyat, ericsson, lotterer, stevens, nasr, sainz, max_verstappen, merhi, rossi, jolyon_palmer, wehrlein, haryanto, vandoorne, ocon, giovinazzi, stroll, gasly, brendon_hartley, leclerc, sirotkin, norris, albon, russell, latifi, aitken, pietro_fittipaldi, tsunoda, mick_schumacher, mazepin, zhou, de_vries, sargeant, piastri, lawson, bearman, colapinto, doohan, antonelli, bortoleto, hadjar, arvid_lindblad | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `evaluation.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| 1.0.0 | placeholder | analytics_engine/src/export/placeholders/export_evaluation.py | evaluationId, championId, sampleCount, models, conflict | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `evaluation_metrics.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | totalRaces, baselineAccuracy, champion, models | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `insights.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | driverId, powerRating, mastery, profile | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `manifest.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| 1.0.0 | placeholder | analytics_engine/src/export/placeholders/export_manifest.py | snapshotId, season, nextRaceId, championModelId, evaluationId, resources | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `next_race.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | round, grandPrix, trackId, country, date, weather | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `pointsProgression.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | round, albon, alonso, antonelli, arvid_lindblad, bearman, bortoleto, bottas, colapinto, gasly, hadjar, hamilton, hulkenberg, lawson, leclerc, max_verstappen, norris, ocon, perez, piastri, russell, sainz, stroll | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `predictions.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | driverId, driverName, winProbability, predictedPosition, insights | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `stats.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | season, drivers, teams, tracks, completedRaces, remainingRaces | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `teams.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | id, name, principal, base, engine, driverIds, wins, podiums, championships, points, active, logo | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `track_registry.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| 1.0.0 | placeholder | analytics_engine/src/export/placeholders/export_registries.py | canonicalId, aliases, engineCircuitId | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `tracks.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | id, name, city, country, lengthKm, turns, direction, circuitType, firstGrandPrix, lastGrandPrix, racesHeld, lapRecord, layoutImage, active | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `tracksDeg.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | circuitId, tireDegradationIndex, isStreetCircuit, averagePitStops | schemas/index.ts; compatibility services or data/services; unused archives validated only |

### `weekend_state.json`

| Version | Status | Owner | Fields | Consumer |
|---|---|---|---|---|
| legacy | real legacy | existing engine export; ownership map in outline.md | track, weather, telemetry | schemas/index.ts; compatibility services or data/services; unused archives validated only |

## Deferred milestones and open decisions
M1–M5 remain: Telemetry Terminal design, full primitives/charts, directories, stages, momentum, season stats, Arena, Compare, Simulator, Insights and cleanup. No sample analytics for these later milestones have been introduced yet.

Engine owner decisions: authoritative evaluation run and exact metric definitions; event/snapshot metadata and freshness budgets; circuit-ID mapping; degradation direction/window/pit-stop denominator; inference endpoint and response contract. Unknown values stay unavailable.

## Verification scope
Contract tests validate every shipped JSON resource, numeric zero, aliases used by predictions and telemetry, date-aware next-event logic, lap-time units and probability mass. Server-rendered component tests cover boundary status and sample labeling. Network tests cover HTTP, parse, schema and network errors. Browser widths, keyboard interaction and reduced motion are pending M1; no visual verification is claimed.

M0 production bundle before route splitting: approximately 708 kB JS / 211 kB gzip. Vite reports a chunk-size warning; route splitting is scheduled for M1.


## M1 design-system handoff
The shell and presentation layer now use the Telemetry Terminal tokens. The registry gained the canonical ID `tsunoda` from driver standings because points progression includes it while `drivers.json` does not. Its abbreviation is null; chart labels and team IDs are taken from standings by canonical ID. No display-name joins or invented initials are used for this identity mapping. `export_registries.py` emits the same corrected sample contract.

There are still five placeholder files: `manifest.json` → `export_manifest.py`; `driver_registry.json` and `track_registry.json` → `export_registries.py`; `evaluation.json` → `export_evaluation.py`; `asset_manifest.json` → `export_asset_manifest.py`. All scripts live under `analytics_engine/src/export/placeholders/`. Pending Arena/Compare/Simulator/Insights pages render no analytics and are labeled unavailable; they do not pretend to be sample implementations.

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
