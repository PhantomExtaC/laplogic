# LapLogic Frontend Rebuild: Implementation Prompt

> Paste this whole file into your coding agent (Claude Code or similar) at the repo root.
> Date of writing: 24 Oct 2026. Inputs: `outline.md` (repo map) and `improvement.md` (review of `web_app`).
> `improvement.md` was a proposal only. **This prompt authorizes implementation.**

---

## 0. Role and mission

You are a senior front-end and data-platform engineer working on **LapLogic** (repo folder `Fanalytics/`), an F1 predictive-analytics product. The React/Vite app in `web_app/` is a static dashboard that reads JSON exported by the Python `analytics_engine/`.

**Mission:** turn `web_app/` into a modular, contract-driven, trustworthy analytics front end that:

1. Shows **accurate** F1 analytics, with no invented numbers, no silent fallbacks and no mismatched snapshots.
2. Is easy to extend. Adding a page, chart or JSON feed should touch a small, predictable set of files.
3. Lets me swap in real Python exports later with **zero front-end changes** wherever a placeholder exists.
4. Uses one consistent design language (the "Telemetry Terminal" language in section 4).

Read before you write: `outline.md`, `improvement.md`, then the actual `web_app/src`, `web_app/public/data/*.json`, and `analytics_engine/src/export/*.py`. **If this prompt contradicts the real code or data, trust the code and data, tell me, and adapt.**

---

## 1. Non-negotiable rules

### 1.1 Accuracy and honesty
- **Never fabricate analytics.** Never hardcode accuracy figures, probabilities, counts, driver names or champion model names. Everything shown comes from JSON, or is derived from JSON in a documented way.
- **Placeholder data must be visibly labeled.** Every placeholder JSON carries `"meta": { "placeholder": true, ... }`. Any UI that renders placeholder data shows a persistent `SAMPLE DATA` chip (DRS Amber) on that card or section. When the real export replaces the file (`placeholder: false`), the chip disappears automatically.
- **Missing is not zero.** Use `null` for unavailable values and render `—` with an accessible label. Never use truthiness checks on numbers. A real 0 must render as 0.
- **Never pick the flattering number.** `evaluation_metrics.json` and `arena_metrics.json` currently disagree on the champion (XGBoost vs Random Forest). Do not choose between them. Build one versioned evaluation contract (section 3.3). Until the engine owner resolves it, show a visible "conflicting evaluation runs" warning rather than a guess.
- **Probabilities:** do not silently renormalize. `predictions.json` currently sums to about 0.984 over 10 drivers. Display raw values and show coverage ("Top 10 of N drivers, 98.4% of probability mass").
- **Bind every prediction, weather and telemetry block to an event ID and snapshot ID.** If they mismatch (for example, Italy weekend telemetry with Belgium predictions), suppress the combined view and show a stale-data banner.
- **Never join on display names.** Use canonical IDs plus explicit alias tables.
- **Units:** `lapRecord.milliseconds` holds values like 69.593 (seconds, not ms). Fix this in the adapter, name the field correctly, and add a fixture test.

### 1.2 Engineering
- Keep the stack: Vite, React 19, TypeScript strict, Tailwind v4, react-router 7, recharts 3, lucide-react, clsx.
- You may add: `zod` (runtime validation) and `vitest` + `@testing-library/react` (tests). Do not add other dependencies without asking.
- No `any`. No unchecked casts of fetched JSON. No `console.log` left in committed code.
- **Do not edit** anything in `analytics_engine/` except the placeholder export scripts and shared helper described in section 6. Do not touch `analytics_engine_legacy/`, `fanalytics/` (venv), `f1_cache/` or `node_modules/`.
- Do not delete the real JSON files. Evolve schemas through adapters. If an engine export is wrongly shaped, write an adapter and list the discrepancy in `docs/data_contracts.md`.
- Work in the milestone order in section 8. Each milestone must compile (`tsc -b`), lint, test and build before you move on.

---

## 2. Target architecture: modular, with one-way data flow

Data flows in one direction. No component ever calls `fetch` itself.

