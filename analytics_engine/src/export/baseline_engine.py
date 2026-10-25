"""Reproducible categorical baseline, not the legacy RF or a calibrated ML model."""
import hashlib
import json
from datetime import datetime

MODEL = "season-wins-baseline"
VERSION = "1.0.0"


def distribution(field, wins):
    if not field or len(set(field)) != len(field): raise ValueError("Invalid forecast field")
    denominator = sum(wins.get(driver, 0) + 1 for driver in field)
    return {driver: (wins.get(driver, 0) + 1) / denominator for driver in sorted(field)}


def build(source, calendar, meta, computed_at):
    races = sorted(source["results"], key=lambda r: int(r["round"]))
    wins, previous, eligible, excluded, observations = {}, [], [], [], []
    names = {}
    for race in races:
        rows = race["Results"]
        field = [row["Driver"]["driverId"] for row in rows]
        winners = [row["Driver"]["driverId"] for row in rows if int(row["position"]) == 1]
        if len(winners) != 1 or len(set(field)) != len(field): raise ValueError("Invalid outcome classification")
        winner = winners[0]
        # Forecast field is known from the PREVIOUS race, not this outcome.
        if len(observations) >= 3 and set(previous) == set(field):
            probs = distribution(previous, wins)
            ranked = sorted(probs, key=lambda driver: (-probs[driver], driver))
            eligible.append({"round": int(race["round"]), "date": race["date"], "correct": ranked[0] == winner, "top3": winner in ranked[:3], "uniformCorrect": sorted(previous)[0] == winner, "probabilities": probs, "winner": winner})
        else:
            excluded.append({"round": int(race["round"]), "reason": "Warmup or changed recorded field"})
        wins[winner] = wins.get(winner, 0) + 1
        observations.append(int(race["round"]))
        previous = field
        for row in rows:
            driver = row["Driver"]
            names[driver["driverId"]] = driver["givenName"] + " " + driver["familyName"]
    digest = hashlib.sha256(json.dumps({"source": meta["snapshotId"], "model": MODEL, "version": VERSION, "wins": wins, "field": sorted(previous)}, sort_keys=True).encode()).hexdigest()[:24]
    evaluation_id = "walk-forward-" + digest
    count = len(eligible)
    score = lambda key: sum(row[key] for row in eligible) / count if count else None
    evaluation = {"meta": {**meta, "source": "Computed walk-forward retrospective baseline evaluation; not archived published forecasts"}, "data": {"evaluationId": evaluation_id, "championId": None, "sampleCount": count, "models": [{"id": MODEL, "version": VERSION, "accuracy": score("correct"), "top3": score("top3")}], "dateRange": {"fromDate": eligible[0]["date"], "toDate": eligible[-1]["date"]} if eligible else None, "metricDefinitions": {"Win accuracy": "Top-ranked driver equals the recorded winner; ties break by canonical driver ID.", "Top-3": "Recorded winner is among the three highest forecast probabilities; not podium coverage.", "Cohort": f"Retrospective chronological backtest, minimum 3 prior races. Uses the previous race field; excludes roster changes. {len(excluded)} races excluded. Model and uniform baseline use the same eligible races. No current-race outcome enters its forecast.", "Probability": "Dirichlet categorical posterior: (prior season wins + 1) / (wins among assumed field + field size). No grid, weather, practice, track or team inputs. Uncalibrated baseline, not promoted ML.", "Baseline": "Uniform field probability; top-1 tie breaks by canonical driver ID. Not a pole-position baseline."}, "baseline": {"id": "uniform-field", "label": "Uniform field (deterministic tie break)", "accuracy": score("uniformCorrect")}, "conflict": False}}
    evaluation["meta"]["generatedAt"] = computed_at
    evaluation["meta"]["source"] += "; computed at generatedAt"
    now = datetime.fromisoformat(computed_at.replace("Z", "+00:00"))
    upcoming = next((event for event in calendar if event["status"] == "upcoming" and event.get("startsAt") and datetime.fromisoformat(event["startsAt"].replace("Z", "+00:00")) > now), None)
    forecast_meta = {**meta, "modelId": MODEL, "modelVersion": VERSION, "generatedAt": computed_at, "stage": "pre-weekend", "raceId": upcoming["raceId"] if upcoming else None, "fieldSize": len(previous) or None, "source": "Provisional statistical baseline: assumes the last recorded race field returns. No confirmed next-event entry list, grid, weather or practice inputs. Not a calibrated ML forecast."}
    forecast_meta["round"] = upcoming.get("round") if upcoming else None
    probabilities = distribution(previous, wins) if previous and upcoming else {}
    ranked = sorted(probabilities, key=lambda driver: (-probabilities[driver], driver))
    predictions = {"meta": forecast_meta, "data": [{"driverId": driver, "driverName": names[driver], "predictedPosition": position, "winProbability": probabilities[driver]} for position, driver in enumerate(ranked, 1)]}
    artifact = {"modelId": MODEL, "version": VERSION, "alpha": 1, "sourceSnapshotId": meta["snapshotId"], "trainingRounds": observations, "wins": wins, "assumedField": sorted(previous), "evaluationId": evaluation_id, "backtest": eligible, "excluded": excluded}
    return predictions, evaluation, artifact
