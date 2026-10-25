# Home simplification and weekly updater plan

Status: proposed implementation plan. Work proceeds in pairs of checkpoints,
with a separately verified commit for each checkpoint.

## Product scope

Home needs less clutter. Remove the Momentum / last five recorded races section
whose kicker is Form window, including its now-unused Home resource request.
Keep the prediction panel, next-race context, Arena summary, season counts,
standings and points progression. Shorten descriptive copy and repeated provenance
text; retain essential event/model/freshness information in compact form.
Remove empty placeholder filler, rather than hiding the status of sample values.
SAMPLE DATA labels disappear only when genuine validated exports replace samples.
Other pages keep their current design and behavior.

## Observed starting point

- `.github/workflows/analytics_engine.yml` already declares Monday 08:00 UTC
  execution and a manual trigger, but calls main.py without --profile prod.
- main.py defaults to lab, runs clean_master, build_dataset and arena only,
  and skips missing scripts. Ingestion, derived features and frontend exports
  are not connected in that runner. Profile switches such as export_json and
  enable_live_api are not enforced by the orchestration shown there.
- The workflow installs an inline unpinned dependency list; PyYAML is not
  explicitly listed even though main.py imports yaml.
- Existing exporters write individual public JSON files directly. A successful
  weekly run needs coherent publication across related resources, not just a
  successful final command or a new timestamp.
- Frontend contracts and sample exporters already exist. Legacy data has gaps in
  current coverage, event/snapshot binding, evaluation consistency and definitions.
  Source readiness must be verified before a placeholder is considered replaceable.

## Batch 1 — Home and a source-of-truth inventory

### U0: Simplify Home
Remove Form window, reduce explanatory text, remove empty placeholder filler,
and preserve the other sections. Keep truthful sample/conflict/freshness status.
Verify Home at 360/768/1280 pixels and run type, lint, test and build gates.

### U1: Map every frontend contract to a real source
Inventory raw/processed inputs, coverage dates, IDs, current producers and consumers.
For each contract record source, owner, units, update cadence, dependencies,
freshness policy, validation and any missing evidence. Reconcile schema drift and
the two conflicting evaluation exports. Identify initial backfill needs separately
from recurring incremental updates. Inventory existing tests and dependencies.

Done when: every resource has an explicit ready/blocked/not-applicable status,
replacement order and acceptance gate; unavailable inputs are not guessed.

## Batch 2 — A safe runner and real core data

### U2: Build the updater core
Provide one CLI entry point with explicit season/event selection, dry-run,
incremental/backfill modes and an intentional publish option. Separate ingestion,
processing, export, validation and publication. Enforce profile settings, locks
against overlapping runs, bounded retries/timeouts for transient failures,
idempotent ingestion and structured logs/run summaries. Inject the run time for
repeatable tests. Use an approved model artifact by default; model retraining and
promotion are separate explicit operations.

Write candidates to an isolated run directory, never directly into published JSON.
Validate dependencies and event/snapshot consistency before publication. Classify
critical and optional outputs. A critical failure preserves the last good release;
an optional failure remains explicitly stale/unavailable with its original date.
Report meaningful exit status and coverage; never mark failed data freshly updated.

### U3: Replace core resource placeholders and stale legacy outputs
Start with registries, asset manifest, calendar, driver/team directories, standings
and season counts. Use canonical IDs, timezone-aware session instants where supplied,
documented count scopes and real source timestamps. Support off weeks, postponed
events, new entrants, missing optional fields and upstream corrections.

Done when: a fixture-driven dry run and a permitted real-source run produce validated
core outputs; reruns do not duplicate records or corrupt the published release.

## Batch 3 — Derived analytics and reproducible predictions

### U4: Replace derived analytical fixtures
Export momentum/racecraft, track profiles and head-to-head metrics from verified
processed data. Define sample windows, directions, units and minimum sample sizes.
Use null for sparse or unconfirmed metrics. Verify data coverage before calculating
latest-five-race form or track-specific values. No sample fallback masquerades as real.

### U5: Unify evaluation, forecasts and immutable records
Publish one authoritative evaluation with explicit metric definitions, time-based
validation and a shared cohort/baseline. Record model/version and training data cutoff.
Produce event/stage-bound field probabilities and raw coverage without silent
normalization. Freeze forecasts before outcomes are known; append outcome records
after verified results arrive. Never rebuild past picks from a newly trained model.
Define reconciliation rules for later official-result corrections without erasing
the original published records. Keep champion unresolved until evidence supports it.

Done when: UI analyses are reproducible from documented inputs, evaluation totals
reconcile, and no future outcome information leaks into earlier forecasts.

## Batch 4 — Remaining contracts and production scheduling

### U6: Connect Simulator and Insights to real evidence
Choose a documented real-inference delivery mode: precomputed scenario exports fit
the current static site, while an HTTP service is a separate deployment decision.
Define valid grid-penalty assumptions and supported inputs before producing scenario
probabilities. Validate baseline parity and percentage-point deltas. Publish stories
from real frozen evidence with publication metadata and original model/snapshot IDs.
Automate audit data assembly; editorial claims need a defined review policy.
Missing inference or reviewed story content remains unavailable until ready.

### U7: Wire and verify the weekly workflow
Update the existing GitHub workflow to use pinned project dependencies and the
explicit production runner. Add concurrency control, caching, bounded execution,
candidate artifacts and a run summary. Validate schemas, canonical joins, units,
timestamps, sample flags, immutable archives and the frontend build before publishing.
Publish only an allowlist of generated outputs in one coherent release/commit.
Preserve previous releases and provide a tested rollback procedure. A no-change run
should not create timestamp-only churn or a new data commit.

Keep the existing schedule as the initial configuration to review; enable the final
publishing path after a successful manual end-to-end rehearsal. Weekly refresh is
the baseline cadence. Timely post-FP2/post-qualifying forecasts require additional
event-stage triggers using the same runner; Monday execution alone cannot supply them.

Done when: first publish, no-op rerun, partial outage, validation failure, interrupted
publication, corrected result and rollback have all been exercised. Hosting behavior
must be checked so users cannot consume an accidentally mixed release; local atomic
file replacement alone is insufficient for a multi-file release.

## Contract replacement order

1. Registries/assets, calendar, directories, standings and season scope.
2. Momentum, track profiles and comparison metrics.
3. Canonical evaluation, stage forecasts, frozen snapshots and outcomes.
4. Real simulation scenarios and evidence-backed stories.
5. A manifest describing the validated release actually published.

For each replacement: preserve the frontend schema or introduce a deliberate versioned
migration; validate a candidate; set placeholder false only when the entire resource
is genuine; verify the page with that export; publish with provenance and retain the
previous known-good version. Do not strip a sample flag merely to remove a UI chip.

## Decisions to resolve during the relevant checkpoint

Authoritative sources and historical/current coverage; evaluation selection and
metric definitions; freshness budgets; degradation/pit-stop semantics; inference
delivery and assumptions; story review policy; deployment publication/rollback
mechanism; whether event-stage refreshes are in scope beyond the weekly baseline.
These decisions are resolved against the source inventory and concrete proposals,
rather than asking for all answers before implementation can begin.
