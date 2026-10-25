# LapLogic web_app improvement plan

Reviewed: 23 October 2026. Status: proposal only; no application changes implemented.

## Scope and review method

This plan translates the supplied **LapLogic: Brand Identity & Strategic Roadmap** into functional work for the existing React/Vite app. All seven pages, all 19 component files (including two empty simulator files), all ten services, all thirteen type files, application entry points, styles, configuration, public JSON datasets, and asset filenames/references were reviewed. Dependencies in `node_modules` were excluded; images were inventoried and references checked, not visually inspected individually.

Only this root-level `improvement.md` is created. Keep `web_app` untouched while the other model completes its analysis. No builds, installs, generators, or application tests were run because this is a read-only source review and those commands can produce files. Findings describe the observed snapshot; reconcile them with concurrent work before implementation. Backend capabilities described in the brief are requirements/context, not independently verified production capabilities.

## 1. Priority: establish trustworthy data before adding features

### P0 — Repair evaluation contracts and resolve champion identity

Evidence: `src/components/cards/EvaluationCard.tsx` reads `rfAccuracy`, `rfTop3Coverage`, and `isOutperforming`. `public/data/evaluation_metrics.json` instead contains nested `models`, names XGBoost champion, and reports RF 48.3%, XGBoost 51.7%, baseline 60%, over 60 races. `arena_metrics.json` names Random Forest champion and reports 62.5% versus XGBoost 45.8%. The supplied brief also calls Random Forest champion. These cannot be displayed interchangeably as the same evaluation.

Plan:

- Define one versioned evaluation contract and publish model ID/version, evaluation ID, date range, sample count, metric definitions, baseline, and selected champion together.
- Determine whether files represent different runs or stale exports with the engine owner. Do not pick the most flattering accuracy or hardcode the brief's numbers.
- Read the champion dynamically across Home, Race Hub, prediction cards, and Arena. Explicitly show when the champion is below the grid baseline.
- Clarify whether “Top-3 coverage” means the actual winner appeared among three picks or coverage of actual podium finishers. Do not label these as equivalent.
- Replace the hardcoded “2024-2026” title with metadata. On unavailable metrics, render an explanatory error with retry rather than hiding the card.

Acceptance: a known evaluation fixture renders all values correctly; conflicting evaluation IDs are flagged; missing values never render as `undefined%`; champion and baseline comparisons agree everywhere.

### P0 — Publish a coherent race/season snapshot

Evidence: Home hardcodes 22 drivers, 11 teams, 24 circuits, and 2026. `stats.json` reports 20 drivers and 10 teams. Calendar contains 23 entries; standings contain 23 drivers while the driver directory contains 22. These counts may have different valid meanings, so define scope before reconciling. `next_race.json` points to Belgium on 26 July, while Calendar's first upcoming entry is Italy on 6 September and `weekend_state.json` names Italy. Both dates precede this review date, but statuses remain upcoming. Predictions carry no event identity.

- Add a manifest with `schemaVersion`, `snapshotId`, `season`, `raceId`, `round`, `generatedAt`, `dataThrough`, session/stage, and model/evaluation references.
- Publish a complete validated snapshot atomically; avoid mixing newly generated predictions with older weather, calendar, and evaluation files.
- Choose one source for next-event selection. Sort by scheduled instant and status, handle ongoing/cancelled/postponed events and season completion, and distinguish historical snapshot mode from current data.
- Bind every prediction and weather/telemetry block to its event. Suppress mismatched combinations and show stale-data context.
- Derive counts from season-scoped sources. Label season entrants versus current lineup and scheduled events versus unique circuits separately.

Acceptance: Home and Race Hub resolve the same race and snapshot; old data shows an as-of label; failed calendar loading never claims “Season Completed.”

### P0 — Validate contracts and identifiers at the boundary

- `fetchJson<T>` only casts JSON; add runtime validation and small adapters for exported engine schemas.
- Driver IDs vary across datasets: predictions use `nor`, telemetry uses abbreviations, directory/progression use longer IDs such as `max_verstappen` and `arvid_lindblad`; chart colors include `verstappen` and `lindblad`. Establish canonical IDs plus explicit source aliases, never display-name joins.
- Driver type requires fields absent from sample exports (`dateOfBirth`, `age`, `raceFinishes`, `poles`); exports use `polePositions`. Standings type calls driver numbers strings while JSON supplies numbers. Correct the contracts and mark genuinely unavailable values nullable.
- Track type/card use `layout`, while JSON supplies `layoutImage`; JSON uses `turns` rather than `corners` and lacks some declared fields. Correct the adapter before adding analytics.
- `lapRecord.milliseconds` contains values such as 69.593 for 1:09.593; confirm units and rename or convert before any numeric comparisons.
- Unify `Race` and `RaceEvent`, including cancellation support and real track/country identifiers; stop filling absent links with fabricated `unknown-track` IDs.
- Unify weather field names across `weather.ts` and `weekend.ts`, including units and forecast versus observation semantics.

