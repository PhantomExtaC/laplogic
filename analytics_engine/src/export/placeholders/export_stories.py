"""Outputs stories/index.json and immutable stories/<id>.json envelopes.
Index data[]: id,type(track-profile|projection|recalibration|audit),raceId,eventName,
publishedAt ISO,snapshotId,modelId,modelVersion nullable,title,summary. Article data
adds blocks[] discriminated by type: paragraph/heading {text}, delta {label,before,
after} nullable probability fractions, audit {outcomeId}; chartRefs[]{snapshotId,
summary}, socialLinks[]{label,url HTTP(S)}. Metadata binds original event/snapshot.
Intended source: reviewed model reports, frozen forecasts and official results.
TODO(real-export): publish reviewed articles under new IDs; never rewrite archives.
"""
import argparse
from fixtures import read, pack
from export_utils import write_json_atomic, ROOT


def build():
    history = read("arena_history")["data"]
    race = history["races"][0]
    snapshot = read("snapshots/" + race["snapshotId"])["data"]
    articles = []
    for kind, title, summary in [
        ("track-profile", "Reading a circuit profile", "How to interpret a track profile when sample windows are unavailable."),
        ("projection", "A frozen projection", "A sample forecast preserved with the model that produced it."),
        ("recalibration", "Reading a probability revision", "A synthetic before-and-after example, expressed in percentage points."),
        ("audit", "Checking the frozen picks", "Compare original sample picks with a separately frozen illustrative outcome."),
    ]:
        header = {"id": "sample-" + kind + "-v1", "type": kind, "raceId": race["raceId"], "eventName": race["eventName"], "publishedAt": "2026-10-25T00:00:00Z", "snapshotId": race["snapshotId"], "modelId": snapshot["predictions"][0]["modelId"], "modelVersion": snapshot["predictions"][0].get("modelVersion"), "title": title, "summary": summary}
        blocks = [{"type": "heading", "text": "Read the evidence in context"}, {"type": "paragraph", "text": "This is a sample article with synthetic analytical values and illustrative outcomes. It demonstrates a publication format, not a claim about a real race. The original event, model and forecast remain attached when newer reports are published."}]
        if kind == "track-profile":
            blocks.append({"type": "paragraph", "text": "A circuit label alone does not establish degradation direction or pole conversion. Missing sample windows and denominators remain unavailable until an engine export supplies them."})
        if kind == "recalibration":
            blocks.append({"type": "delta", "label": "Illustrative win probability revision", "before": .12, "after": .15})
        if kind == "audit":
            blocks.append({"type": "audit", "outcomeId": race["outcomeId"]})
        payload = pack("stories", {**header, "blocks": blocks, "chartRefs": [{"snapshotId": race["snapshotId"], "summary": "Original sample model picks and raw win probabilities, preserved without reference to the current evaluation."}], "socialLinks": []}, season=race["season"], race_id=race["raceId"], snapshot_id=race["snapshotId"])
        articles.append(payload)
    return articles

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    published = []
    for article in build():
        target = "web_app/public/data/stories/" + article["data"]["id"] + ".json"
        if not (ROOT / target).exists():
            write_json_atomic(target, article)
        # Index the actual immutable bytes, including on a subsequent exporter run.
        stored = read("stories/" + article["data"]["id"])
        keys = ["id", "type", "raceId", "eventName", "publishedAt", "snapshotId", "modelId", "modelVersion", "title", "summary"]
        published.append({key: stored["data"][key] for key in keys})
    write_json_atomic("web_app/public/data/stories/index.json", pack("stories", published, season=2026), force=args.force)
