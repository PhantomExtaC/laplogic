import json
from pathlib import Path
import sys
import tempfile
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from updater import lock, stage

class UpdaterTests(unittest.TestCase):
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
