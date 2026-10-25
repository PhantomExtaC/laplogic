import sys
from pathlib import Path
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.export.circuit_map import resolve


class CircuitMappingTests(unittest.TestCase):
    def test_explicit_reference_with_country_alias(self):
        circuit = {"circuitId": "silverstone", "Location": {"country": "UK"}}
        tracks = [{"id": "silverstone_circuit", "country": "United Kingdom"}]
        self.assertEqual(resolve(circuit, tracks), "silverstone_circuit")
        tracks[0]["country"] = "Italy"
        with self.assertRaises(ValueError): resolve(circuit, tracks)

    def test_missing_target_rejected(self):
        with self.assertRaises(ValueError):
            resolve({"circuitId": "monza", "Location": {"country": "Italy"}}, [])

    def test_unreviewed_reference_never_guesses_by_name(self):
        self.assertIsNone(resolve({"circuitId": "new_monza", "circuitName": "Monza"}, [{"id": "monza"}]))
