# M1 — Telemetry Terminal design system and shell

## Changes
- Added `src/styles/index.css` and `src/config/tokens.ts`: Obsidian/Charcoal surfaces, status colors, 4px spacing, radii, one shadow, visible focus and reduced-motion overrides. Inter and JetBrains Mono load explicitly from Google Fonts with system fallbacks.
- Added `src/ui/`: Surface/SectionHeader, Badge/StatusChip/SampleDataChip, Num, Delta, ProgressBar, Stat, sortable DataTable, Tabs, Select, SearchInput, Slider with numeric alternative, Skeleton, EmptyState, ErrorState, StaleBanner, Avatar, ScrollRegion and InfoPopover/Tooltip.
- Added prop-driven `src/charts/`: LineTrendChart, Sparkline, RadarCompare, ProbabilityBars and DegScale/TireDegBar. Recorded points use step lines, missing observations remain gaps, series use color and line patterns, and data tables remain available alongside charts.
- Added `src/app/`: shared Navbar/main/Footer shell, route heading focus, skip link, mobile focus trap/Escape/return focus, error recovery, NotFound, Methodology and explicit unavailable workspaces.
- Centralized the ten primary routes in `src/config/routes.ts` and lazy-loaded each existing page. Metadata and favicon are branded LapLogic.
- Re-skinned existing pages and directory cards using the shared primitives. Card and SectionCard are compatibility re-exports of Surface, rather than competing implementations. Standings use canonical row keys, sortable columns and wins. Directory requests have cancellation, errors and Retry. The simulator's inert form is replaced by an explicit unavailable state until M4.
- Replaced the driver-color map with `data/registry/teams.ts`; progression joins validated exports by canonical ID and resolves the standings-only entrant through its registry entry. Replaced data-fetching `ui/PredictionResource.tsx` with a prop-driven PredictionPanel; pages own resource hooks.

## Export discrepancies
Progression contains `tsunoda`, absent from the driver directory. Its registry record is derived from standings; missing abbreviation stays null. The placeholder exporter and schema were updated together. Chart label/team fallback uses the same canonical ID in standings.

The case-sensitive asset audit found zero case-only mismatches and 99 missing legacy references: 77 circuit layouts, 21 driver-standings images and one constructor-standings image. Missing circuit paths are withheld by the asset adapter and display the supplied placeholder; Avatar provides a labeled fallback for image failure. Standings tables do not request their missing images. Existing real JSON files were not changed.

## Placeholder exports
| File | Replacement script under `analytics_engine/src/export/placeholders/` |
|---|---|
| manifest.json | export_manifest.py |
| driver_registry.json | export_registries.py |
| track_registry.json | export_registries.py |
| evaluation.json | export_evaluation.py |
| asset_manifest.json | export_asset_manifest.py |

## Verification
Run from `web_app`:
- `npx --no-install tsc -b` — pass.
- `npm run lint` — pass, no warnings.
- `npm test` — 45 tests pass across seven files. New coverage includes zero vs null, pp direction, table sorting/null placement, keyboard tabs, bounded numeric controls, avatar failure, static cards, route registry, mobile focus trapping/Escape/return focus, progression identities, AA contrast and CSS token/reduced-motion consistency.
- `npm run build` — pass, without a chunk-size warning.

Browser preview checks:
- 360px: Home, Calendar, Drivers, Teams and Tracks fit without page-wide horizontal overflow; wide tables remain inside their named scroll regions. Loaded directory cards were checked, not just loading shells.
- 768px: Home and Calendar visually inspected; Race Hub, Arena, Compare, Insights story-unavailable route, directories and 404 resolve with one main landmark and no page-wide overflow.
- 1280px: Home inspected with desktop navigation and two-column layout; DOM width check confirms no page-wide overflow. The desktop browser capture is clipped by the app panel, so the saved preview uses the complete 768px view.
- Keyboard: mobile menu opens to Close, Shift+Tab wraps to the last link, Tab wraps back to Close, Escape restores focus to the opener, and navigation transfers focus to the new route heading. Skip link, named table regions, native inputs and visible focus are implemented.
- Direct deep links checked: `/race-hub`, `/arena`, `/compare?a=&b=`, `/insights/sample-audit`, `/drivers`, `/teams`, `/tracks`, plus unknown-route recovery. Later-feature routes deliberately show unavailable states.
- No browser console errors observed during the checked routes.
- Reduced-motion rules and disabled chart animation are verified in source/tests. An operating-system reduced-motion toggle was not exercised.

Bundle: M0 had one 708.32 kB JS chunk (210.82 kB gzip). M1 entry is approximately 330.12 kB (102.94 kB gzip), with Home/chart code in a separate approximately 352.63 kB chunk (103.00 kB gzip). Home still loads its chart chunk; this improves route isolation rather than claiming that the total Home payload was halved.

## Remaining milestones and engine decisions
M2 provides the complete core-page feature work, stages, momentum and season stats. M3 provides Arena and Compare analytics. M4 provides simulation and immutable stories. M5 handles final cleanup and audit. Existing compatibility paths remain until feature migration.

Engine decisions remain open: authoritative evaluation run and metric definitions; snapshot freshness budgets and identifiers; circuit ID mapping; degradation scale/window and pit-stop denominator; real inference endpoint. These uncertainties remain visible and do not block the design foundation.
