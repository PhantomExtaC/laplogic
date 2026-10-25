"""Read-only Jolpica ingestion with bounded retries and complete season snapshots.
API contract: https://github.com/jolpica/jolpica-f1/blob/main/docs/README.md
"""
import json
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

BASE = "https://api.jolpi.ca/ergast/f1/"


class Client:
    def __init__(self, opener=urlopen, sleep=time.sleep):
        self.opener, self.sleep = opener, sleep

    def get(self, path, offset=0):
        request = Request(BASE + path + f"?limit=100&offset={offset}", headers={"User-Agent": "LapLogicUpdater/1.0"})
        for attempt in range(3):
            self.sleep(1)
            try:
                with self.opener(request, timeout=20) as response:
                    data = json.load(response)["MRData"]
                if data["series"] != "f1" or int(data["offset"]) != offset:
                    raise ValueError("Unexpected API series or pagination offset")
                return data
            except HTTPError as error:
                if error.code not in (429, 500, 502, 503, 504) or attempt == 2:
                    raise
                retry = error.headers.get("Retry-After", "") if error.headers else ""
                self.sleep(min(30, float(retry)) if retry.isdigit() else 2 ** attempt)
            except (URLError, TimeoutError):
                if attempt == 2: raise
                self.sleep(2 ** attempt)

    def races(self, season, results=False):
        path = f"{season}/" + ("results/" if results else "")
        offset, expected, records = 0, None, {}
        for _ in range(100):
            data = self.get(path, offset)
            total = int(data["total"])
            if expected is not None and total != expected:
                raise ValueError("Source changed while paging; retry the whole run")
            expected = total
            rows = data["RaceTable"]["Races"]
            consumed = 0
            for race in rows:
                if int(race["season"]) != season: raise ValueError("Wrong source season")
                key = int(race["round"])
                if results:
                    entries = race["Results"]
                    consumed += len(entries)
                    target = records.setdefault(key, {**race, "Results": []})
                    target["Results"].extend(entries)
                else:
                    if key in records: raise ValueError("Duplicate schedule round")
                    records[key] = race
                    consumed += 1
            offset += consumed
            if offset == total: return [records[key] for key in sorted(records)]
            if consumed == 0 or offset > total: raise ValueError("Incomplete or inconsistent pagination")
        raise ValueError("Pagination exceeded safety bound")


def collect(season, client=None):
    if not 1950 <= season <= 2100: raise ValueError("Invalid season")
    client = client or Client()
    schedule = client.races(season)
    if not schedule: raise ValueError("No schedule supplied")
    results = client.races(season, results=True)
    rounds = {int(race["round"]) for race in schedule}
    for race in results:
        if int(race["round"]) not in rounds: raise ValueError("Outcome has no scheduled event")
        ids = [row["Driver"]["driverId"] for row in race["Results"]]
        if not ids or len(ids) != len(set(ids)): raise ValueError("Duplicate or missing result identities")
    through = max((int(race["round"]) for race in results), default=0)
    standings = {}
    if through:
        for kind in ("driver", "constructor"):
            data = client.get(f"{season}/{through}/{kind}standings/")
            if int(data["total"]) > int(data["limit"]): raise ValueError("Standings pagination required")
            tables = data["StandingsTable"]["StandingsLists"]
            if len(tables) != 1 or int(tables[0]["season"]) != season or int(tables[0]["round"]) != through:
                raise ValueError("Standings do not match the result cutoff")
            standings[kind] = tables[0]
    # Every run re-reads the complete season: earlier gaps and corrections are included.
    # Missing rounds stay absent, never synthesized from dates or interpreted as zeros.
    return {"season": season, "throughRound": through, "schedule": schedule, "results": results, "standings": standings}
