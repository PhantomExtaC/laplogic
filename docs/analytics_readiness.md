# Computed analytical resources and remaining inputs

Completed in this pair of checkpoints:
- head_to_head.json is generated from the same Jolpica source snapshot as standings.
  It contains mean classified finish, race points per start and podium rate. Sprint
  points are excluded. Overall metrics need three starts; track context needs one
  observation and explicitly displays that sample. Missing starts do not become zero.
  Radar direction is consistent with raw units; points normalization uses the highest
  single-race award observed in this source. Every selected-track metric uses only
  that circuit, without an overall fallback. This is descriptive comparison, not a
  matched teammate duel or a prediction.
- track_profiles.json replaces consumption of the old pit-stop/degradation buckets.
  It exports recorded race counts, eligible pole starts, pole wins, their ratio and
  actual date windows for mapped calendar circuits. Zero wins remain zero; unknown
  pole grids do not count as losses. Upcoming circuits have zero samples and null
  conversion. Tyre degradation is not inferred from pit-stop totals.

Both exporters run in the weekly pipeline before schema validation/publication.
They retain the original snapshot identity and result cutoff. The saved source
currently covers 2026 round 17, through 2026-10-11. Publishing this pair reuses that
source, not a new fetch or an invented freshness date.

Remaining sections and concrete implementation requirements:

| Section | Missing producer/input | Next implementation |
| --- | --- | --- |
| Evaluation | Canonical model artifact/version, documented target/features, time-based validation and one shared baseline cohort | Build a reproducible walk-forward backtest and artifact manifest; reconcile scores before promotion. Existing frozen archives are samples and cannot become historical forecasts. |
| Forecast | Complete verified next-event entrants, stage-valid inputs and promoted inference artifact | Replace guessed driver subsets, ordinal fake grids, first-row track features and silent probability normalization in the old RF exporter. Bind output to event/stage/training cutoff and export the entire field. |
| Arena | Real forecast records frozen before outcomes | Start appending genuine snapshots when inference is ready. Retrospective backtests must be labelled separately, never inserted as historical published picks. |
| Simulator | Validated baseline inference and documented grid penalty treatment | Generate supported scenarios with baseline parity and exact delta checks from the same model; unsupported combinations stay unavailable. |
| Weekend context | Event/session-bound weather, timing, compounds and stint samples | Add a source adapter and coverage checks; qualifying and FP2 data need distinct timestamps. |
| Insights | Genuine forecasts/outcomes plus an editorial claim policy | Generate factual outcome summaries first; model stories must reference actual frozen evidence. |
| Tyre wear/racecraft | Measured stint/compound/lap context and validated definitions | Define and validate separately; classified finish and pit-stop volume are not substitutes. |

No new model was trained or promoted in this pair. This document records implementable
work, not a requirement to wait for a separate human owner. Future work proceeds in
pairs: reproducible evaluation and inference input assembly, then forecast freezing
and Simulator delivery.
