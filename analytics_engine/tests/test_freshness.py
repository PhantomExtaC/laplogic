import sys
from pathlib import Path
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.export.freshness import describe

class FreshnessTests(unittest.TestCase):
    def test_copy_time_cannot_establish_coverage(self):
        rows = describe({"directory": [], "copied": {"meta": {"generatedAt": "2026-10-25"}}, "real": {"meta": {"dataThrough": "2026-10-11"}}, "sample": {"meta": {"placeholder": True, "dataThrough": "2026-10-11"}}})
        self.assertEqual([rows[k]["status"] for k in rows], ["unknown", "unknown", "dated", "sample"])
