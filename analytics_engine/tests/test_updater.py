import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
from urllib.error import URLError
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from updater import lock, stage, main

class UpdaterTests(unittest.TestCase):
    def test_fetch_outage_preserves_candidate_and_next_run_recovers(self):
        with tempfile.TemporaryDirectory() as temporary:
            folder = Path(temporary)
            payload = {"a.json": {"value": 0}}
            args = ["updater", "--season", "2026", "--work-dir", temporary]
            def validate(candidate):
                self.assertEqual(json.loads((candidate / "a.json").read_text()), {"value": 0})
            with patch("updater.validate_frontend", side_effect=validate), patch("src.export.core_exports.build", return_value=payload), patch("builtins.print"):
                with patch("sys.argv", args): main()
                before = {p.relative_to(folder): p.read_bytes() for p in folder.rglob("*.json") if p.name != "last-run.json"}
                with patch("sys.argv", args + ["--live"]), patch("src.ingestion.jolpica.collect", side_effect=URLError("offline")):
                    with self.assertRaises(SystemExit): main()
                self.assertEqual(json.loads((folder / "last-run.json").read_text())["status"], "failed")
                after = {p.relative_to(folder): p.read_bytes() for p in folder.rglob("*.json") if p.name != "last-run.json"}
                self.assertEqual(before, after)
                self.assertFalse((folder / "update.lock").exists())
                with patch("sys.argv", args): main()
                report = json.loads((folder / "last-run.json").read_text())
                self.assertEqual(report["status"], "validated")
                self.assertFalse(report["changed"])
    def test_lock_excludes_overlap_and_cleans_up(self):
        with tempfile.TemporaryDirectory() as folder:
            with lock(Path(folder)):
                with self.assertRaises(FileExistsError):
                    with lock(Path(folder)): pass
            self.assertFalse((Path(folder) / "update.lock").exists())

    def test_failed_validation_never_creates_release(self):
        with tempfile.TemporaryDirectory() as folder:
            def reject(candidate): raise ValueError("bad contract")
            with self.assertRaises(ValueError): stage({"a.json": {}}, Path(folder), reject)
            self.assertEqual(list((Path(folder) / "releases").iterdir()), [])

    def test_rerun_is_identical_and_immutable(self):
        with tempfile.TemporaryDirectory() as folder:
            first = stage({"a.json": {"value": 0}}, Path(folder), lambda _: None)
            second = stage({"a.json": {"value": 0}}, Path(folder), lambda _: None)
            self.assertTrue(first[1]); self.assertFalse(second[1]); self.assertEqual(first[0], second[0])
            target = Path(folder) / "releases" / first[0] / "a.json"
            target.write_text("{}")
            with self.assertRaises(ValueError): stage({"a.json": {"value": 0}}, Path(folder), lambda _: None)

    def test_path_escape_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaises(ValueError): stage({"../x.json": {}}, Path(folder), lambda _: None)

if __name__ == "__main__": unittest.main()
