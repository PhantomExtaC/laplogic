import pandas as pd
import numpy as np
import yaml
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
CONFIG_PATH = BASE_DIR / "config" / "base.yaml"
CLEAN_DIR = BASE_DIR / "data" / "clean"
FEATURES_DIR = BASE_DIR / "data" / "features"
PROCESSED_DIR = BASE_DIR / "data" / "processed"


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def time_str_to_seconds(t_str):
    if pd.isna(t_str) or str(t_str).strip() in [r"\N", "", "nan"]:
        return np.nan
    try:
        t_str = str(t_str).strip()
        if ":" in t_str:
            parts = t_str.split(":")
            return float(parts[0]) * 60.0 + float(parts[1])
        return float(t_str)
    except Exception:
        return np.nan


def compute_qualifying_deltas():
    RAW_DIR = BASE_DIR / "data" / "raw"
    quali_path = RAW_DIR / "qualifying.csv"
    if not quali_path.exists():
        return None

    df_q = pd.read_csv(quali_path)
    for col in ["q1", "q2", "q3"]:
        if col in df_q.columns:
            df_q[f"{col}_sec"] = df_q[col].apply(time_str_to_seconds)

    time_cols = [c for c in ["q3_sec", "q2_sec", "q1_sec"] if c in df_q.columns]
    df_q["best_quali_sec"] = df_q[time_cols].min(axis=1)
    pole_times = df_q.groupby("raceId")["best_quali_sec"].transform("min")
    df_q["quali_delta_to_pole"] = (df_q["best_quali_sec"] - pole_times).round(3)
    df_q["quali_delta_to_pole"] = df_q["quali_delta_to_pole"].fillna(3.500)
    return df_q[["raceId", "driverId", "quali_delta_to_pole"]]


def build_training_matrix():
    print("🔨 Building ML Training Matrix via YAML Config...")
    config = load_config()
    active_features = config.get("features", [])
    start_year = config["pipeline"]["historical_start_year"]

    # 1. Load Silver (Clean) Tables
    df_results = pd.read_csv(CLEAN_DIR / "clean_results.csv")
    df_races = pd.read_csv(CLEAN_DIR / "clean_races.csv")
    df_drivers = pd.read_csv(CLEAN_DIR / "clean_drivers.csv")

    # Filter modern era
    df_races = df_races[df_races["year"] >= start_year][["raceId", "year", "round", "circuitId", "circuitRef"]]

    # Merge Results -> Races -> Drivers
    df = df_results.merge(df_races, on="raceId", how="inner")
    df = df.merge(df_drivers[["driverId", "driverRef"]], on="driverId", how="left")

    target_var = config["pipeline"]["target_variable"]
    df[target_var] = (df["positionOrder"] == 1).astype(int)

    # 2. Merge Qualifying Deltas
    if "quali_delta_to_pole" in active_features:
        df_q = compute_qualifying_deltas()
        if df_q is not None:
            df = df.merge(df_q, on=["raceId", "driverId"], how="left")
            df["quali_delta_to_pole"] = df["quali_delta_to_pole"].fillna(3.500)
        else:
            df["quali_delta_to_pole"] = 3.500

    # 3. Merge External Engineered Features
    feature_files = {
        "mastery_matrix.csv": ["driver_overall_avg", "driver_track_avg", "driver_street_avg"],
        "power_ratings.csv": ["team_momentum", "driver_momentum", "driver_racecraft_index"],
        "track_profiles.csv": ["tire_deg_index", "is_street"]
    }

    for file_name, provided_cols in feature_files.items():
        cols_to_merge = [c for c in provided_cols if c in active_features]
        if cols_to_merge:
            path = FEATURES_DIR / file_name
            if path.exists():
                df_ext = pd.read_csv(path)

                if file_name == "track_profiles.csv":
                    # If track_profiles.csv uses string names under 'circuitId', rename to 'circuitRef'
                    if "circuitId" in df_ext.columns and not pd.api.types.is_numeric_dtype(df_ext["circuitId"]):
                        df_ext = df_ext.rename(columns={"circuitId": "circuitRef"})
                    merge_keys = ["circuitRef"]
                else:
                    merge_keys = ["raceId", "driverRef"]

                df = df.merge(df_ext[merge_keys + cols_to_merge], on=merge_keys, how="left")

                for c in cols_to_merge:
                    df[c] = df[c].fillna(0.0)

    # 4. Save Gold ML Matrix
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    out_path = PROCESSED_DIR / "model_training_matrix.csv"

    final_cols = ["raceId", "year", "round", "driverRef", target_var] + active_features
    df[final_cols].to_csv(out_path, index=False)
    print(f"✅ Gold Matrix successfully generated with {len(active_features)} features: {active_features}")


if __name__ == "__main__":
    build_training_matrix()