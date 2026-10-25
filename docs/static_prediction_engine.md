# Static prediction engine: first baseline

Simulator is deferred. GitHub Actions now exports predictions.json and evaluation.json
using season-wins-baseline 1.0.0. This is a statistical benchmark, not the old Random
Forest, a calibrated ML model, or a promoted champion. No new dependency is required.

For an assumed field, probability is (prior season wins + 1) divided by (wins among
that field + field size). This categorical model sums to one by construction. It
does not silently normalize independent classifier scores. The field is provisional:
entrants from the last recorded race are assumed to return. Home and Race Hub state
that limitation. No official next-event roster, grid, weather, practice or track
features are claimed. Already-started events are excluded from forecast selection.

Evaluation is retrospective walk-forward with three prior races of warmup. Every
race is scored before its winner enters the model. Its assumed field comes from
the previous race; changed fields are excluded from both this model and a uniform
baseline. Top-one and top-three-winner coverage break ties by canonical driver ID.
The current saved source yields 12 eligible races and 5 exclusions. Backtest records
are not inserted into Arena as historical published forecasts.

Model parameters, cutoff, assumed field, exclusions and per-race backtest probabilities
are saved under .updater/models and retained by the workflow's evidence artifact.
Unchanged exports preserve their first generatedAt timestamp. No past forecast is
backdated to its source observation date.

Next: verified upcoming entry lists, training across historical seasons, stage-valid
features, probability calibration and model comparison/promotion. Monday Actions can
preload priors; FP2 and qualifying forecasts need extra event-stage triggers and
session adapters. A backend is unnecessary for any of these static exports.
