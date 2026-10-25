"""Output prediction_stages.json: envelope of raceId, eventName, fieldSize,
stages:[{stage, snapshotId, modelId, modelVersion, generatedAt, predictions:[
driverId, driverName, winProbability (fraction), predictedPosition]}].
Intended source: frozen pre-weekend/FP2/quali inference snapshots.
TODO(real-export): replace synthetic full-field fixtures with immutable real runs.
"""
import argparse
from fixtures import prediction_stages
from export_utils import write_json_atomic

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    write_json_atomic("web_app/public/data/prediction_stages.json", prediction_stages(), force=args.force)