```
public/data/*.json
   -> data/client (fetch + timeout + abort + error classification)
   -> data/schemas (zod: validate raw payload)
   -> data/adapters (raw -> clean domain models, canonical IDs, units)
   -> data/services (one typed function per resource)
   -> data/hooks (useResource: loading | ready | error | stale | placeholder)
   -> features/<name> (page + feature-specific components)
   -> ui/ + charts/ (dumb, prop-driven, no data access)
```

### 2.1 Folder structure (introduce incrementally; avoid a big-bang move)

```
web_app/src/
├─ app/                  # App.tsx, router, AppShell, ErrorBoundary, NotFound
├─ config/               # tokens.ts (mirrors CSS vars), routes.ts, features.ts (feature flags)
├─ data/
│  ├─ client/            # fetchJson.ts (timeout, AbortSignal, typed DataError)
│  ├─ schemas/           # zod schema per JSON file
│  ├─ adapters/          # raw -> domain (one file per resource)
│  ├─ registry/          # drivers.ts, teams.ts, tracks.ts (canonical ID + aliases)
│  ├─ services/          # getX() functions, wrap client + schema + adapter
│  └─ hooks/             # useResource.ts, useSnapshot.ts, useDriverRegistry.ts
├─ domain/               # pure TS types and pure functions (no React)
│  ├─ types/             # Driver, Team, Track, RaceEvent, Prediction, Evaluation...
│  └─ logic/             # nextEvent.ts, probabilityCoverage.ts, headToHead.ts, formatters.ts
├─ ui/                   # design-system primitives (section 4.4)
├─ charts/               # chart components built on recharts (section 4.5)
├─ features/
│  ├─ home/  race-hub/  arena/  drivers/  teams/  tracks/
│  ├─ calendar/  compare/  simulator/  insights/
│  └─ (each: <Name>Page.tsx, components/, hooks/, index.ts)
└─ styles/               # index.css (tokens + base), fonts
```

Rules:
- `domain/` imports nothing from React or `data/`.
- `ui/` and `charts/` import only from `domain/types`, `config/` and `styles/`.
- `features/*` may import from `data/hooks`, `domain`, `ui` and `charts`. **Features never import from each other.** Shared pieces are promoted into `ui/` or `domain/`.
- Every feature exposes only its page through `index.ts`. Routes are declared once in `config/routes.ts` and consumed by the router and Navbar, so adding a page means editing one registry entry.
- Keep the existing `pages/` and `components/` paths working until each is migrated. Migrate one feature at a time and delete the old file in the same commit.

### 2.2 The `useResource` contract

```ts
type ResourceState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: DataError; retry: () => void }
  | { status: 'ready'; data: T; meta: DataMeta; isPlaceholder: boolean; isStale: boolean };
```

- Each section of a page uses its **own** resource. Standings failing must not blank the page.
- Cancellation via AbortController on unmount. Tolerate React StrictMode double-invoke.
- `isStale` is derived from `meta.generatedAt`/`dataThrough` against the manifest snapshot.
- Provide one `<ResourceBoundary state={...}>` component that renders skeleton, error with Retry, placeholder chip and stale banner consistently, so pages stop re-implementing this.

---

## 3. Data layer and contracts

### 3.1 Shared metadata envelope
All **new** JSON files use this envelope. Adapters wrap legacy array-style files into the same shape internally.

```json
{
  "meta": {
    "schemaVersion": "1.0.0",
    "snapshotId": "2026-R17-ITA-post-quali",
    "season": 2026,
    "raceId": "2026-17-monza",
    "round": 17,
    "stage": "pre-weekend | post-fp2 | post-quali | post-race",
    "generatedAt": "2026-10-24T08:00:00Z",
    "dataThrough": "2026-09-05T15:00:00Z",
    "modelId": "rf-v1",
    "placeholder": false,
    "source": "analytics_engine/src/export/<script>.py"
  },
  "data": { }
}
```

### 3.2 Manifest
`public/data/manifest.json` is the single entry point: current `snapshotId`, `season`, `nextRaceId`, `championModelId`, `evaluationId`, and a map of resource name -> filename + schemaVersion. The front end loads it first and uses it to detect mismatched snapshots. If it is missing, fall back to per-file metadata and show a "No manifest" notice in dev only.

### 3.3 Canonical contracts to implement (schema + adapter + service + type + fixture)

