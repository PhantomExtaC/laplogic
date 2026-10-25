"""Publish a validated allowlist into a checkout before building/deploying it."""
import json
import os


def publish(candidate, destination, backup, write):
    files = sorted(candidate.glob("*.json"))
    if not files: raise ValueError("Empty publication")
    backup.mkdir(parents=True, exist_ok=True)
    previous = {}
    for file in files:
        target = destination / file.name
        previous[file.name] = json.loads(target.read_text(encoding="utf-8")) if target.exists() else None
    write(backup / "previous.json", previous)
    changed = []
    def replace(path, value):
        try:
            write(path, value)
        except PermissionError:
            if os.name != "nt": raise
            # Windows readers may deny rename while allowing writes. This is a
            # build checkout, never a running release; backup precedes all writes.
            path.write_text(json.dumps(value, indent=2, allow_nan=False) + "\n", encoding="utf-8")
    try:
        for file in files:
            value = json.loads(file.read_text(encoding="utf-8"))
            if value == previous[file.name]: continue
            changed.append(file.name)
            replace(destination / file.name, value)
    except Exception:
        for name in reversed(changed):
            value = previous[name]
            if value is None: (destination / name).unlink(missing_ok=True)
            else: replace(destination / name, value)
        raise
