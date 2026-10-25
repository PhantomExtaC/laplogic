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
