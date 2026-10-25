"""Output arena_history.json and immutable snapshots/<id>.json, outcomes/<id>.json.
History envelope: evaluationId, baselineId, modelIds[], races[] with event/stage,
snapshotId/outcomeId, outcomeWinner and per-model picks, probabilities, eligibility,
correctness, top3Covered and exclusionReason. Snapshot envelope freezes only picks;
outcome envelope has event ID and winner ID. Exact schemas: frontend arena.ts.
Intended source: arena.py per-event evaluation records. TODO(real-export): replace
synthetic fixtures with immutable measured records; never rewrite published picks.
"""
import argparse
from arena_fixtures import build
from export_utils import write_json_atomic, ROOT

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    _, history, snapshots, outcomes = build()
    write_json_atomic("web_app/public/data/arena_history.json", history, force=args.force)
    for folder, rows in [("snapshots", snapshots), ("outcomes", outcomes)]:
        for identifier, payload in rows.items():
            target = f"web_app/public/data/{folder}/{identifier}.json"
            # Existing archives are immutable, including samples. A new ID is required.
            if not (ROOT / target).exists():
                write_json_atomic(target, payload)