| Resource | File | Status | Notes |
|---|---|---|---|
| Manifest | `manifest.json` | **Placeholder** | See 3.2 |
| Driver registry | `driver_registry.json` | **Placeholder** | `canonicalId`, `ergastRef`, `abbreviation`, `number`, `aliases[]` (for example `nor`, `NOR`, `lando_norris`, `norris`). Covers all IDs seen in predictions, telemetry, progression, chart colors |
| Track registry | `track_registry.json` | **Placeholder** | Maps numeric engine circuit IDs, `tracks.json` slugs and `tracksDeg.json` IDs to one public ID |
| Evaluation | `evaluation.json` | **Placeholder** | `evaluationId`, date range, `sampleCount`, metric definitions (including exact meaning of "Top-3 coverage"), `baseline`, `models[]` (id, version, accuracy, top3), `championId`. Replaces the dual evaluation/arena files. Adapter can read legacy `evaluation_metrics.json` and flag conflicts against `arena_metrics.json` |
| Arena history | `arena_history.json` | **Placeholder** | Per-race rows: `raceId`, `stage`, per model + baseline `predictedWinner`, `winProbability`, `correct`, `eligible`; exclusions with reasons. All models must share one eligible cohort |
| Predictions | `predictions.json` | **Real, wrap** | Adapter turns the bare array into `{meta, data}`; add `coverage`. Map `nor` -> canonical ID via registry |
| Prediction stages | `prediction_stages.json` | **Placeholder** | Per stage (pre-weekend, post-FP2, post-quali): per-driver win probability, for before/after pp deltas |
| Momentum | `momentum.json` | **Placeholder** | Last 5 completed races per current driver: `raceId`, `round`, `momentum`, `racecraft`, `delta`, `direction` meaning documented. Distinct from `driverTrends.json` |
| Head-to-head | `head_to_head.json` | **Placeholder** | Per driver: normalized racecraft, track mastery (per track where available), momentum, plus raw values, sample sizes, `higherIsBetter` flags |
| Season stats | `season_stats.json` | **Placeholder** | Derived counts with labeled scope: `seasonEntrants`, `currentLineup`, `teams`, `scheduledEvents`, `uniqueCircuits`, `completedRaces`. Replaces hardcoded Home numbers |
| Simulator scenarios | `simulator_scenarios.json` | **Placeholder** | Fixture table: for a sample event + driver + penalty 0..10, baseline vs scenario field probabilities. Used only by the placeholder provider (see 5.7) |
| Stories index | `stories/index.json` + `stories/<id>.json` | **Placeholder** | `id`, `type` (track-profile, projection, recalibration, audit), `raceId`, `publishedAt`, `snapshotId`, `modelId`, `title`, `summary`, `blocks[]`, `chartRefs[]`, `socialLinks[]` |
| Asset manifest | `asset_manifest.json` | **Placeholder** | Existing files per category (drivers, teams, tracks, cars by season). The UI checks it instead of 404-ing |
| Track degradation | `tracksDeg.json` | **Real, adapt** | Define the degradation scale (1-5) and whether pit stops are per-driver or field totals; document the assumption |
| Insights | `insights.json` | **Real, adapt** | Add `higherIsBetter` metadata through the adapter |
| Driver trends | `driverTrends.json` | **Real, adapt** | Keep for sparklines only; do not present arbitrary history as "current form" |
| Calendar | `calendar.json` | **Real, adapt** | Unified `RaceEvent` (merge `Race` and `RaceEvent`); statuses upcoming, in-progress, completed, cancelled, postponed; no fabricated `unknown-track` IDs |

Also correct existing contracts against the actual payloads (all listed in `improvement.md` section 1):
- Driver: `polePositions` vs `poles`, nullable `dateOfBirth`, `age`, `raceFinishes`.
- Standings: numeric driver numbers.
- Track: `layoutImage` vs `layout`, `turns` vs `corners`.
- Weather: unify field names across `weather.ts` and `weekend.ts`.

