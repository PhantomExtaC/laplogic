"""Outputs: manifest.json.
Exact schema: web_app/src/data/schemas/index.ts and templates below.
Intended real source: calendar, drivers, tracks and public asset filesystem.
TODO(real-export): replace templates with verified computation and placeholder=False metadata.
"""
import argparse
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from export_utils import write_json_atomic
TEMPLATES = json.loads('{"manifest": {"meta": {"schemaVersion": "1.0.0", "snapshotId": null, "season": null, "raceId": null, "generatedAt": null, "dataThrough": null, "placeholder": true, "source": "analytics_engine/src/export/placeholders/export_manifest.py"}, "data": {"snapshotId": null, "season": null, "nextRaceId": null, "championModelId": null, "evaluationId": null, "resources": {"arena_metrics": {"filename": "arena_metrics.json", "schemaVersion": "legacy"}, "calendar": {"filename": "calendar.json", "schemaVersion": "legacy"}, "constructor_standings": {"filename": "constructor_standings.json", "schemaVersion": "legacy"}, "drivers": {"filename": "drivers.json", "schemaVersion": "legacy"}, "driverTrends": {"filename": "driverTrends.json", "schemaVersion": "legacy"}, "driver_standings": {"filename": "driver_standings.json", "schemaVersion": "legacy"}, "evaluation_metrics": {"filename": "evaluation_metrics.json", "schemaVersion": "legacy"}, "insights": {"filename": "insights.json", "schemaVersion": "legacy"}, "next_race": {"filename": "next_race.json", "schemaVersion": "legacy"}, "pointsProgression": {"filename": "pointsProgression.json", "schemaVersion": "legacy"}, "predictions": {"filename": "predictions.json", "schemaVersion": "legacy"}, "stats": {"filename": "stats.json", "schemaVersion": "legacy"}, "teams": {"filename": "teams.json", "schemaVersion": "legacy"}, "tracks": {"filename": "tracks.json", "schemaVersion": "legacy"}, "tracksDeg": {"filename": "tracksDeg.json", "schemaVersion": "legacy"}, "weekend_state": {"filename": "weekend_state.json", "schemaVersion": "legacy"}, "momentum": {"filename": "momentum.json", "schemaVersion": "1.0.0"}, "prediction_stages": {"filename": "prediction_stages.json", "schemaVersion": "1.0.0"}, "season_stats": {"filename": "season_stats.json", "schemaVersion": "1.0.0"}, "driver_registry": {"filename": "driver_registry.json", "schemaVersion": "1.0.0"}, "track_registry": {"filename": "track_registry.json", "schemaVersion": "1.0.0"}, "evaluation": {"filename": "evaluation.json", "schemaVersion": "1.0.0"}, "asset_manifest": {"filename": "asset_manifest.json", "schemaVersion": "1.0.0"}, "arena_history": {"filename": "arena_history.json", "schemaVersion": "1.0.0"}, "head_to_head": {"filename": "head_to_head.json", "schemaVersion": "1.0.0"}}}, "_note": "Sample data. Replace by running analytics_engine/src/export/placeholders/export_manifest.py"}}')
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    for name, payload in TEMPLATES.items():
        write_json_atomic("web_app/public/data/" + name + ".json", payload, force=args.force)
