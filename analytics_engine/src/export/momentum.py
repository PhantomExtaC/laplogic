"""Descriptive season form from recorded classifications; not predictive ratings."""
from math import isfinite

DEFINITION = (
    "Recorded race finishing form, 0–100; higher is better. Each result scores "
    "100 × (field size − classified position) / (field size − 1). "
    "Adjusted exponential mean, span 10, within this season, after each race; "
    "minimum three consecutive recorded starts. Gaps or absence reset the sample. "
    "Last five scheduled rounds through the result cutoff; missing values are unavailable. "
    "All classified entrants, including retirements, count. Racecraft unavailable. "
    "Delta is index points from the previous round, not percentage points. "
    "Excludes sprints; descriptive, not a forecast or the legacy engine power rating."
)


def build(source, meta):
    races = {int(r["round"]): r for r in source["results"]}
    rounds = sorted(int(r["round"]) for r in source["schedule"] if int(r["round"]) <= source["throughRound"])
    ids = sorted(row["Driver"]["driverId"] for row in source.get("standings", {}).get("driver", {}).get("DriverStandings", []))
    state = {identifier: [0., 0., 0, None] for identifier in ids}
    points = {identifier: [] for identifier in ids}
    for number in rounds:
        rows = races.get(number, {}).get("Results", [])
        positions = [int(row["position"]) for row in rows]
        if rows and sorted(positions) != list(range(1, len(rows) + 1)):
            raise ValueError("Form requires a complete unique classification")
        classified = {row["Driver"]["driverId"]: int(row["position"]) for row in rows}
        if len(classified) != len(rows): raise ValueError("Duplicate form driver")
        for identifier in ids:
            total, weight, count, previous = state[identifier]
            value = None
            if identifier in classified and len(rows) >= 2:
                score = 100 * (len(rows) - classified[identifier]) / (len(rows) - 1)
                total, weight, count = total * 9 / 11 + score, weight * 9 / 11 + 1, count + 1
                if count >= 3: value = total / weight
                if value is not None and not isfinite(value): raise ValueError("Nonfinite form")
            else:
                total, weight, count = 0., 0., 0
            delta = value - previous if value is not None and previous is not None else None
            points[identifier].append({"raceId": f"{source['season']}-r{number}", "round": number, "momentum": value, "racecraft": None, "delta": delta, "direction": "unknown" if delta is None else "up" if delta > 0 else "down" if delta < 0 else "flat"})
            state[identifier] = [total, weight, count, value]
    return {"meta": {**meta, "source": "Jolpica recorded classifications; season finishing form v1"}, "data": {"definition": DEFINITION, "drivers": [{"driverId": identifier, "points": points[identifier][-5:]} for identifier in ids]}}
