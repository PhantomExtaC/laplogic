import io
import json
from pathlib import Path
import sys
import unittest
from urllib.error import HTTPError
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.ingestion.jolpica import Client, collect

class IngestionTests(unittest.TestCase):
    def test_retry_then_success(self):
        calls=[]
        def open_request(request, timeout):
            calls.append(timeout)
            if len(calls)==1: raise HTTPError(request.full_url,503,"busy",{},None)
            return io.BytesIO(json.dumps({"MRData":{"series":"f1","offset":"0"}}).encode())
        self.assertEqual(Client(open_request,lambda _:None).get("2026/")["series"],"f1")
        self.assertEqual(calls,[20,20])
    def test_permanent_error_is_not_retried(self):
        calls=[]
        def fail(request,timeout):
            calls.append(1); raise HTTPError(request.full_url,404,"missing",{},None)
        with self.assertRaises(HTTPError): Client(fail,lambda _:None).get("2026/")
        self.assertEqual(len(calls),1)
    def test_result_pages_merge_one_race(self):
        client=Client(sleep=lambda _:None)
        def page(path,offset=0):
            return {"total":"2","RaceTable":{"Races":[{"season":"2026","round":"1","Results":[{"Driver":{"driverId":str(offset)}}]}]}}
        client.get=page
        self.assertEqual(len(client.races(2026,True)[0]["Results"]),2)
    def test_empty_page_cannot_silently_truncate(self):
        client=Client(sleep=lambda _:None)
        client.get=lambda *args:{"total":"1","RaceTable":{"Races":[]}}
        with self.assertRaises(ValueError): client.races(2026)
    def test_whole_season_refresh_accepts_earlier_gap(self):
        class Fake:
            def races(self,season,results=False):
                return [{"season":str(season),"round":str(n),**({"Results":[{"Driver":{"driverId":"a"}}]} if results else {})} for n in [1,3]]
            def get(self,path):
                return {"total":"1","limit":"100","StandingsTable":{"StandingsLists":[{"season":"2026","round":"3"}]}}
        value=collect(2026,Fake())
        self.assertEqual([r["round"] for r in value["results"]],["1","3"])
        self.assertEqual(value["throughRound"],3)

if __name__ == "__main__": unittest.main()