### 3.4 Pure domain logic (all unit-tested)
- `nextEvent(calendar, now, manifest)`: sorts by scheduled instant, handles ongoing, cancelled, postponed and season complete. The Home hero and Race Hub **must** use it, and it must resolve the same race. Reconcile with the stale `next_race.json`, which currently says Belgium vs Italy in the calendar. Deprecate `nextRace.ts` and `stats.ts` in favor of the new logic and `season_stats.json`.
- `probabilityCoverage(predictions)`: returns count, mass and mass-missing.
- `headToHead(a, b, track?)`: normalization, direction handling, insufficient-sample handling, same-driver guard.
- `pairwiseMatchups(n) = n(n-1)/2` (never hardcode 190).
- `formatLapTime(seconds)`, `formatPpDelta(before, after)`.

---

## 4. Design language: "Telemetry Terminal"

**Principles:** dark, dense but calm, numbers first, status carried by color **and** text/shape, every card says what it is, what season and race it covers, and how fresh it is.

### 4.1 Tokens (define in `styles/index.css` under `@theme` for Tailwind v4, mirrored in `config/tokens.ts`)

| Token | Value | Use |
|---|---|---|
| `--color-obsidian` | `#09090B` | Page background |
| `--color-charcoal` | `#1C1C1E` | Card surface |
| `--color-charcoal-2` | `#26262A` | Raised surface, hovers |
| `--color-line` | `rgba(255,255,255,0.08)` | Borders |
| `--color-telemetry-red` | `#EF4444` | Brand, alerts, primary action |
| `--color-sector-green` | `#22C55E` | Validated, champion, improvement |
| `--color-drs-amber` | `#F59E0B` | Challenger, warnings, SAMPLE DATA, stale |
| `--color-text` / `--color-text-muted` | `#F4F4F5` / `#A1A1AA` | Text (verify AA contrast) |

- Tire-compound colors stay distinct and always carry a text label (S/M/H/I/W).
- Team colors live in **one** registry (`data/registry/teams.ts`), keyed by canonical team ID. Remove the hardcoded `DRIVER_COLORS` map in `PointsProgressChart`.
- Spacing on a 4px scale. Radii: 8px (controls), 12px (cards). One shadow level. Motion: 150-200ms ease-out, and everything respects `prefers-reduced-motion`.

### 4.2 Typography
- Load fonts explicitly (the current CSS names Inter but never loads it): **Inter** for prose and headings, **JetBrains Mono** for telemetry and numbers.
- All numeric columns use `font-variant-numeric: tabular-nums`. Provide a `<Num>` primitive that formats, aligns right and handles `null` as `—`.
- Scale: 12 / 14 / 16 / 20 / 28 / 40. Uppercase tracked micro-labels at 11-12px for section kickers.

### 4.3 Status semantics (never color alone)
- Red = brand/alert/live. Green = validated, champion, positive delta. Amber = challenger, warning, stale, sample data.
- Every status pairs color with an icon or text (`CHAMPION`, `CHALLENGER`, `BASELINE`, `STALE`, `SAMPLE DATA`).
- The pulsing dot on `SectionCard` appears **only** for a genuinely live or alert state. Static cards must not imply a live feed.

### 4.4 `ui/` primitives (build these first; every feature composes from them)
`Surface` (replaces both `Card` and `SectionCard`, with variants), `SectionHeader` (title, kicker, as-of text, actions slot, heading level prop), `Badge`/`StatusChip`, `Num`, `Delta` (pp change with arrow + sign + color + text), `ProgressBar` (probability bars), `Stat` (replaces `StatCard`, with unit, scope, optional help text, unavailable state), `DataTable` (sticky header, accessible column headers, sort, mobile overflow region), `Tabs`, `Select`, `SearchInput`, `Slider` (keyboard accessible, with numeric input alternative), `Skeleton`, `EmptyState`, `ErrorState` (with Retry), `StaleBanner`, `SampleDataChip`, `ResourceBoundary`, `Avatar` (image with fallback and lazy load), `ScrollRegion` (named, keyboard-reachable, overflow cue), `Tooltip`/`InfoPopover` (for metric definitions).

### 4.5 `charts/` (all prop-driven, with a table alternative and accessible summary)
- `LineTrendChart` (points progression, arena cumulative accuracy)
- `Sparkline` (momentum ticker)
- `RadarCompare` (head-to-head, normalized 0-100)
- `ProbabilityBars` (predictions, scenario before/after)
- `TireDegBar` / `DegScale`