Acceptance: invalid payloads produce a usable unavailable state, zero remains zero, every join resolves or is explicitly unknown, and unit conversions have documented fixtures.

## 2. Page-by-page functional recommendations

Paths below are relative to `web_app`.

| Page | Current behavior / gap | Proposed functional change | Priority |
|---|---|---|---|
| `src/pages/Home.tsx` | Standings dominate; predictions appear near the bottom as three inline rows; standings gate the whole page; errors largely go to console. | Make the champion prediction the opening dashboard feature, followed by race context, five-race momentum, and Arena summary. Give sections independent loading/error/retry states. Reuse prediction/race components and derive season stats. Link to full race predictions and audit. | P0/P1 |
| `src/pages/RaceHub.tsx` | Static weekend/weather/long-run tables; failed weekend request stays on “Loading”; zero insight values become N/A through truthiness checks; fixed RF title and ten-driver slice. | Separate errors from loading; use null checks; show full available field with count/coverage and optional top-ten view. Add pre-weekend/post-qualifying selector, qualifying delta, timestamps, session provenance, forecast freshness, tire degradation and pole conversion context. Explain feature units/direction. Show fastest sectors only with session/timing provenance. | P0/P1 |
| `src/pages/Drivers.tsx` | Active filter and name/win sorting; no search, comparison, trend view, or request errors; render-time debug logging. | Add search, team/season filters, points/momentum sorting, five-race trends, and comparison selection. Separate career from season stats; default public view to current lineup with an archive option. Persist filters in URL; remove debug output during implementation. | P1/P2 |
| `src/pages/Teams.tsx` | Directory with active filter and wins sorting; joins driver IDs; season points context unclear. | Add search, current-season standings/momentum view, driver/profile links, season selector, and explicit career/season labels. Surface unmatched roster records. Later expose reliability and mechanical-DNF trends when exported. | P1/P3 |
| `src/pages/Tracks.tsx` | Historical directory with name/length/recency sorting; missing lengths sort as zero. | Distinguish current calendar from archive, add search/country/type filters, push unknown lengths behind known values, and add track detail links. Display tire degradation, pit-stop assumptions and historical pole-to-win conversion with sample/window context. | P1 |
| `src/pages/Calendar.tsx` | Table only, no loading/error states, `any` adapter and invented fallback fields. | Provide upcoming/completed filters, season selection, event links to Race Hub and audits, session schedule, local/track timezone toggle, sprint-specific timings, and calendar export once start times exist. Add explicit cancelled/postponed handling. | P0/P1 |
| `src/pages/Simulator.tsx` | Three free-text inputs; Simulate button has no handler and produces no result. | Implement the grid-penalty scenario described below using typed controls and genuine inference. Until available, show an honest unavailable/coming-soon state instead of an inert action. | P1 interim / P2 full |

### New public experiences required by the brief

1. **Arena Tracker:** dedicated route with champion/challenger/baseline comparison, cumulative and per-race accuracy, filters by season and prediction stage, and links to immutable prediction snapshots and outcomes. Both models and baseline must use the same eligible race cohort. Show exclusions and denominators. Existing aggregate files cannot support historical charts without additional exports.
2. **Momentum ticker:** reusable Home/Drivers block with last five completed races, absolute values and change, direction meaning, as-of round, and a small trend chart. Existing `driverTrends.json` contains histories including historical drivers and six-value samples; it needs race labels, season scope, canonical IDs, and a defined five-race window. Do not silently treat arbitrary history as current form.
3. **Head-to-head:** two driver selectors, track/season context, normalized radar of racecraft, track mastery and momentum, plus raw-value table and sample sizes. Existing `insights.json` provides racecraft and mastery aggregates but does not establish every requested track-specific comparison. Define whether lower or higher values are better and normalize consistently. Handle rookies/insufficient samples; prevent accidental same-driver comparison.

## 3. Every existing component: recommended responsibility

