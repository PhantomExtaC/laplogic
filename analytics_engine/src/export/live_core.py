"""Convert a verified season snapshot without mixing live and directory provenance."""
import hashlib
import json
from datetime import datetime


def convert(outputs, source, observed_at):
    season, cutoff = source["season"], source["throughRound"]
    if datetime.fromisoformat(observed_at.replace("Z", "+00:00")).tzinfo is None:
        raise ValueError("Source observation timestamp lacks timezone")
    snapshot = "jolpica-" + hashlib.sha256(json.dumps(source, sort_keys=True).encode()).hexdigest()[:24]
    races = {int(row["round"]): row for row in source["schedule"]}
    results = {int(row["round"]): row for row in source["results"]}
    if len(races) != len(source["schedule"]) or len(results) != len(source["results"]):
        raise ValueError("Duplicate event identity")
    if max(results, default=0) != cutoff or not set(results).issubset(races):
        raise ValueError("Invalid result cutoff")
    for row in list(races.values()) + list(results.values()):
        if int(row["season"]) != season: raise ValueError("Mixed source seasons")
    through = results[cutoff]["date"] if cutoff else None
    def pack(data, kind):
        return {"meta": {"schemaVersion": "1.0.0", "snapshotId": snapshot, "season": season, "raceId": None, "round": cutoff, "generatedAt": observed_at, "dataThrough": through, "placeholder": False, "source": "Jolpica " + kind + "; schedule observed at generatedAt; results through dataThrough"}, "data": data}
    def instant(row):
        if not row.get("time"): return None
        value = row["date"] + "T" + row["time"]
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None: raise ValueError("Session instant lacks timezone")
        return value
    calendar=[]
    for number, race in sorted(races.items()):
        sessions=[{"name": key, "startsAt": instant(race[key])} for key in ["FirstPractice", "SecondPractice", "ThirdPractice", "Qualifying", "SprintQualifying", "SprintShootout", "Sprint"] if key in race]
        sessions.append({"name": "Race", "startsAt": instant(race)})
        calendar.append({"season": season, "raceId": f"{season}-r{number}", "round": number, "grandPrix": race["raceName"], "date": race["date"], "sprintWeekend": "Sprint" in race, "status": "completed" if number in results else "upcoming", "trackId": None, "country": race["Circuit"]["Location"]["country"], "timezone": None, "startsAt": instant(race), "sessions": sessions})
    # API circuit IDs are not the site's directory IDs. Leave the join unavailable.
    outputs["calendar.json"] = pack(calendar, "schedule and recorded results")
    latest_team={}
    for _, race in sorted(results.items()):
        ids=set()
        for result in race["Results"]:
            identifier=result["Driver"]["driverId"]
            if identifier in ids: raise ValueError("Duplicate result driver")
            ids.add(identifier)
            latest_team[identifier]=result["Constructor"]["constructorId"]
    drivers, teams=[],[]
    for kind in ("driver", "constructor"):
        table=source["standings"].get(kind)
        if cutoff and (not table or int(table["season"]) != season or int(table["round"]) != cutoff):
            raise ValueError("Standings season/round mismatch")
        for row in (table or {}).get("DriverStandings" if kind == "driver" else "ConstructorStandings", []):
            entity=row["Driver" if kind == "driver" else "Constructor"]
            identifier=entity["driverId" if kind == "driver" else "constructorId"]
            item={"id":identifier,"position":int(row["position"]),"points":float(row["points"]),"wins":int(row["wins"]),"nationality":entity["nationality"],"imagePath":""}
            if kind == "driver":
                item.update(driverName=entity["givenName"]+" "+entity["familyName"],driverNumber=int(entity["permanentNumber"]) if entity.get("permanentNumber") else None,currentTeamId=latest_team.get(identifier))
                drivers.append(item)
            else:
                item["teamName"]=entity["name"]; teams.append(item)
    for rows in [drivers,teams]:
        if len({row["id"] for row in rows}) != len(rows): raise ValueError("Duplicate standings identity")
    team_ids={row["id"] for row in teams}
    if any(row["currentTeamId"] is not None and row["currentTeamId"] not in team_ids for row in drivers):
        raise ValueError("Standings constructor join unresolved")
    outputs["driver_standings.json"]=pack(drivers,"driver standings")
    outputs["constructor_standings.json"]=pack(teams,"constructor standings")
    registry={row["canonicalId"]:row for row in outputs["driver_registry.json"]["data"]}
    for row in source["standings"].get("driver",{}).get("DriverStandings",[]):
        entity=row["Driver"]; identifier=entity["driverId"]; code=entity.get("code")
        aliases=set(registry.get(identifier,{}).get("aliases",[])) | {identifier}
        if code: aliases.update([code,code.lower()])
        registry[identifier]={"canonicalId":identifier,"aliases":sorted(aliases),"abbreviation":code,"number":int(entity["permanentNumber"]) if entity.get("permanentNumber") else None}
    aliases=[alias for row in registry.values() for alias in row["aliases"]]
    if len(aliases)!=len(set(aliases)): raise ValueError("Ambiguous driver aliases")
    outputs["driver_registry.json"]["data"]=list(registry.values())
    outputs["driver_registry.json"]["meta"]["source"]="Cached directory IDs plus Jolpica standings identities; mixed source dates"
    stats=outputs["season_stats.json"]["data"]
    stats.update(seasonEntrants=len(drivers),scheduledEvents=len(calendar),completedRaces=len(results),uniqueCircuits=len({r["Circuit"]["circuitId"] for r in races.values()}),scope="Schedule and entrants from Jolpica through round %s; lineup/team counts remain cached directory scope with unknown as-of." % cutoff)
    return outputs
