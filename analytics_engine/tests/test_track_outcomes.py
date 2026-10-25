from pathlib import Path
import sys
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.export.track_outcomes import build

class TrackOutcomeTests(unittest.TestCase):
    def test_pole_denominator_excludes_unknown_grids(self):
        source = {"results": [{"round": "1", "date": "2026-01-01", "Results": [{"grid": "1", "position": "1"}]}, {"round": "2", "date": "2026-02-01", "Results": [{"position": "1"}]}]}
        rows = build(source, [{"round": 1, "trackId": "a"}, {"round": 2, "trackId": "a"}, {"round": 3, "trackId": "b"}], {})["data"]
        self.assertEqual(rows[0]["sampleCount"], 2)
        self.assertEqual(rows[0]["poleStarts"], 1)
        self.assertEqual(rows[0]["poleToWin"], 1)
        self.assertIsNone(rows[1]["poleToWin"])
    def test_known_pole_loss_remains_zero(self):
        source = {"results": [{"round": "1", "date": "2026-01-01", "Results": [{"grid": "1", "position": "2"}]}]}
        self.assertEqual(build(source, [{"round": 1, "trackId": "a"}], {})["data"][0]["poleToWin"], 0)
