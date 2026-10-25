# analytics_engine/main.py
import os
import argparse
import yaml
import logging
import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "config" / "base.yaml"
SRC_DIR = BASE_DIR / "src"

def load_config():
    """Loads the YAML configuration file."""
    if not CONFIG_PATH.exists():
        print(f"❌ FATAL: Configuration file not found at {CONFIG_PATH}")
        sys.exit(1)
    with open(CONFIG_PATH, "r", encoding="utf-8") as file:
        return yaml.safe_load(file)

def setup_logger(profile_config, profile_name):
    """Configures logging based on the execution profile."""
    log_level_str = profile_config.get("log_level", "INFO").upper()
    log_level = getattr(logging, log_level_str, logging.INFO)
    
    # Format: [PROD] 2026-09-09 12:00:00 - INFO - Message
    formatter = logging.Formatter(f'[%(levelname)s] %(asctime)s - {profile_name.upper()} - %(message)s', 
                                  datefmt='%Y-%m-%d %H:%M:%S')
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    
    logger = logging.getLogger("LapLogic")
    logger.setLevel(log_level)
    
    # Prevent duplicate logs if function is called multiple times
    if not logger.handlers:
        logger.addHandler(handler)
        
    return logger

import os  # Make sure this is at the top of main.py

def run_script(script_path, logger, fail_fast):
    """Executes a subprocess script with error handling dictated by the profile."""
    logger.info(f"▶️ RUNNING: {script_path.name}")
    
    # Force Windows subprocesses to use UTF-8 so emojis don't crash the pipeline
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)], 
            check=True, 
            capture_output=True,
            text=True,
            encoding="utf-8",  # Read the output as UTF-8
            env=env            # Force the script to print as UTF-8
        )
        logger.debug(result.stdout) 
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ PIPELINE ERROR in {script_path.name}")
        logger.error(e.stderr)
        
        if fail_fast:
            logger.critical("fail_fast is TRUE (Lab Profile). Halting execution immediately.")
            sys.exit(1)
        else:
            logger.warning("fail_fast is FALSE (Prod Profile). Attempting to proceed with graceful degradation...")


def main():
    # 1. Parse CLI Arguments
    parser = argparse.ArgumentParser(description="LapLogic Analytics Engine Orchestrator")
    parser.add_argument(
        "--profile", 
        type=str, 
        choices=["prod", "lab"], 
        default="lab",
        help="Execution profile: 'prod' for GitHub Actions, 'lab' for local research."
    )
    args = parser.parse_args()

    # 2. Load Config & Setup Environment
    config = load_config()
    profile_config = config["profiles"][args.profile]
    logger = setup_logger(profile_config, args.profile)
    
    logger.info(f"🏁 INITIALIZING LAPLOGIC PIPELINE 🏁")
    logger.info(f"Targeting: {config['pipeline']['target_variable']} | Features: {len(config['features'])}")

    # 3. Define the Modular Pipeline Steps
    # Note: These paths reflect the NEW directory structure we are moving towards
    # Inside main.py
    pipeline_steps = [
        # Step 1: Clean Bronze CSVs into Silver Data Layer
        SRC_DIR / "preprocessing" / "clean_master.py",
        
        # Step 2: Assemble Gold ML Training Matrix via YAML config
        SRC_DIR / "preprocessing" / "build_dataset.py",
        
        # Step 3: Run Model Arena
        SRC_DIR / "evaluation" / "arena.py",
    ]

    # 4. Execute Pipeline
    for script in pipeline_steps:
        if not script.exists():
            logger.warning(f"Script not found (expected during transition): {script}")
            continue
        run_script(script, logger, profile_config["fail_fast"])

    logger.info("✅ PIPELINE EXECUTION COMPLETE.")

if __name__ == "__main__":
    main()