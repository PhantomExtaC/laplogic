"""Output evaluation.json: envelope with evaluationId, nullable championId,
sampleCount (shared eligible event-stage forecasts), dateRange, metricDefinitions,
baseline {id,label,accuracy}, models [{id,version,accuracy,top3}], conflict.
Accuracy/top3 are fractions 0–1; missing is null. Intended real source: arena.py
frozen predictions/outcomes on one common cohort. TODO(real-export): replace
synthetic metrics with measured evaluation and resolve model promotion explicitly.
"""
import argparse
from arena_fixtures import build
from export_utils import write_json_atomic

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    evaluation, _, _, _ = build()
    write_json_atomic("web_app/public/data/evaluation.json", evaluation, force=args.force)
