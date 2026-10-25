"""Output season_stats.json: envelope of nullable season, seasonEntrants,
currentLineup, teams, scheduledEvents, nullable uniqueCircuits, completedRaces,
scope. Counts use shipped files, never projected results. Unique circuits is
null when calendar track IDs are missing. Intended sources: directories,
standings and calendar; no external dependencies. TODO(real-export): bind
source files to one season/as-of snapshot before treating their scopes as equal.
"""
import argparse
from fixtures import season_stats
from export_utils import write_json_atomic

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    write_json_atomic("web_app/public/data/season_stats.json", season_stats(), force=args.force)
