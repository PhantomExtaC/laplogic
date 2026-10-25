"""Reviewed source-reference joins; never infer identity from display-name similarity.

Evidence: saved Jolpica schedule circuit IDs/locations and public tracks directory.
Unrepresented circuits (including Madring) remain unavailable.
"""
MAPPINGS = {
    "albert_park": "melbourne_grand_prix_circuit",
    "shanghai": "shanghai_international_circuit",
    "suzuka": "suzuka_circuit",
    "miami": "miami_international_autodrome",
    "villeneuve": "circuit_gilles_villeneuve",
    "monaco": "circuit_de_monaco",
    "catalunya": "circuit_de_barcelona_catalunya",
    "red_bull_ring": "red_bull_ring",
    "silverstone": "silverstone_circuit",
    "spa": "circuit_de_spa_francorchamps",
    "hungaroring": "hungaroring",
    "zandvoort": "circuit_park_zandvoort",
    "monza": "autodromo_nazionale_monza",
    "baku": "baku_city_circuit",
    "sepang": "sepang_international_circuit",
    "marina_bay": "marina_bay_street_circuit",
    "americas": "circuit_of_the_americas",
    "rodriguez": "aut_dromo_hermanos_rodr_guez",
    "interlagos": "aut_dromo_jos_carlos_pace",
    "vegas": "las_vegas_street_circuit",
    "losail": "lusail_international_circuit",
    "yas_marina": "yas_marina_circuit",
}
COUNTRIES = {"USA": "United States of America", "UK": "United Kingdom", "UAE": "United Arab Emirates"}


def resolve(circuit, tracks):
    target = MAPPINGS.get(circuit["circuitId"])
    if target is None:
        return None
    matches = [row for row in tracks if row["id"] == target]
    if len(matches) != 1:
        raise ValueError("Mapped circuit directory target missing or duplicated: " + target)
    country = circuit["Location"]["country"]
    if matches[0]["country"] != COUNTRIES.get(country, country):
        raise ValueError("Mapped circuit country mismatch: " + target)
    return target
