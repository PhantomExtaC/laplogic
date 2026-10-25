"""Driver descriptive comparisons from the same recorded season classifications."""
from math import isfinite


def build(source, calendar, meta):
    observations = {}
    track_ids = {row["round"]: row["trackId"] for row in calendar}
    for race in source["results"]:
        rows = race["Results"]
        field = len(rows)
        if field < 2 or sorted(int(row["position"]) for row in rows) != list(range(1, field + 1)):
            raise ValueError("Comparison requires a complete unique classification")
        seen = set()
        for row in rows:
            identifier = row["Driver"]["driverId"]
            if identifier in seen: raise ValueError("Duplicate comparison driver")
            seen.add(identifier)
            position, points = int(row["position"]), float(row["points"])
            if not isfinite(points) or points < 0: raise ValueError("Invalid race points")
            observations.setdefault(identifier, []).append({"position": position, "points": points, "percentile": 100 * (field - position) / (field - 1), "trackId": track_ids.get(int(race["round"]))})

    maximum_points = max((r["points"] for rows in observations.values() for r in rows), default=0)
    def metrics(rows, minimum):
        count = len(rows)
        def metric(raw, normalized, unit, higher):
            return {"raw": raw if count >= minimum else None, "normalized": normalized if count >= minimum else None, "sampleCount": count, "minimumSamples": minimum, "higherIsBetter": higher, "unit": unit}
        mean = lambda key: sum(row[key] for row in rows) / count if count else 0
        podium = sum(row["position"] <= 3 for row in rows) / count * 100 if count else 0
        return {"Mean finish": metric(mean("position"), 100 - mean("percentile"), "classified position", False), "Race points per start": metric(mean("points"), mean("points") / maximum_points * 100 if maximum_points else 0, "points; races only", True), "Podium rate": metric(podium, podium, "% of recorded starts", True)}

    drivers = []
    for identifier, rows in sorted(observations.items()):
        tracks = [{"trackId": track, "metrics": metrics([r for r in rows if r["trackId"] == track], 1)} for track in sorted({r["trackId"] for r in rows if r["trackId"]})]
        drivers.append({"driverId": identifier, "metrics": metrics(rows, 3), "tracks": tracks})
    return {"meta": {**meta, "source": "Jolpica race classifications; descriptive comparison v1"}, "data": {"season": source["season"], "metricDefinitions": {"Mean finish": "Arithmetic mean of official classified position, including retired classified entrants. Lower raw is better. Export normalization is mean finishing loss percentile; the chart reverses it so higher is better.", "Race points per start": "Arithmetic mean of recorded race points, including genuine zeros. Excludes sprints. Radar divides the mean by the largest single race points award observed in this source snapshot (all-zero cohort scores zero).", "Podium rate": "Recorded classifications in positions 1–3 divided by recorded starts, expressed as percent.", "Sample policy": "Season-only descriptive observations, not matched teammate duels or a forecast. Overall minimum three starts; track context minimum one start and must be read with its count. Absence is excluded, never treated as a zero result. No fallback from track to overall."}, "drivers": drivers}}
