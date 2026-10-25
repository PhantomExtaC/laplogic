"""Deterministic, explicitly synthetic frontend fixtures. Never model inference.

The sample schema is defined by web_app/src/data/schemas/core.ts.
Real sources: processed power_ratings.csv/mastery_matrix.csv and event-bound
model predictions. TODO(real-export): replace these synthetic fixtures with
versioned computations; preserve the schemas and mark only real output false.
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from export_utils import ROOT, build_meta

DATA = ROOT / "web_app/public/data"


def read(name):
    return json.loads((DATA / f"{name}.json").read_text(encoding="utf-8"))


def pack(name, data, *, season=None, race_id=None, snapshot_id=None, placeholder=True):
    meta = build_meta(source=f"analytics_engine/src/export/placeholders/export_{name}.py",
                      placeholder=placeholder, season=season, race_id=race_id,
                      snapshot_id=snapshot_id,
                      generated_at=datetime.now(timezone.utc).isoformat())
    meta.update(round=None, stage=None, modelId=None)
    return {"meta": meta, "data": data,
            "_note": ("Sample data. " if placeholder else "Derived directory/export counts. ") +
            f"Replace by running analytics_engine/src/export/placeholders/export_{name}.py"}


def event_id(row):
    return f"{row['date'][:4]}-r{row['round']}"


def momentum():
    calendar = read("calendar")
    races = sorted([r for r in calendar if r["status"] == "completed"], key=lambda r: r["round"])[-5:]
    drivers = [d for d in read("drivers") if d["active"]]
    rows = []
    for i, driver in enumerate(drivers):
        points = []
        for j, race in enumerate(races):
            value = round(35 + ((i * 7 + j * 3) % 45), 1)
            previous = points[-1]["momentum"] if points else None
            points.append(dict(raceId=event_id(race), round=race["round"], momentum=value,
                               racecraft=round(value / 10, 1),
                               delta=None if previous is None else round(value - previous, 1),
                               direction="unknown" if previous is None else "up" if value > previous else "down" if value < previous else "flat"))
        rows.append(dict(driverId=driver["id"], points=points))
    season = int(calendar[0]["date"][:4]) if calendar else None
    return pack("momentum", dict(definition="Synthetic fixture index, 0–100. Higher means stronger sample momentum; delta is index points, not percentage points.", drivers=rows), season=season)


def season_stats():
    calendar, drivers, teams, entrants = read("calendar"), read("drivers"), read("teams"), read("driver_standings")
    years = {int(r["date"][:4]) for r in calendar}
    season = next(iter(years)) if len(years) == 1 else None
    tracks = {r.get("trackId") for r in calendar if r.get("trackId")}
    data = dict(season=season, seasonEntrants=len({r["id"] for r in entrants}),
                currentLineup=sum(bool(r["active"]) for r in drivers), teams=sum(bool(t["active"]) for t in teams),
                scheduledEvents=len([r for r in calendar if r["status"] != "cancelled"]),
                uniqueCircuits=len(tracks) if calendar and all(r.get("trackId") for r in calendar) else None,
                completedRaces=sum(r["status"] == "completed" for r in calendar),
                scope="Counts of the shipped directory, standings entrants and calendar status flags; their as-of dates may differ. Unique circuits unavailable without calendar track IDs.")
    return pack("season_stats", data, season=season, placeholder=False)


def prediction_stages():
    calendar = read("calendar")
    event = next((r for r in calendar if r["status"] == "upcoming"), calendar[-1])
    race_id = event_id(event)
    drivers = [d for d in read("drivers") if d["active"]]
    stages = []
    for index, stage in enumerate(["pre-weekend", "post-fp2", "post-quali"]):
        weights = [len(drivers) - i + ((i + index) % 3) for i in range(len(drivers))]
        total = sum(weights)
        rows = [dict(driverId=d["id"], driverName=d["fullName"], winProbability=round(weights[i] / total, 6), predictedPosition=i + 1) for i, d in enumerate(drivers)]
        rows.sort(key=lambda row: -row["winProbability"])
        for position, row in enumerate(rows):
            row["predictedPosition"] = position + 1
        stages.append(dict(stage=stage, snapshotId=f"sample-{race_id}-{stage}", modelId="sample-fixture", modelVersion="1.0.0", generatedAt="2026-09-01T00:00:00Z", predictions=rows))
    return pack("prediction_stages", dict(raceId=race_id, eventName=event["grandPrix"], fieldSize=len(drivers), stages=stages), season=int(event["date"][:4]), race_id=race_id)