| Component under `src/components` | Finding and planned behavior |
|---|---|
| `cards/DriverCard.tsx` | Add driver detail/compare actions, team link, season points label, momentum summary and career-stat labels. Add missing-image fallback, lazy loading and fixed image dimensions. |
| `cards/EvaluationCard.tsx` | Apply P0 schema repair; become a reusable summary of the selected evaluation, with metric definitions, baseline delta and Arena link. Keep the detailed history in Arena. |
| `cards/PredictionCard.tsx` | Currently unused winner/probability display. Expand into the shared champion prediction surface: event, prediction stage, model version, top contenders/full-field action, probability bars, update time and pre/post-qualifying change. Validate probability bounds and explain that probability rank is not a full finishing-order forecast. |
| `cards/RaceCard.tsx` | Currently unused static strings. Reuse for canonical next-event context; format dates/timezones, show session status/countdown, forecast timestamp and Race Hub action. |
| `cards/SectionCard.tsx` | Support contextual actions, status/as-of text and heading levels. Make the pulsing red dot conditional on actual alert/live state; static cards must not imply live feeds. Respect reduced motion. |
| `cards/StandingsTable.tsx` | Retain entity IDs for keys/links rather than position. Add season/as-of caption, sort controls, accessible column headers, team context, wins and position change where supplied. Provide mobile overflow and empty/error states. Home currently passes wins that the component ignores. |
| `cards/StatCard.tsx` | Support units, time scope, optional explanatory text and unavailable values. Replace hardcoded Home figures through validated season data. |
| `cards/TeamCard.tsx` | Add constructor/driver links, season position, points gap and momentum. Separate career totals from selected-season values; provide image fallback and empty-roster state. |
| `cards/TrackCard.tsx` | Fix `layoutImage` mapping and missing assets. Add current-calendar indicator, track-profile action, degradation and pole-conversion context. Distinguish historical participation from current calendar membership. |
| `charts/PointsProgressChart.tsx` | Current view assumes last row is latest and limits to six automatically. Sort/validate rounds, resolve canonical names/colors, add driver selection and legend toggles, season/round filters and a table alternative. Separate empty from loading; improve dark-line contrast and use line patterns. Avoid implying interpolated intermediate championship points are observed results. |
| `layout/Card.tsx` | Shared basic surface; standardize its visual tokens and semantic heading options with SectionCard, avoiding a second competing card system. |
| `layout/Footer.tsx` | Replace Fanalytics branding with LapLogic; add methodology, data sources, audit archive and configured social links. Show copyright year consistently and distinguish site time from dataset freshness. |
| `layout/Hero.tsx` | Unused Fanalytics hero duplicates Home. Convert to a shared LapLogic hero containing the selected race and a clear predictions action, or retire it when consolidating Home. |
| `layout/Navbar.tsx` | Make brand a Home link, add Arena/Compare/Insights navigation as those routes ship; mobile menu needs expanded/control attributes, Escape handling and visible keyboard focus. Include a skip-to-content link and compact season/race context. |
| `layout/PageContainer.tsx` | Currently unused. Adopt one main landmark and consistent responsive gutters; avoid nesting another main in Race Hub. Add route heading/focus handling. |
| `layout/PlaceholderCard.tsx` | Unused generic placeholder. Replace with deliberate unavailable/loading/coming-soon states and a meaningful next action; never show it as working analytics. |
| `layout/ScrollWrapper.tsx` | Add a named, keyboard-reachable scroll region and overflow cue when needed. Avoid blanket nowrap for prose, and centralize scrollbar styles. Prefer stacked summaries on phones where a wide table is unnecessary. |
| `simulator/SimulatorForm.tsx` | Empty file. Implement labeled driver/event selectors, bounded grid penalty control with numeric alternative, baseline summary, validation, reset and submission state. Enable weather only when inference supports it. |
| `simulator/SimulatorResults.tsx` | Empty file. Show baseline versus scenario probabilities, percentage-point changes, affected field, assumptions/model version and input snapshot. Announce completion; keep an old result explicitly marked stale when inputs change. |

## 4. Services, contracts, datasets and assets

### Existing service coverage

