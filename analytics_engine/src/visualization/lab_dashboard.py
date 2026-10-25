import streamlit as st
import pandas as pd
import plotly.express as px
import yaml
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
CONFIG_PATH = BASE_DIR / "config" / "base.yaml"
PROCESSED_DIR = BASE_DIR / "data" / "processed"

st.set_page_config(page_title="LapLogic ML Lab", layout="wide", page_icon="🏎️")

@st.cache_data
def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

@st.cache_data
def load_data():
    matrix_path = PROCESSED_DIR / "model_training_matrix.csv"
    if not matrix_path.exists():
        return None
    return pd.read_csv(matrix_path)

@st.cache_resource
def train_model(df, features, target):
    """Trains the model on the fly for real-time inference."""
    rf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
    # Train on everything before 2026 for simulation purposes
    train_df = df[df['year'] < 2026].dropna(subset=features)
    rf.fit(train_df[features], train_df[target])
    return rf

def main():
    config = load_config()
    df = load_data()
    
    if df is None:
        st.error("❌ model_training_matrix.csv not found. Run the orchestrator first.")
        return

    features = config.get("features", [])
    target = config["pipeline"]["target_variable"]
    rf_model = train_model(df, features, target)

    st.sidebar.title("🏎️ LapLogic Lab")
    page = st.sidebar.radio("Navigation", ["📊 Data Explorer", "🧠 Model Diagnostics", "🕹️ Race Simulator"])

    if page == "📊 Data Explorer":
        st.header("Exploratory Data Analysis")
        st.write("Analyze the macro trends across the dataset.")
        
        col1, col2 = st.columns(2)
        with col1:
            st.subheader("Qualifying Dominance")
            # Filter out penalty gaps (3.5s) to see the true cluster
            df_viz = df[df['quali_delta_to_pole'] < 3.0]
            fig = px.box(df_viz, x="won_race", y="quali_delta_to_pole", 
                         color="won_race", color_discrete_map={0: "#ef4444", 1: "#22c55e"},
                         labels={"won_race": "Race Winner", "quali_delta_to_pole": "Quali Gap to Pole (s)"})
            st.plotly_chart(fig, use_container_width=True)
            
        with col2:
            st.subheader("Momentum vs Racecraft")
            fig2 = px.scatter(df, x="team_momentum", y="driver_racecraft_index", 
                              color=target, opacity=0.6,
                              color_discrete_map={0: "#334155", 1: "#22c55e"})
            st.plotly_chart(fig2, use_container_width=True)

    elif page == "🧠 Model Diagnostics":
        st.header("Feature Importance")
        st.write("What is the Random Forest actually looking at?")
        
        importances = rf_model.feature_importances_
        imp_df = pd.DataFrame({'Feature': features, 'Importance': importances})
        imp_df = imp_df.sort_values(by='Importance', ascending=True)
        
        fig = px.bar(imp_df, x='Importance', y='Feature', orientation='h',
                     title="Random Forest Decision Weights",
                     color='Importance', color_continuous_scale="blues")
        st.plotly_chart(fig, use_container_width=True)

    elif page == "🕹️ Race Simulator":
        st.header("Strategy Simulator")
        st.write("Select a race and manipulate the starting conditions to see how the ML predicts the outcome.")
        
        # Selectors
        col1, col2 = st.columns(2)
        year = col1.selectbox("Select Year", sorted(df['year'].unique(), reverse=True))
        race_options = df[df['year'] == year]['round'].unique()
        round_num = col2.selectbox("Select Round", sorted(race_options))
        
        # Get Race Data
        race_data = df[(df['year'] == year) & (df['round'] == round_num)].copy()
        
        if race_data.empty:
            st.warning("No data for this race.")
            return

        st.markdown("### Alter Starting Grid (Top 5)")
        # Sort by actual grid position to get the top 5 starters
        top_5 = race_data.sort_values('grid').head(5).copy()
        
        # Interactive Sliders for the Top 5
        sim_data = race_data.copy()
        for idx, row in top_5.iterrows():
            with st.expander(f"P{row['grid']} - {row['driverRef'].upper()}"):
                new_quali = st.slider(f"Quali Delta (s)", 0.0, 2.0, float(row['quali_delta_to_pole']), 0.05, key=f"q_{row['driverRef']}")
                new_momentum = st.slider(f"Team Momentum", 0.0, 30.0, float(row['team_momentum']), 1.0, key=f"m_{row['driverRef']}")
                
                # Apply changes to our simulation dataframe
                sim_data.loc[sim_data['driverRef'] == row['driverRef'], 'quali_delta_to_pole'] = new_quali
                sim_data.loc[sim_data['driverRef'] == row['driverRef'], 'team_momentum'] = new_momentum

        # Run Inference
        st.markdown("### 🔮 ML Predicted Win Probabilities")
        sim_data['win_prob'] = rf_model.predict_proba(sim_data[features])[:, 1]
        results = sim_data[['grid', 'driverRef', 'win_prob']].sort_values('win_prob', ascending=False).head(10)
        
        fig = px.bar(results, x='driverRef', y='win_prob', 
                     title="Probability of Winning (Based on Simulated Conditions)",
                     labels={'driverRef': 'Driver', 'win_prob': 'Win Probability'},
                     color='win_prob', color_continuous_scale="Reds")
        fig.update_layout(yaxis_tickformat='.1%')
        st.plotly_chart(fig, use_container_width=True)

if __name__ == "__main__":
    main()