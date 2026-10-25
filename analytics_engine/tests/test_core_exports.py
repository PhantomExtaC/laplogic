import json
from pathlib import Path
import sys
import tempfile
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.export.core_exports import build
ROOT = Path(__file__).resolve().parents[2]

class CoreTests(unittest.TestCase):
    def test_real_cached_bundle_preserves_provenance(self):
        result = build(ROOT / "web_app/public/data", ROOT / "web_app/public", 2026)
        self.assertEqual(len(result), 10)
        self.assertIsNone(result["season_stats.json"]["meta"]["dataThrough"])
        self.assertFalse(result["season_stats.json"]["meta"]["placeholder"])
        self.assertEqual(result["season_stats.json"]["data"]["currentLineup"], 22)
    def test_wrong_season_rejected(self):
        with self.assertRaises(ValueError): build(ROOT / "web_app/public/data", ROOT / "web_app/public", 2025)
    def test_sample_source_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            (Path(folder) / "calendar.json").write_text(json.dumps({"meta": {"placeholder": True}, "data": []}))
            with self.assertRaisesRegex(ValueError, "Sample input"):
                build(Path(folder), ROOT / "web_app/public", 2026)

if __name__ == "__main__": unittest.main()
