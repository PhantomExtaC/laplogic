import sys
from pathlib import Path
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.export.momentum import build

class MomentumTests(unittest.TestCase):
    def source(self):
        return {"season": 2026, "throughRound": 7, "schedule": [{"round": str(n)} for n in range(1, 8)], "results": [{"round": str(n), "Results": [{"Driver": {"driverId": "a"}, "position": "1"}, {"Driver": {"driverId": "b"}, "position": "2"}]} for n in range(1, 8)], "standings": {"driver": {"DriverStandings": [{"Driver": {"driverId": "a"}}, {"Driver": {"driverId": "b"}}]}}}
    def test_sample_minimum_extremes_and_window(self):
        rows = build(self.source(), {"placeholder": False})["data"]["drivers"]
        self.assertEqual(len(rows[0]["points"]), 5)
        self.assertAlmostEqual(rows[0]["points"][0]["momentum"], 100)
        self.assertIsNone(rows[0]["points"][0]["delta"])
        self.assertEqual(rows[1]["points"][-1]["momentum"], 0)
        self.assertIsNone(rows[1]["points"][-1]["racecraft"])
    def test_missing_event_resets_sample(self):
        source = self.source()
        source["results"] = [r for r in source["results"] if r["round"] != "4"]
        values = build(source, {})["data"]["drivers"][0]["points"]
        self.assertEqual([row["momentum"] is None for row in values], [False, True, True, True, False])
    def test_later_outcome_does_not_change_earlier_values(self):
        source = self.source()
        before = build(source, {})
        source["results"][-1]["Results"].reverse()
        for n, row in enumerate(source["results"][-1]["Results"], 1): row["position"] = str(n)
        after = build(source, {})
        self.assertEqual(before["data"]["drivers"][0]["points"][:-1], after["data"]["drivers"][0]["points"][:-1])
    def test_invalid_classification_rejected(self):
        source = self.source()
        source["results"][0]["Results"][1]["position"] = "1"
        with self.assertRaises(ValueError): build(source, {})
