import copy
from pathlib import Path
import sys
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.export.comparison import build

class ComparisonTests(unittest.TestCase):
    def source(self):
        return {"season": 2026, "results": [{"round": str(n), "Results": [{"Driver": {"driverId": "a"}, "position": "1", "points": "25"}, {"Driver": {"driverId": "b"}, "position": "2", "points": "0"}]} for n in range(1, 4)]}
    def calculate(self, source):
        return build(source, [{"round": n, "trackId": "track"} for n in range(1, 4)], {"placeholder": False})["data"]["drivers"]
    def test_real_zero_counts_and_direction(self):
        rows = self.calculate(self.source())
        self.assertEqual(rows[0]["metrics"]["Mean finish"]["raw"], 1)
        self.assertEqual(rows[0]["metrics"]["Mean finish"]["normalized"], 0)
        self.assertFalse(rows[0]["metrics"]["Mean finish"]["higherIsBetter"])
        self.assertEqual(rows[1]["metrics"]["Race points per start"]["raw"], 0)
        self.assertEqual(rows[1]["metrics"]["Race points per start"]["sampleCount"], 3)
    def test_sparse_overall_and_track_minimum(self):
        source = self.source(); source["results"] = source["results"][:1]
        row = self.calculate(source)[0]
        self.assertIsNone(row["metrics"]["Mean finish"]["raw"])
        self.assertEqual(row["tracks"][0]["metrics"]["Mean finish"]["raw"], 1)
    def test_missing_points_not_zero(self):
        source = self.source(); del source["results"][0]["Results"][0]["points"]
        with self.assertRaises(KeyError): self.calculate(source)
    def test_export_does_not_mutate_input(self):
        source = self.source(); before = copy.deepcopy(source)
        self.calculate(source)
        self.assertEqual(source, before)
