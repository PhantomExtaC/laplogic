"""Output simulator_scenarios.json: standard meta/data envelope, data.events[]
{snapshotId,raceId,eventName}, drivers[]{driverId,driverName}, scenarios[] with
snapshotId/raceId/eventName/driverId/gridPenalty integer 0..10; baseline/scenario
arrays {driverId,driverName,probability fraction}; deltasPp[]{driverId,value pp};
modelId,modelVersion,assumptions[],generatedAt ISO,placeholder boolean.
Intended source: event-bound inference service with grid-penalty features.
TODO(real-export): replace synthetic fixtures with calibrated model inference.
"""
import argparse
from fixtures import read, pack
from export_utils import write_json_atomic


def build():
    stages = read("prediction_stages")["data"]
    stage = stages["stages"][0]
    event = {key: stages[key] for key in ["raceId", "eventName"]}
    event["snapshotId"] = stage["snapshotId"]
    baseline = [{"driverId": row["driverId"], "driverName": row["driverName"], "probability": row["winProbability"]} for row in stage["predictions"]]
    scenarios = []
    for driver in baseline[:3]:
        for penalty in range(11):
            # Clearly synthetic fixture construction happens only in Python.
            loss = driver["probability"] * penalty * .025
            scenario = [{**row, "probability": round(row["probability"] - loss if row["driverId"] == driver["driverId"] else row["probability"] + loss / (len(baseline) - 1), 8)} for row in baseline]
            scenarios.append({**event, "driverId": driver["driverId"], "gridPenalty": penalty,
                              "baseline": baseline, "scenario": scenario,
                              "deltasPp": [{"driverId": row["driverId"], "value": round((row["probability"] - before["probability"]) * 100, 6)} for before, row in zip(baseline, scenario)],
                              "modelId": stage["modelId"], "modelVersion": stage["modelVersion"],
                              "assumptions": ["Synthetic sample values, not model inference.", "Only the first three supplied drivers have fixtures for penalties 0 to 10.", "No probabilities are renormalized by the browser. Raw field coverage is retained.", "Grid penalty is hypothetical; weather, retirements and strategy are held fixed."],
                              "generatedAt": stage["generatedAt"], "placeholder": True})
    return pack("simulator_scenarios", {"events": [event], "drivers": [{key: row[key] for key in ["driverId", "driverName"]} for row in baseline], "scenarios": scenarios}, season=2026, race_id=event["raceId"], snapshot_id=event["snapshotId"])

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    write_json_atomic("web_app/public/data/simulator_scenarios.json", build(), force=args.force)
