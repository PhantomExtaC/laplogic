"""Synthetic shared-cohort evaluation fixtures; never measured model performance.

Schema: web_app/src/data/schemas/arena.ts and evaluationSchema in index.ts.
Intended source: immutable per-event inference/outcome records from arena.py.
TODO(real-export): replace with frozen real predictions and common eligibility.
"""
from fixtures import read, pack, event_id


def build():
    drivers = [d["id"] for d in read("drivers") if d["active"]]
    calendar = sorted([r for r in read("calendar") if r["status"] == "completed"], key=lambda r: r["round"])[-5:]
    model_ids = list(read("evaluation_metrics")["models"])
    baseline_id = "grid-baseline"
    evaluation_id = "sample-common-cohort-v1"
    ids = model_ids + [baseline_id]
    races, frozen, outcomes = [], {}, {}
    for j, race in enumerate(calendar):
        race_id = event_id(race)
        winner = drivers[(j * 3) % len(drivers)]
        outcome_id = f"sample-{race_id}"
        outcomes[outcome_id] = pack("arena_history", dict(outcomeId=outcome_id, raceId=race_id,
            eventName=race["grandPrix"], winnerId=winner, recordedAt=race["date"] + "T23:59:00Z"),
            season=int(race["date"][:4]), race_id=race_id, snapshot_id=outcome_id)
        for k, stage in enumerate(["pre-weekend", "post-fp2", "post-quali"]):
            snapshot_id = f"sample-{race_id}-{stage}"
            picks, results = [], []
            for i, model in enumerate(ids):
                eligible = not (j == len(calendar) - 1 and i == 1)
                correct = (j + i + k) % (i + 2) == 0
                predicted = winner if correct else drivers[(j * 3 + i + 1) % len(drivers)]
                probability = round(0.25 + (j + i + k) % 4 * 0.08, 2)
                picks.append(dict(modelId=model, predictedWinner=predicted if eligible else None,
                                  winProbability=probability if eligible else None))
                results.append(dict(modelId=model, eligible=eligible,
                    predictedWinner=predicted if eligible else None, winProbability=probability if eligible else None,
                    correct=correct if eligible else None, top3Covered=(correct or (j + i) % 2 == 0) if eligible else None,
                    exclusionReason=None if eligible else "Illustrative missing prediction; excluded for every model."))
            frozen[snapshot_id] = pack("arena_history", dict(snapshotId=snapshot_id, evaluationId=evaluation_id,
                raceId=race_id, eventName=race["grandPrix"], season=int(race["date"][:4]), round=race["round"],
                stage=stage, frozenAt=race["date"] + "T00:00:00Z", predictions=picks),
                season=int(race["date"][:4]), race_id=race_id, snapshot_id=snapshot_id)
            races.append(dict(raceId=race_id, eventName=race["grandPrix"], season=int(race["date"][:4]), round=race["round"],
                              stage=stage, snapshotId=snapshot_id, outcomeId=outcome_id,
                              outcomeWinner=winner, results=results))
    eligible = [r for r in races if all(result["eligible"] and result["correct"] is not None for result in r["results"])]
    def metric(model_id, key):
        values = [next(result[key] for result in race["results"] if result["modelId"] == model_id) for race in eligible]
        return sum(values) / len(values) if values else None
    evaluation = pack("evaluation", dict(evaluationId=evaluation_id, championId=None,
        sampleCount=len(eligible), dateRange=dict(fromDate=calendar[0]["date"], toDate=calendar[-1]["date"]),
        metricDefinitions={"accuracy": "Correct winner picks / shared eligible event-stage forecasts. Fraction 0–1.",
            "top3": "Observed winner included among the model's frozen top-three winner candidates / the same shared eligible forecast cohort; not podium overlap.",
            "cohort": "A forecast row is eligible only if every listed model and the baseline is eligible with known correctness. All stages count event-stage forecasts, not distinct races."},
        baseline=dict(id=baseline_id, label="Grid baseline", accuracy=metric(baseline_id, "correct")),
        models=[dict(id=model, version="sample-v1", accuracy=metric(model, "correct"), top3=metric(model, "top3Covered")) for model in model_ids],
        conflict=True), season=int(calendar[0]["date"][:4]))
    history = pack("arena_history", dict(evaluationId=evaluation_id, baselineId=baseline_id, modelIds=ids, races=races), season=int(calendar[0]["date"][:4]))
    return evaluation, history, frozen, outcomes
