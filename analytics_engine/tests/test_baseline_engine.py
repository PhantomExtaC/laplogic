import copy
from pathlib import Path
import sys
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.export.baseline_engine import build, distribution

class BaselineTests(unittest.TestCase):
    def source(self):
        return {"results": [{"round": str(n), "date": f"2026-01-{n:02d}", "Results": [{"position": str(i), "Driver": {"driverId": d, "givenName": d, "familyName": "Driver"}} for i, d in enumerate(["a", "b"], 1)]} for n in range(1, 6)]}
    def run_engine(self, source):
        return build(source, [{"status": "upcoming", "raceId": "2026-r6", "startsAt": "2026-02-01T12:00:00Z"}], {"snapshotId": "source"}, "2026-01-20T12:00:00Z")
    def test_distribution_is_categorical_with_positive_unseen_prior(self):
        probs = distribution(["a", "b"], {"a": 3})
        self.assertAlmostEqual(sum(probs.values()), 1)
        self.assertGreater(probs["b"], 0)
    def test_future_winner_cannot_change_prior_backtest(self):
        source = self.source(); before = self.run_engine(source)
        source["results"][-1]["Results"][0]["position"] = "2"
        source["results"][-1]["Results"][1]["position"] = "1"
        after = self.run_engine(source)
        self.assertEqual(before[2]["backtest"][-1]["probabilities"], after[2]["backtest"][-1]["probabilities"])
        self.assertNotEqual(before[0]["data"], after[0]["data"])
    def test_full_field_actual_cutoff_and_no_promotion(self):
        source = self.source(); untouched = copy.deepcopy(source)
        predictions, evaluation, artifact = self.run_engine(source)
        self.assertEqual(len(predictions["data"]), 2)
        self.assertEqual(evaluation["data"]["sampleCount"], 2)
        self.assertIsNone(evaluation["data"]["championId"])
        self.assertEqual(artifact["trainingRounds"], [1, 2, 3, 4, 5])
        self.assertEqual(source, untouched)
    def test_never_generates_a_past_forecast(self):
        predictions, _, _ = build(self.source(), [{"status": "upcoming", "raceId": "past", "startsAt": "2025-01-01T00:00:00Z"}], {"snapshotId": "source"}, "2026-01-20T12:00:00Z")
        self.assertIsNone(predictions["meta"]["raceId"])
        self.assertEqual(predictions["data"], [])
