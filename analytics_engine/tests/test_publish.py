import json
from pathlib import Path
import sys
import tempfile
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.export.publish import publish
from updater import atomic_json

class PublicationTests(unittest.TestCase):
    def test_partial_write_restores_previous_files(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source, target = root / "candidate", root / "public"
            source.mkdir(); target.mkdir()
            for name in ("a.json", "b.json"): atomic_json(source / name, {"new": True})
            atomic_json(target / "a.json", {"old": True})
            def fail(path, value):
                if path == target / "b.json" and value == {"new": True}: raise OSError("disk failure")
                atomic_json(path, value)
            with self.assertRaises(OSError): publish(source, target, root / "backup", fail)
            self.assertEqual(json.loads((target / "a.json").read_text()), {"old": True})
            self.assertFalse((target / "b.json").exists())
            publish(source, target, root / "backup2", atomic_json)
            self.assertEqual(json.loads((target / "b.json").read_text()), {"new": True})
