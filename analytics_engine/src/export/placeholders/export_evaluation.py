"""Outputs: evaluation.json.
Exact schema: web_app/src/data/schemas/index.ts and templates below.
Intended real source: versioned arena evaluation results and eligible training cohort.
TODO(real-export): replace templates with verified computation and placeholder=False metadata.
"""
import argparse
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from export_utils import write_json_atomic
TEMPLATES = json.loads("{\"evaluation\": {\"meta\": {\"schemaVersion\": \"1.0.0\", \"snapshotId\": null, \"season\": null, \"raceId\": null, \"generatedAt\": null, \"dataThrough\": null, \"placeholder\": true, \"source\": \"analytics_engine/src/export/placeholders/export_evaluation.py\"}, \"data\": {\"evaluationId\": null, \"championId\": null, \"sampleCount\": null, \"models\": [], \"conflict\": true}, \"_note\": \"Sample data. Replace by running analytics_engine/src/export/placeholders/export_evaluation.py\"}}")
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    for name, payload in TEMPLATES.items():
        write_json_atomic("web_app/public/data/" + name + ".json", payload, force=args.force)
