# 🚨 Crime Forecasting AI — Spatiotemporal Prediction with XGBoost, RF, and KNN

> _"What if we could predict where and when crimes are most likely to occur—before they happen?"_

This project explores that very question using **Machine Learning** on spatial and temporal crime data. Built from scratch and deployed as a fully interactive **Streamlit app**, Crime Forecasting AI helps visualize crime patterns and predict weekly incident counts by area using data from Los Angeles (2020–Present).

Whether you're a policymaker, data scientist, or civic technologist, this platform demonstrates how **AI can support smarter urban safety strategies**.

---

## 📊 Project Overview

- **Goal**: Predict weekly crime counts by area using machine learning.
- **Data**: Public dataset from [Kaggle: Crime Data from 2020 to Present](https://www.kaggle.com/datasets/ishajangir/crime-data), cleaned and engineered into weekly area-based crime trends.
- **Models Used**:  
  - `XGBoost Regressor`  
  - `Random Forest Regressor`  
  - `K-Nearest Neighbors (KNN)`

📍 **Features** include:
- `AREA`, `LAT`, `LON`, `iso_year`, `iso_week`
  
🎯 **Target**: `crime_count` — number of incidents reported that week in a given area.

---

## 🧠 Modeling & Metrics

### 🔧 Training Pipeline
The ML workflow (in `crime_detection_ml.py`) includes:
- Preprocessing: Feature engineering, weekly aggregation, area mapping
- Model training: XGBoost, Random Forest, and KNN
- Evaluation using:
  - **MAE (Mean Absolute Error)**
  - **RMSE (Root Mean Squared Error)**
  - **R² Score**
  - **Accuracy within ±20 crimes**

📌 _Why ±20?_ Because in real-world scenarios, predictions don't need to be exact—they need to be actionable.

### 📈 Results Summary

| Model          | Accuracy (±20) | MAE   | RMSE  | R²     |
|----------------|----------------|-------|-------|--------|
| **XGBoost**     | **71.79%**      | 16.26 | 24.00 | 0.854  |
| Random Forest  | 69.46%         | 16.82 | 24.58 | 0.847  |
| KNN            | 45.60%         | 29.45 | 40.85 | 0.578  |

✅ **XGBoost** performed best, thanks to its ability to capture complex spatial-temporal patterns and its built-in regularization.

---

## 🖥 Streamlit App

Explore the crime predictions visually with the [Streamlit dashboard](https://crime-forecasting-ml.streamlit.app/). Built using `streamlit`, the app features:

### 🔍 Features
- Area & date selector
- Weekly prediction with model comparison
- Model performance radar chart
- 📍 Crime heatmaps
- 📈 Area-specific weekly crime trends

### 📸 Screenshots
<details>
<summary>📷 Click to expand</summary>

- **Model Accuracy Radar Chart**
- **Weekly Crime Trend Line Chart**
- **Crime Density Heatmap with PyDeck**

</details>
<br>

> [!TIP]
> _Or run it on your machine using the steps below._

## 🛠 How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/Sam-Gunawan/Crime-Forecasting-AI
cd Crime-Forecasting-AI
```

### 2. Set up a virtual environment (recommended)
```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Window
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the app
```bash
streamlit run app.py
```
---

## 🧩 Project Structure

```
.
├── app.py # Streamlit frontend
├── crime_detection_ml.py # Model training & evaluation script
├── models/
│ ├── crime_model_results.pkl
│ ├── xgboost_model.pkl
│ ├── random_forest_model.pkl
│ └── knn_model.pkl
├── dataset/
│ ├── area_reference.csv
│ ├── grouped_week.csv
│ └── crime_density_by_area.csv
├── AcademicPaper.docx # Full academic research paper
├── requirements.txt
└── README.md
```

---

## 👥 Team & Contributors

| Name                     | Role                            |
|--------------------------|---------------------------------|
| **Samuel Gunawan**       | Project Manager, Full-stack dev |
| Nisrina Rahma Syaifullah | Model Architect & Data Engineer |
| Calvin Willyanto         | Insight Analyst & Report Writer |
| Michael Liem             | Insight Analyst & Report Writer |
| Charles Agustin          | Model Architect & Data Engineer |

---

## 🔮 Future Works

Some improvements to be made:

- 📦 **Deploy as Web App** (with Firebase or Heroku backend)
- 🧬 **Implement Spatio-Temporal Graph Neural Networks**
- 🧠 **Hyperparameter tuning with Optuna**
- 🌍 **Incorporate live data via LAPD/NYPD APIs**
- 🎯 **Cluster analysis to identify high-risk crime zones**
- 🧾 **Exportable city-specific crime reports for policy planning**

---

## 🎓 Academic Report

📄 Read our full research study:  
**“Comparative Analysis of Machine Learning Models for Crime Prediction Based on Spatial and Temporal Features”**  
Available in [`AcademicPaper.pdf`](./AcademicPaper.pdf)

This study includes:
- Literature review of AI in criminology
- Detailed methodology
- Evaluation rationale
- Policy implications
- References from 25+ peer-reviewed sources

---

## 🤝 Contact

- 🧑‍💻 [LinkedIn – Samuel Gunawan](https://www.linkedin.com/in/samuel-theodore-gunawan/)
- 📧 samuelgunawan2004@gmail.com
- 🔗 [GitHub Portfolio](https://github.com/Sam-Gunawan)

---

> _“AI alone doesn’t stop crime—but it can help us get ahead of it.”_  
> This project is our step toward safer, smarter cities.
