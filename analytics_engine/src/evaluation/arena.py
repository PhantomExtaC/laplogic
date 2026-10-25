import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import xgboost as xgb
import yaml
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CONFIG_PATH = BASE_DIR / "config" / "base.yaml"
PROCESSED_MATRIX_PATH = BASE_DIR / "data" / "processed" / "model_training_matrix.csv"
EXPORT_DIR = BASE_DIR.parent / "web_app" / "public" / "data"

def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def run_arena():
    print("⚔️ Welcome to the LapLogic Model Arena...")
    config = load_config()
    
    target = config["pipeline"]["target_variable"]
    features = config.get("features", [])
    test_year = config["pipeline"]["test_split_year"]

    df = pd.read_csv(PROCESSED_MATRIX_PATH).sort_values(by=['year', 'round'])
    train_df = df[df['year'] < test_year].copy()
    test_df = df[df['year'] >= test_year].copy()

    # 1. Train Random Forest (Hyperparameters injected from YAML)
    rf_params = config["models"]["random_forest"]
    rf = RandomForestClassifier(**rf_params)
    rf.fit(train_df[features], train_df[target])

    # 2. Train XGBoost
    xgb_params = config["models"]["xgboost"]
    xgb_model = xgb.XGBClassifier(**xgb_params)
    xgb_model.fit(train_df[features], train_df[target])

    baseline_wins, rf_wins, xgb_wins = 0, 0, 0
    total_valid_races = 0
    test_races = test_df['raceId'].unique()

    # Evaluate Models
    for race_id in test_races:
        race_data = test_df[test_df['raceId'] == race_id].copy()
        if race_data[target].sum() == 0: continue
        
        total_valid_races += 1
        true_winner = race_data[race_data[target] == 1]['driverRef'].values[0]

        if 'grid' in features:
            if race_data.sort_values('grid')['driverRef'].values[0] == true_winner:
                baseline_wins += 1

        race_data['rf_prob'] = rf.predict_proba(race_data[features])[:, 1]
        if race_data.sort_values('rf_prob', ascending=False)['driverRef'].values[0] == true_winner:
            rf_wins += 1

        race_data['xgb_prob'] = xgb_model.predict_proba(race_data[features])[:, 1]
        if race_data.sort_values('xgb_prob', ascending=False)['driverRef'].values[0] == true_winner:
            xgb_wins += 1

    base_acc = (baseline_wins / total_valid_races) * 100 if 'grid' in features else 0
    rf_acc = (rf_wins / total_valid_races) * 100
    xgb_acc = (xgb_wins / total_valid_races) * 100

    champion = "xgBoost" if xgb_acc > rf_acc else "randomForest"

    print(f"Grid Baseline: {base_acc:.1f}%")
    print(f"Random Forest: {rf_acc:.1f}%")
    print(f"XGBoost:       {xgb_acc:.1f}%")
    print(f"👑 ACTIVE CHAMPION: {champion.upper()}")

    # Export Arena Results
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    metrics = {
        "champion": champion,
        "models": {
            "randomForest": {"winAccuracy": round(rf_acc, 1)},
            "xgBoost": {"winAccuracy": round(xgb_acc, 1)}
        }
    }
    with open(EXPORT_DIR / "arena_metrics.json", 'w', encoding='utf-8') as f:
        json.dump(metrics, f, indent=2)

if __name__ == "__main__":
    run_arena()