"""Coverage labels describe evidence, never the time a cached file was copied."""
def describe(payloads):
    statuses = {}
    for name, payload in payloads.items():
        meta = payload.get("meta", {}) if isinstance(payload, dict) else {}
        statuses[name] = {
            "status": "sample" if meta.get("placeholder") else "dated" if meta.get("dataThrough") else "unknown",
            "dataThrough": meta.get("dataThrough"),
            "observedAt": meta.get("generatedAt"),
            "source": meta.get("source", "Legacy cached directory; coverage unknown"),
        }
    return statuses
