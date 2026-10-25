import copy
from pathlib import Path
import sys
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.export.live_core import convert

class ConversionTests(unittest.TestCase):
    def setUp(self):
        self.race={"season":"2026","round":"1","date":"2026-03-01","time":"12:00:00Z","raceName":"Fixture","Circuit":{"circuitId":"fixture","Location":{"country":"Test"}}}
        self.driver={"driverId":"a","givenName":"A","familyName":"B","nationality":"Test","permanentNumber":"7","code":"AAA"}
        self.team={"constructorId":"new","name":"Team","nationality":"Test"}
        self.source={"season":2026,"throughRound":1,"schedule":[self.race],"results":[{**self.race,"Results":[{"Driver":self.driver,"Constructor":self.team}]}],"standings":{"driver":{"season":"2026","round":"1","DriverStandings":[{"position":"1","points":"0","wins":"0","Driver":self.driver,"Constructors":[{"constructorId":"old"},self.team]}]},"constructor":{"season":"2026","round":"1","ConstructorStandings":[{"position":"1","points":"0","wins":"0","Constructor":self.team}]}}}
        self.outputs={"driver_registry.json":{"meta":{},"data":[]},"season_stats.json":{"meta":{"dataThrough":None},"data":{"currentLineup":1}}}
    def run_conversion(self): return convert(copy.deepcopy(self.outputs),self.source,"2026-03-02T12:00:00Z")
    def test_live_provenance_zero_and_transfer(self):
        result=self.run_conversion()
        standing=result["driver_standings.json"]
        self.assertEqual(standing["data"][0]["currentTeamId"],"new")
        self.assertEqual(standing["data"][0]["points"],0)
        self.assertEqual(standing["meta"]["dataThrough"],"2026-03-01")
        self.assertEqual(result["calendar.json"]["data"][0]["startsAt"],"2026-03-01T12:00:00Z")
        self.assertIsNone(result["season_stats.json"]["meta"]["dataThrough"])
    def test_wrong_standings_cutoff_rejected(self):
        self.source["standings"]["driver"]["round"]="2"
        with self.assertRaises(ValueError): self.run_conversion()
    def test_missing_number_stays_null(self):
        del self.driver["permanentNumber"]
        self.assertIsNone(self.run_conversion()["driver_standings.json"]["data"][0]["driverNumber"])
    def test_unmapped_circuit_and_timezone_stay_null(self):
        row=self.run_conversion()["calendar.json"]["data"][0]
        self.assertIsNone(row["trackId"]); self.assertIsNone(row["timezone"])
    def test_replay_is_deterministic(self): self.assertEqual(self.run_conversion(),self.run_conversion())
    def test_observation_requires_timezone(self):
        with self.assertRaises(ValueError):
            convert(copy.deepcopy(self.outputs), self.source, "2026-03-02T12:00:00")

if __name__ == "__main__": unittest.main()
