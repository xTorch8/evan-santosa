# Predictive Maintenance for Rotating Machinery Using Time Series and Anomaly Detection

### Authors
Evan Santosa

### Project Description
This project focuses on developing an AI-based Predictive Maintenance (PdM) system to detect early signs of bearing failure in rotating machinery. Using vibration time-series data from industrial bearings, the project applies feature engineering, statistical analysis, and machine learning-based anomaly detection to identify abnormal behavior that precedes mechanical failure. 

### Background
In industrial manufacturing, many machines rely on rotating components such as motors, pumps, and turbines. One of the most critical parts in these systems is the bearing, which supports rotation and reduces friction. Over time, bearings naturally degrade due to wear, friction, lubrication issues, or overload. If a bearing fails unexpectedly, it can lead to unplanned downtime, equipment damage, production loss, and safety risks.Traditional maintenance schedules rely on fixed inspection intervals, which often result in either too early maintenance (wasted resources) or too late intervention (unexpected failure). To overcome this, many modern industries are adopting Predictive Maintenance (PdM) — an AI-driven approach that uses real-time sensor data to detect anomalies and predict failures before they happen.

### Methods
- Dataset
    - NASA Bearing Dataset
- Data Preprocessing
    - Feature Engineering
- Exploratory Data Analysis
- Modeling
    - Anomaly Detection
        - Isolation Forest
    - RUL Prediction
        - LSTM
- Evaluation
    - RUL Prediction
        - RMSE

### Insights
- Bearing 3 and Bearing 4 showed a gradual increase in RMS and kurtosis several hours before failure — clear early warning signals.  
- RMS and Kurtosis were the most sensitive indicators of degradation, while Mean Absolute Value and Crest Factor were strongly correlated (redundant).  
- Moving Average smoothing revealed long-term degradation patterns hidden by high-frequency noise.  
- Isolation Forest successfully detected abnormal patterns in the final stage of the bearing’s life.  

### Results
The LSTM-based Remaining Useful Life (RUL) prediction model demonstrated strong performance, achieving an RMSE of 168.53, translating to just a 9.36% error rate, showcasing its effectiveness in accurately forecasting bearing lifespan.

### Tech Stacks
- NumPy
- Pandas
- Matplotlib
- Seaborn
- Scikit-learn
- TensorFlow

### Impacts
The developed Predictive Maintenance system significantly enhances industrial reliability by enabling early detection of bearing degradation, minimizing unexpected equipment failures, and reducing costly downtime. By accurately forecasting the Remaining Useful Life (RUL) of machinery components, it allows for data-driven maintenance scheduling, improved operational efficiency, and optimized resource allocation. This not only extends equipment lifespan but also supports safer, more sustainable manufacturing operations through proactive decision-making powered by AI.