| Service | Planned improvement |
|---|---|
| `fetchJson.ts` | Validate response schemas, classify network/parse/schema errors, support cancellation and request timeout, and expose actionable errors. Add request deduplication/cache keyed by snapshot; make refresh explicit. |
| `calendar.ts` | Return the unified event contract with season, stable event/track IDs, sessions, timezone and full status union. |
| `drivers.ts` | Adapt actual export fields; preserve canonical IDs and season/career distinctions; expose missing data explicitly. |
| `teams.ts` | Validate roster references and selected-season values; keep historical team identity/renaming separate from current constructor labels. |
| `tracks.ts` | Normalize image field, turns, lap-record units and optional properties; map engine circuit IDs to public IDs. |
| `standings.ts` | Use the same validated fetch/error layer as other services; retain IDs and snapshot metadata for standings and links. |
| `progression.ts` | Validate chronological rounds, finite points and driver IDs; distinguish missing data from a genuine zero score. |
| `predictions.ts` | Return a versioned event/model/stage envelope rather than an unqualified array; expose coverage, probability semantics and immutable snapshot reference. |
| `nextRace.ts` | Currently unused; consolidate with canonical calendar/event selection rather than maintaining a contradictory next-race feed. |
| `stats.ts` | Currently unused; reconcile definitions and compute/publish validated season counts before wiring it into Home. |

Add services/types for evaluations, trends, insights, degradation, published stories and simulation only when their contracts exist. Replace direct casts in Race Hub/EvaluationCard with these adapters. Review all current types: `calendar`, `driver`, `evaluation`, `nextRace`, `prediction`, `progression`, `race`, `standings`, `stats`, `team`, `track`, `weather`, and `weekend` against actual payloads, rather than changing declarations alone.

### Dataset-specific follow-up

- `predictions.json`: only ten entries, totaling 0.984 probability in this snapshot. Establish whether this is truncated, independently scored, or rounded; publish full-field coverage and calibration semantics. Do not silently normalize these values to 100% in the UI.
- `evaluation_metrics.json` and `arena_metrics.json`: consolidate/version as in P0; aggregate values alone cannot establish promotion criteria or historical accuracy.
- `drivers.json`, `teams.json`, `driver_standings.json`, `constructor_standings.json`: reconcile as-of dates; e.g. driver-directory points differ from standings. Preserve valid historical entrants while separating current roster views.
- `calendar.json`, `next_race.json`, `weekend_state.json`: align event IDs and snapshot freshness. Add telemetry session, lap counts, stint age, compound and filtering assumptions; raw averages across differing compounds are not automatically comparable long-run pace.
- `stats.json`: reconcile 20/10 counts with directory 22/11 and selected-season scope.
- `pointsProgression.json`: align round coverage and names with standings and canonical driver registry.
- `driverTrends.json`, `insights.json`: currently unconsumed by the app; qualify time windows and metric direction before using them for momentum and comparisons.
- `tracks.json`, `tracksDeg.json`: map string numeric circuit IDs to public track IDs; define degradation scale and whether average pit stops are field totals or per-driver figures before displaying them.
- Public images: many track `layoutImage` targets and standings image paths do not exist; only a track placeholder is present in the track image directory. Add an asset manifest, verify paths on a case-sensitive deployment, and reuse supplied season-specific car/driver artwork through an explicit season mapping. Do not infer season from a driver's current number. Repair the referenced but absent `/favicon.svg`.

## 5. Interactive simulator: required backend work

The current app fetches static JSON; it has no inference integration. The web simulator must call a server-side service using the promoted model and the same feature transformations as official predictions.

1. Accept event/snapshot/model references, canonical driver ID and a bounded grid penalty. Keep a baseline immutable.
2. Apply the penalty to a legal full-field grid, including displaced competitors and declared tie-breaking rules. Recompute dependent features consistently; changing a label alone is not inference.
3. Return baseline and scenario outputs for the field, model version, assumptions and generation time. Define whether outputs are calibrated win probabilities or model scores.
4. Validate unsupported/stale events, rate-limit/cache repeated scenarios, and cancel or ignore superseded responses so older requests cannot overwrite newer scenarios.
5. Support reset/shareable inputs and a keyboard-accessible slider. Label results hypothetical and avoid invented numerical confidence intervals.

Acceptance: identical inputs/model produce reproducible results; illegal grids are rejected; reset restores baseline; request failure preserves an explicitly labeled previous result; a changed input cannot display an old result as current.

## 6. Media and predictive journalism

Add a race-linked Insights/Audits archive and article view with four content types matching the brief: Tuesday track profile, Thursday pre-weekend projection, Saturday post-qualifying recalibration, and Monday model audit. Treat these as editorial targets, not rigid promises independent of actual session times.

- Store published stories with event ID, content type, publication time, author/editor status, model/prediction snapshot references, chart assets and verified social destinations.
- Show qualifying changes as before/after percentage-point deltas. Monday audits compare frozen pre-race picks with actual results; distinguish observed incidents from evidence-backed explanations of model errors.
- Provide deep links from social posts to a specific story/race state, share previews, accessible chart summaries and a return path to the full data.
- Produce portrait 9:16 Plotly assets and video via the external OpenCV/MoviePy pipeline described in the brief. Keep rendering jobs outside browser requests; serve completed assets with transcripts/captions and poster images. A CMS is optional; versioned published JSON/Markdown is a reasonable first release.