Standards: dark-theme contrast, line patterns plus colors, legend toggles, empty vs loading separated, never interpolate championship points between rounds as if observed.

### 4.6 Accessibility and responsive baseline
- One `<main>` per route (via `AppShell`), skip-to-content link, route heading focus on navigation, visible focus rings.
- Navbar: brand links Home, hamburger has `aria-expanded`/`aria-controls`, Escape closes, focus trap on mobile.
- Verify at 360px, 768px and 1280px. Tables use `ScrollRegion` or stacked summaries on phones. Touch targets are at least 44px.
- Fix Calendar's light hover backgrounds against the dark theme.

---

## 5. Features and pages

Each section: goal, data, UI, acceptance. All pages use `ResourceBoundary` per section.

### 5.1 App shell
`AppShell` (Navbar, main, Footer), `ErrorBoundary`, `NotFound`, route-level code splitting for chart-heavy routes (measure bundle before and after). Footer is rebranded **LapLogic** (no more "Fanalytics"), with methodology, data sources, audit archive link and data freshness. `index.html`: title and description updated to LapLogic, favicon fixed (`/favicon.svg` is referenced but missing, so create a simple one), social meta tags. Navbar entries come from `config/routes.ts`: Home, Race Hub, Arena, Compare, Simulator, Insights, Drivers, Teams, Tracks, Calendar.

### 5.2 Home (prediction-led)
Order: **(1)** Champion prediction hero (shared `PredictionPanel`: event, stage, model + version, top contenders with probability bars, coverage line, updated-at, link to Race Hub); **(2)** Race context (`RaceCard` from `nextEvent()`: countdown, sessions, forecast freshness); **(3)** Momentum ticker (5 races); **(4)** Arena summary (`EvaluationSummary`: champion vs baseline vs challenger, link to Arena); **(5)** Standings and points progression below. Stats row derives from `season_stats.json` with scope labels. Acceptance: Home and Race Hub resolve the same race and snapshot; a failed calendar never says "Season Completed".

### 5.3 Race Hub
Stage selector (pre-weekend / post-FP2 / post-quali), event header with snapshot ID and as-of time, weather (observed vs forecast labeled, with freshness), track profile (degradation, pit delta, DRS zones, pole-to-win conversion with sample window), long-run pace table (session, stint age, compound, lap count, with a note that raw averages across compounds are not directly comparable), full-field predictions with coverage and a top-10 toggle, before/after pp deltas via `Delta`, feature explanations (units and direction) in `InfoPopover`. Replace truthiness checks with null checks (zero insight values must render). Failed weekend request shows an error with Retry, not endless "Loading". Fastest sectors only with session and timing provenance.

### 5.4 Arena Tracker (new route `/arena`)
Champion / challenger / baseline cards (using StatusChips); cumulative accuracy `LineTrendChart`; per-race results `DataTable` (correct/incorrect with icon plus text); filters by season and stage; shows denominators and exclusions; links each row to its immutable prediction snapshot and outcome. Warning banner if the champion is below the grid baseline. Reads `evaluation.json` + `arena_history.json`.

### 5.5 Momentum ticker (shared block, used on Home and Drivers)
Last five completed races per driver, absolute value and change, direction meaning in a tooltip, as-of round, `Sparkline`. Reads `momentum.json` (placeholder now).

### 5.6 Head-to-Head (new route `/compare`)
Two driver selectors (cannot select the same driver), optional track and season context, `RadarCompare` (normalized) next to a raw-value table with sample sizes. Insufficient data (rookies) shows the metric as unavailable instead of zero. URL state: `/compare?a=...&b=...&track=...`.

### 5.7 Simulator (`/simulator`)
Interface-first design so the real inference backend can be dropped in later:

```ts
interface SimulationProvider {
  run(input: { snapshotId: string; driverId: string; gridPenalty: number; signal: AbortSignal }): Promise<SimulationResult>;
}
// SimulationResult: baseline[], scenario[], deltasPp[], modelId, assumptions[], generatedAt, placeholder
```

