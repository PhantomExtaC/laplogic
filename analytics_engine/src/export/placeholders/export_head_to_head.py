"""Output head_to_head.json: 1.0.0 envelope; season; metricDefinitions mapping;
drivers:[{driverId, metrics:{key:{raw,normalized(0–100),sampleCount,minimumSamples,
higherIsBetter,unit}}, tracks:[{trackId,metrics:{...}}]}]. Nullable raw/normalized
means unavailable. Direction applies to the normalized raw scale; the UI flips
lower-is-better axes. Intended source: processed power ratings and mastery matrix.
TODO(real-export): replace these synthetic fixtures with comparable real metrics.
"""
import argparse
from fixtures import read, pack
from export_utils import write_json_atomic


def build():
    drivers, tracks = read("drivers"), read("tracks")
    def metric(raw, norm, count, higher=True, unit="index"):
        return dict(raw=raw, normalized=norm, sampleCount=count, minimumSamples=3, higherIsBetter=higher, unit=unit)
    rows = []
    for i, driver in enumerate(drivers):
        count = 0 if i == len(drivers) - 1 else 12
        metrics = dict(racecraft=metric(round(1 + i / 10, 2), 40 + i % 10 * 4, count),
                       trackMastery=metric(round(8 + i / 5, 2), 30 + i % 10 * 5, count, False, "loss index"),
                       momentum=metric(35 + i % 9 * 5, 35 + i % 9 * 5, count))
        rows.append(dict(driverId=driver["id"], metrics=metrics,
                         tracks=[dict(trackId=t["id"], metrics={"trackMastery": metric(7 + i / 5, 25 + i % 10 * 5, count, False, "loss index")}) for t in tracks[:3]]))
    calendar = read("calendar")
    season = int(calendar[0]["date"][:4])
    return pack("head_to_head", dict(season=season,
        metricDefinitions={"racecraft": "Synthetic racecraft index; higher is better. Minimum three observations.",
            "trackMastery": "Synthetic loss index; lower is better. Normalized axis is inverted for the radar. Track overrides exist only for listed fixtures.",
            "momentum": "Synthetic index; higher is better. Not live form or a calibrated forecast."}, drivers=rows), season=season)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    write_json_atomic("web_app/public/data/head_to_head.json", build(), force=args.force)
