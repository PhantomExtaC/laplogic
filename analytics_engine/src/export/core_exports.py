"""Core exports from an explicitly supplied cached bundle. No invented freshness."""
import json
from pathlib import Path


def build(source, public, season):
    def read(name):
        payload = json.loads((source / (name + ".json")).read_text(encoding="utf-8"))
        if isinstance(payload, dict) and payload.get("meta", {}).get("placeholder"):
            raise ValueError(f"Sample input cannot become real: {name}")
        return payload
    names = ["calendar", "drivers", "teams", "tracks", "driver_standings", "constructor_standings"]
    outputs = {name + ".json": read(name) for name in names}
    def rows(name):
        value = outputs[name + ".json"]
        return value["data"] if isinstance(value, dict) else value
    calendar, drivers, teams = rows("calendar"), rows("drivers"), rows("teams")
    if not calendar or any(int(row["date"][:4]) != season for row in calendar):
        raise ValueError("Calendar season mismatch or empty calendar")
    for name in names:
        data = rows(name)
        key = "round" if name == "calendar" else "id"
        if len({row[key] for row in data}) != len(data):
            raise ValueError(f"Duplicate identities in {name}")
    team_ids = {row["id"] for row in teams}
    if any(row["currentTeamId"] not in team_ids for row in drivers if row["active"]):
        raise ValueError("Unresolved active driver team")
    def pack(data, origin):
        return {"meta": {"schemaVersion": "1.0.0", "snapshotId": None, "season": season,
                "raceId": None, "generatedAt": None, "dataThrough": None, "placeholder": False,
                "source": origin}, "data": data}
    registry = {}
    for row in rows("driver_standings"):
        registry[row["id"]] = {"canonicalId": row["id"], "aliases": [row["id"]], "abbreviation": None, "number": row["driverNumber"]}
    for row in drivers:
        registry[row["id"]] = {"canonicalId": row["id"], "aliases": sorted(set([row["id"], row["abbreviation"], row["abbreviation"].lower()])), "abbreviation": row["abbreviation"], "number": row["number"]}
    aliases = [alias for row in registry.values() for alias in row["aliases"]]
    if len(set(aliases)) != len(aliases): raise ValueError("Ambiguous driver aliases")
    outputs["driver_registry.json"] = pack(list(registry.values()), "Derived from supplied directories and standings; as-of unavailable")
    outputs["track_registry.json"] = pack([{"canonicalId": row["id"], "aliases": [row["id"]], "engineCircuitId": None} for row in rows("tracks")], "Supplied track IDs; engine circuit mapping unavailable in this bundle")
    outputs["asset_manifest.json"] = pack(sorted("/" + file.relative_to(public).as_posix() for file in (public / "images").rglob("*") if file.is_file()), "Local public/images filesystem")
    outputs["season_stats.json"] = pack({"season": season, "seasonEntrants": len(rows("driver_standings")), "currentLineup": sum(row["active"] for row in drivers), "teams": sum(row["active"] for row in teams), "scheduledEvents": len(calendar), "uniqueCircuits": len({row["trackId"] for row in calendar}) if all(row.get("trackId") for row in calendar) else None, "completedRaces": sum(row["status"] == "completed" for row in calendar), "scope": "Counts of supplied exports and status flags; source as-of unavailable. Not live championship status."}, "Derived from supplied calendar, directories and standings")
    return outputs
