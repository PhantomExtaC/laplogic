"""Stage and validate core exports. Publishing the website is deferred to U7.

Examples: python updater.py --season 2026 --dry-run
          python updater.py --season 2026 --input-dir /verified/export/bundle
Input files are cached source exports; this runner never claims they are live.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
from contextlib import contextmanager
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent.parent


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()


@contextmanager
def lock(folder):
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / "update.lock"
    descriptor = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    try:
        os.write(descriptor, str(os.getpid()).encode())
        os.close(descriptor)
        yield
    finally:
        path.unlink(missing_ok=True)


def atomic_json(path, payload):
    with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, delete=False) as stream:
        temporary = Path(stream.name)
        json.dump(payload, stream, indent=2, allow_nan=False)
        stream.write("\n")
    try:
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def stage(payloads, folder, validate):
    """Only validated, immutable candidates become visible under releases/."""
    if not payloads or any(Path(name).name != name or not name.endswith(".json") for name in payloads):
        raise ValueError("Invalid export allowlist")
    digest = hashlib.sha256(canonical(payloads)).hexdigest()[:24]
    releases = folder / "releases"
    releases.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="candidate-", dir=folder) as temporary:
        candidate = Path(temporary)
        for name, payload in payloads.items():
            atomic_json(candidate / name, payload)
        validate(candidate)
        destination = releases / digest
        if destination.exists():
            existing = {name: json.loads((destination / name).read_text(encoding="utf-8")) for name in payloads}
            if canonical(existing) != canonical(payloads):
                raise ValueError("Existing release does not match its content hash")
            return digest, False
        # Rename within the same filesystem exposes the whole validated candidate.
        os.replace(candidate, destination)
    return digest, True


def validate_frontend(candidate):
    env = dict(os.environ, LAPLOGIC_CANDIDATE=str(candidate))
    npm = "npm.cmd" if os.name == "nt" else "npm"
    subprocess.run([npm, "test", "--", "src/data/coreCandidate.test.ts"], cwd=ROOT / "web_app", env=env, check=True, timeout=120)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--season", type=int, required=True)
    parser.add_argument("--input-dir", type=Path, default=ROOT / "web_app/public/data")
    parser.add_argument("--work-dir", type=Path, default=ROOT / ".updater")
    parser.add_argument("--source-snapshot", type=Path, help="Replay a saved live source without network access")
    parser.add_argument("--source-observed-at", help="Required original fetch timestamp when replaying")
    parser.add_argument("--live", action="store_true", help="Stage live calendar and standings alongside cached directories")
    parser.add_argument("--dry-run", action="store_true", help="Validate without updating the candidate pointer")
    args = parser.parse_args()
    if args.live and args.source_snapshot: parser.error("Choose live or saved snapshot")
    if args.source_snapshot and not args.source_observed_at: parser.error("Replay requires original --source-observed-at")
    if args.source_observed_at and not args.source_snapshot: parser.error("--source-observed-at is only valid for replay")
    from src.export.core_exports import build
    folder = args.work_dir.resolve()
    try:
        with lock(folder):
            report = {"startedAt": datetime.now(timezone.utc).isoformat(), "season": args.season, "sourceMode": "live-source-request" if args.live else "cached-export-bundle", "dryRun": args.dry_run}
            try:
                source = None
                if args.live:
                    from src.ingestion.jolpica import collect
                    source = collect(args.season)
                    source_id = hashlib.sha256(canonical(source)).hexdigest()[:24]
                    source_folder = folder / "sources"
                    source_folder.mkdir(exist_ok=True)
                    atomic_json(source_folder / (source_id + ".json"), source)
                    report.update(liveSourceId=source_id, throughRound=source["throughRound"], sourceMode="live-core-with-cached-directories")
                payloads = build(args.input_dir.resolve(), ROOT / "web_app/public", args.season)
                if args.source_snapshot:
                    source = json.loads(args.source_snapshot.read_text(encoding="utf-8"))
                    report["sourceMode"] = "replayed-live-core-with-cached-directories"
                if source is not None:
                    if source["season"] != args.season: raise ValueError("Requested season differs from snapshot")
                    from src.export.live_core import convert
                    payloads = convert(payloads, source, args.source_observed_at or report["startedAt"])
                identifier, created = stage(payloads, folder, validate_frontend)
                from src.export.freshness import describe
                report["resources"] = describe(payloads)
                report.update(status="validated", releaseId=identifier, changed=created, files=sorted(payloads))
                if not args.dry_run:
                    atomic_json(folder / "candidate.json", {"releaseId": identifier})
            except Exception as error:
                report.update(status="failed", error=str(error))
                raise
            finally:
                atomic_json(folder / "last-run.json", report)
    except Exception as error:
        parser.exit(1, f"Update failed: {error}\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