- Ship `PlaceholderSimulationProvider`, which looks up `simulator_scenarios.json`. Penalties or drivers outside the fixture return a clear "unavailable in sample mode" state. **Do not compute fake probabilities.**
- Add `HttpSimulationProvider` stub (reads `VITE_SIM_API_URL`; **no secrets in the bundle**), selected by `config/features.ts`.
- `SimulatorForm` (labeled driver and event selectors, bounded grid-penalty `Slider` plus numeric input, validation, reset, submit state) and `SimulatorResults` (baseline vs scenario `ProbabilityBars`, pp deltas, assumptions, model version, hypothetical label, stale marker when inputs change after a result, `aria-live` completion announcement).
- Request ordering: ignore superseded responses with AbortController and a request ID.
- Acceptance: reset restores baseline; changed input never shows an old result as current; failure keeps the previous result labeled.

### 5.8 Insights and Audits (`/insights`, `/insights/:storyId`)
Archive list filtered by type and race, article view rendering `blocks[]`, before/after deltas, "frozen pre-race picks vs actual" audit table, deep links, social share meta, chart summaries. Reads `stories/index.json`. Archived stories must keep resolving to the original snapshot and model.

### 5.9 Directory pages
- **Drivers:** search, team filter, sort by points/momentum/wins, current-lineup default with archive toggle, compare checkbox -> `/compare`, career vs season stats labeled, filters in URL, debug logging removed, image fallback.
- **Teams:** search, season standings plus momentum, driver links, career vs season labeled, unmatched roster IDs surfaced, image fallback.
- **Tracks:** current-calendar vs archive tabs, search/country/type filters, unknown lengths sorted last (not as 0), `layoutImage` fixed with placeholder fallback, degradation and pole-conversion context with sample window.
- **Calendar:** upcoming/completed filter, season selector, links to Race Hub and audits, local vs track timezone toggle, sprint-specific timings, cancelled/postponed handling, loading and error states, no `any`. Calendar export is deferred until start times exist in the data.

### 5.10 Existing components: disposition
Rebuild or merge per `improvement.md` section 3. Summary:
- `Card` + `SectionCard` -> `ui/Surface`.
- `StatCard` -> `ui/Stat`.
- `PredictionCard` -> `features/home/PredictionPanel` (shared champion prediction surface, used by Home and Race Hub).
- `RaceCard` -> reused for next-event context.
- `Hero` -> one shared LapLogic hero, or retire it into Home.
- `PageContainer` -> folded into `AppShell`.
- `PlaceholderCard` -> replaced by `EmptyState`/`SampleDataChip`; never shown as working analytics.
- `ScrollWrapper` -> `ScrollRegion`.
- `StandingsTable` -> `DataTable` consumer; keys by entity ID, shows wins, as-of caption.
- `EvaluationCard` -> `EvaluationSummary`.
- `PointsProgressChart` -> `LineTrendChart` consumer (sorted rounds, legend toggles, canonical colors, table alternative).
- Delete the now-empty `simulator/SimulatorForm.tsx`/`SimulatorResults.tsx` stubs only after real versions exist in `features/simulator/`.
- Remove dead types/services (`nextRace`, `stats`, `weather`) after replacement.

---

## 6. Placeholders for the Python engine (`analytics_engine/`)

For every resource marked **Placeholder** in 3.3, create **two** things.

**A. Placeholder JSON in `web_app/public/data/`**
- Plausible but clearly sample content; `meta.placeholder: true`; names and IDs drawn from the real registry (use real driver and team IDs, but obviously sample values).
- A top-level `"_note": "Sample data. Replace by running analytics_engine/src/export/<script>.py"`.

**B. Placeholder export script in `analytics_engine/src/export/placeholders/`**
One script per resource (for example `export_evaluation.py`, `export_arena_history.py`, `export_momentum.py`, `export_head_to_head.py`, `export_season_stats.py`, `export_prediction_stages.py`, `export_manifest.py`, `export_registries.py`, `export_simulator_scenarios.py`, `export_stories.py`, `export_asset_manifest.py`). Each:
- Has a module docstring listing the **exact output schema**, the intended real data source (which processed CSV, model or FastF1 call), and `TODO(real-export):` markers where the real logic goes.
- Writes the same file the front end reads, using the shared helper.
- Where cheap and correct, computes from real files (for example `season_stats` from `calendar.json` and `drivers.json`; `asset_manifest` from the images folder) and sets `placeholder: false` only if **all** content is genuinely derived.
- Is **not** wired into `main.py` or the GitHub workflow by default.

