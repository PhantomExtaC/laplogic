"""Observed circuit outcomes. Pit-stop counts are not tyre-wear measurements."""
def build(source, calendar, meta):
    tracks = {row["round"]: row["trackId"] for row in calendar}
    groups = {identifier: [] for identifier in tracks.values() if identifier}
    for race in source["results"]:
        identifier = tracks.get(int(race["round"]))
        if identifier: groups[identifier].append(race)
    data = []
    for identifier, races in sorted(groups.items()):
        poles, wins = 0, 0
        for race in races:
            rows = race["Results"]
            starters = [row for row in rows if row.get("grid") == "1"]
            if len(starters) > 1: raise ValueError("Duplicate pole starters")
            if starters:
                poles += 1
                wins += int(starters[0]["position"]) == 1
        dates = sorted(race["date"] for race in races)
        data.append({"trackId": identifier, "sampleCount": len(races), "poleStarts": poles, "poleWins": wins, "poleToWin": wins / poles if poles else None, "fromDate": dates[0] if dates else None, "toDate": dates[-1] if dates else None, "definition": "Selected-season recorded races only. Pole-to-win = classified wins by grid-position-1 starters / races with an identified grid-position-1 starter. Missing grids are excluded, not losses. Single-race samples describe an outcome, not a predictive probability. Tyre degradation and pit-stop delta require separate measurements."})
    return {"meta": {**meta, "source": "Jolpica grid and recorded classifications; circuit outcomes v1"}, "data": data}
