"""Safe helpers for versioned JSON exports. Paths resolve from the repository root."""
import json
import os
import tempfile
from pathlib import Path
ROOT = Path(__file__).resolve().parents[3]
def build_meta(*, source, placeholder=True, snapshot_id=None, season=None, race_id=None, generated_at=None, data_through=None):
    return dict(schemaVersion="1.0.0", snapshotId=snapshot_id, season=season, raceId=race_id, generatedAt=generated_at, dataThrough=data_through, placeholder=placeholder, source=source)
def write_json_atomic(path, payload, *, force=False):
    target = ROOT / path
    if target.exists() and not force:
        existing = json.loads(target.read_text(encoding="utf-8"))
        if not isinstance(existing, dict) or existing.get("meta", {}).get("placeholder") is not True:
            raise ValueError(f"Refusing to overwrite real or unclassified export: {target}")
    target.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(dir=target.parent, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            json.dump(payload, stream, indent=2, allow_nan=False)
            stream.write("\n")
        os.replace(name, target)
    finally:
        if os.path.exists(name):
            os.unlink(name)