**Shared helper `analytics_engine/src/export/export_utils.py`:** `build_meta(...)`, `write_json_atomic(path, payload)` (temp file, then rename), and a guard that **refuses to overwrite a file whose `meta.placeholder` is false unless `--force` is passed**, so a placeholder run can never clobber real data. Paths resolve relative to the repo root.

**`docs/data_contracts.md`:** one table per resource: file, schema version, owning script, status (real/placeholder), field list with units and null semantics, and which front-end service consumes it. This is the hand-off document for swapping in real exports.

**Swap-in procedure** (document at the top of that file): replace the placeholder script's body with the real computation, keep the output schema, run it, confirm `placeholder: false`, and the front end updates with no code changes. Add a Vitest contract test per resource that validates the shipped JSON against its zod schema, so a bad real export fails CI immediately.

---

## 7. Testing and verification

- **Unit (Vitest):** `nextEvent`, `probabilityCoverage`, `headToHead`, `pairwiseMatchups`, lap-time unit conversion, ID alias resolution, each adapter with real fixtures from `public/data` plus malformed/missing/zero cases.
- **Contract:** every JSON in `public/data` parses against its schema (placeholders included).
- **Component:** `ResourceBoundary` states, `Num` null vs zero, `Delta`, simulator request ordering and stale-result marking, SAMPLE DATA chip appears iff `placeholder: true`, comparison same-driver guard.
- **Manual checks to report:** 360/768/1280px, keyboard-only navigation, reduced motion, deep links (`/race-hub`, `/arena`, `/compare?a=&b=`, `/insights/:id`) and a case-sensitive asset-path audit.
- Finish each milestone with `npx tsc -b && npm run lint && npm test && npm run build`. Report results honestly; do not claim checks you did not run.

---

## 8. Milestones (commit per milestone; stop and summarize after each)

| # | Scope | Done when |
|---|---|---|
| **M0: Data trust** | `data/` layer (client, schemas, adapters, registries, services, hooks), `ResourceBoundary`, manifest + registries + evaluation + asset manifest placeholders, fixed contracts, evaluation conflict warning, `nextEvent`, tests, `docs/data_contracts.md`, `export_utils.py` | No `undefined%`, no endless loading, conflicting runs flagged, IDs all resolve through registry, contract tests pass |
| **M1: Design system + shell** | Tokens, fonts, `ui/` primitives, `charts/`, `AppShell`, route registry, favicon/meta, LapLogic rebrand, a11y baseline | Existing pages re-skinned on primitives, no `Card`/`SectionCard` duplication, keyboard and mobile pass |
| **M2: Core pages** | Prediction-led Home, Race Hub (stages, coverage, deltas), Calendar, Drivers/Teams/Tracks improvements, momentum ticker, season stats | Home and Race Hub resolve the same race; every card shows season/as-of; placeholders labeled |
| **M3: Arena + Compare** | `/arena`, `/compare`, remaining placeholders and scripts | Same-cohort accuracy shown with denominators; rookies and same-driver handled |
| **M4: Simulator + Insights** | Provider interface, placeholder provider, form/results, stories archive | Simulator acceptance criteria pass in sample mode; stories resolve to original snapshots |
| **M5: Cleanup** | Remove dead code/types/services/empty stubs, bundle review, final audit report | `tsc`, lint, tests, build all green; dead-code list empty |

---

## 9. Reporting back

After each milestone give me, in this order:
1. What changed (files added/removed/migrated).
2. Contract discrepancies found between the engine exports and the front end, and how you handled them.
3. Which JSON files are still placeholders and which Python script replaces each.
4. Verification results (exact commands, pass/fail).
5. Open questions for me or the engine owner: the authoritative champion run, snapshot freshness rules, real inference endpoint availability, and degradation-scale definitions.

If something is ambiguous and a wrong guess would be costly to redo, ask first. Otherwise choose the conservative option, document it in `docs/data_contracts.md`, and continue.
