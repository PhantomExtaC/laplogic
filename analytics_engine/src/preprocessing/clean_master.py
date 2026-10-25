import pandas as pd
import numpy as np
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"
CLEAN_DIR = BASE_DIR / "data" / "clean"

def clean_ergast_database():
    print("🧹 Booting LapLogic Data Cleanser (Bronze -> Silver)...")
    CLEAN_DIR.mkdir(parents=True, exist_ok=True)

    # 1. CLEAN RACES
    # ---------------------------------------------------------
    print("   -> Cleaning races.csv...")
    races = pd.read_csv(RAW_DIR / "races.csv")
    races = races[['raceId', 'year', 'round', 'circuitId', 'name', 'date']]
    races['date'] = pd.to_datetime(races['date'], errors='coerce')
    # Filter for the modern hybrid era (2014+)
    races = races[races['year'] >= 2014].copy()
    
    # 2. CLEAN CIRCUITS (The Bridge)
    # ---------------------------------------------------------
    print("   -> Cleaning circuits.csv...")
    circuits = pd.read_csv(RAW_DIR / "circuits.csv")
    circuits = circuits[['circuitId', 'circuitRef', 'name', 'location', 'country']]
    
    # Merge circuit string references directly into the races table
    races = races.merge(circuits[['circuitId', 'circuitRef']], on='circuitId', how='left')
    races.to_csv(CLEAN_DIR / "clean_races.csv", index=False)

    # 3. CLEAN DRIVERS
    # ---------------------------------------------------------
    print("   -> Cleaning drivers.csv...")
    drivers = pd.read_csv(RAW_DIR / "drivers.csv")
    # Replace Ergast's \N null values without regex=True
    drivers = drivers.replace(r'\N', np.nan)
    drivers = drivers[['driverId', 'driverRef', 'code', 'dob', 'nationality']].copy()
    # Ensure FastF1 3-letter codes are uppercase
    drivers['code'] = drivers['code'].astype(str).str.upper()
    drivers.to_csv(CLEAN_DIR / "clean_drivers.csv", index=False)

    # 4. CLEAN CONSTRUCTORS
    # ---------------------------------------------------------
    print("   -> Cleaning constructors.csv...")
    constructors = pd.read_csv(RAW_DIR / "constructors.csv")
    constructors = constructors[['constructorId', 'constructorRef', 'name', 'nationality']].copy()
    constructors.to_csv(CLEAN_DIR / "clean_constructors.csv", index=False)

    # 5. CLEAN RESULTS (The Core Fact Table)
    # ---------------------------------------------------------
    print("   -> Cleaning results.csv...")
    results = pd.read_csv(RAW_DIR / "results.csv")
    results = results.replace(r'\N', np.nan)
    
    cols_to_keep = [
        'resultId', 'raceId', 'driverId', 'constructorId', 
        'grid', 'positionOrder', 'points', 'laps', 'statusId'
    ]
    results = results[cols_to_keep].copy()
    results['grid'] = pd.to_numeric(results['grid'], errors='coerce').fillna(0).astype(int)
    results.to_csv(CLEAN_DIR / "clean_results.csv", index=False)

    print(f"✅ Silver Data Layer successfully built in '{CLEAN_DIR.name}/'")

if __name__ == "__main__":
    clean_ergast_database()