"""Output momentum.json: envelope of {definition, drivers:[{driverId, points:[
raceId, round, momentum (0–100), racecraft, delta (index points|null),
direction (up|down|flat|unknown)]}]}. See frontend core schema.
Intended source: processed power_ratings.csv for five completed race snapshots.
TODO(real-export): replace synthetic fixture computation with real per-race ratings.
"""
import argparse
from fixtures import momentum
from export_utils import write_json_atomic

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    write_json_atomic("web_app/public/data/momentum.json", momentum(), force=args.force)