Acceptance: archived stories continue to resolve to the original prediction and model after a new champion or race snapshot is published.

## 7. Brand, accessibility and application shell

- Apply shared tokens in `src/index.css`: Obsidian `#09090B`, Charcoal `#1C1C1E`, Telemetry Red `#EF4444`, Sector Green `#22C55E`, DRS Amber `#F59E0B`. Retain distinct tire-compound colors with text labels. Fix Calendar's light hover backgrounds/dark-theme text contrast.
- Load the chosen prose and numeric fonts explicitly: Inter/Roboto for prose and headings, JetBrains Mono/Fira Code for telemetry, with tabular numerals. Current CSS names Inter but does not load it.
- Keep status meaningful: red alerts/brand, green validated success/champion, amber challenger/warnings; never convey status only through color. Verify contrast, keyboard order, input labels, touch targets, reduced motion and screen-reader summaries.
- `App.tsx`: add not-found and recovery routes, shared page shell and route-level error handling; introduce Arena/Compare/Insights as ready. Consider lazy-loading chart-heavy routes after measuring the bundle.
- `main.tsx`: retain StrictMode and make data requests tolerate effect cleanup/cancellation. Add an appropriate top-level recovery boundary.
- `index.html`: replace generic fanalytics title, repair favicon, add LapLogic description and sharing metadata. Published race/story pages need crawlable per-page metadata; choose prerendering where justified rather than rebuilding the entire app immediately.
- `vite.config.ts` / deployment: retain the existing stack; verify SPA deep-link fallback on Vercel, static asset paths and cache behavior. Keep API credentials/server inference outside the public bundle.
- `package.json` / lockfile: preserve reproducible installs and current dependencies until implementation requires changes. Add meaningful validation commands when features land, not dependency upgrades as a substitute for product work.
- `tsconfig*.json` / `eslint.config.js`: retain unused-code and hook checks, remove unsafe `any`/casts through schema adapters, and tighten checks incrementally. Review the unused `layout` include. `.gitignore` should continue excluding dependencies and output.

## 8. Delivery sequence and verification gates

| Milestone | Deliverable | Dependencies / completion gate |
|---|---|---|
| M0: data trust | Evaluation repair, canonical IDs, schema adapters, snapshot/event metadata, error states, asset mapping | Engine/export owner resolves conflicting champion runs and source freshness. Invalid/mismatched fixtures are rejected; no undefined metrics or endless loading. |
| M1: brief Phase 1 | Prediction-led Home, shared prediction/race cards, Arena summary/history, five-race momentum, functional directories/calendar, coherent LapLogic shell | Versioned complete prediction/evaluation/trend exports. All pages identify season/race/as-of state and work on mobile and keyboard. |
| M2: brief Phase 2 | Grid-penalty simulator and head-to-head visualizer | Genuine inference endpoint and comparable feature definitions. Scenario and comparison acceptance criteria pass with sparse/rookie data. |
| M3: growth pipeline | Track profiles, projections, recalibrations, audit archive, social deep links and completed media assets | Immutable prediction/outcome archive plus editorial publishing workflow. Old stories remain reproducible. |
| M4: future engineering | Bradley-Terry outputs, forecast-aware inference, cached FP2 summaries, constructor reliability | Engine contracts/validation first. Display pairwise probabilities as pairwise results, not automatically as race win probabilities. Matchup counts must derive from field size: n(n-1)/2, rather than hardcoding the brief's 190 for every field. |

For implementation, use focused contract and integration tests: real export fixtures, malformed/missing values, zero insights, mismatched snapshots, promotion changes and probability semantics. Add end-to-end coverage for deep links, data failure/retry, season completion, comparison selection and simulator request ordering. Manually inspect phone/tablet/desktop, keyboard and reduced-motion behavior. Run type checking, lint and production build after implementation; then verify deployed deep links and case-sensitive assets. These checks are proposed, not claimed to have run in this review.

## 9. Coordination before implementation

Re-read the other model's findings and current files before assigning changes. Agree on the authoritative evaluation run, canonical event/driver/track IDs, metric definitions, data freshness rules and actual inference availability with the engine owner. Start with M0 as a separate reviewable change, then ship each milestone independently. None of these proposed application changes are authorized for execution by this document alone; the current request is planning only.
