# Public Transport Analysis and Optimization in Jakarta

### Authors
- Evan Santosa
- Elena Nathanielle Budiman Angkawi
- Felicia Audrey Tanujaya
- Nadya Angelie Lislie

### Project Description
This project focuses on analyzing Transjakarta, the largest public transport provider in Jakarta, to uncover insights that can support optimization of the system and improve passenger experience. By exploring operational data, ridership trends, route performance, and service efficiency, the project aims to identify opportunities for enhancing accessibility, reducing congestion, and supporting Jakarta’s sustainable urban mobility goals. The findings will help inform strategies for route optimization, demand management, and better resource allocation, ultimately contributing to a more efficient and user-friendly public transportation system.

### Background
Transjakarta is the largest public transport provider in Jakarta and plays a crucial role in people’s daily lives, as many rely on it for their mobility. However, the system still faces challenges such as route inefficiencies and uneven passenger distribution. Hence, there is a need to analyze and optimize the service to ensure it meets the growing demands of Jakarta’s population while supporting sustainable urban mobility.

### Methods
- Dataset
    - Transjakarta public transportation dummy dataset
    - Scrapping station review for sentiment analysis
- Data Preprocessing
    - Handling anomaly and missing values
    - Feature engineering
- Analysis Technique
    - Grouping and aggregation
    - Geopsatial analysis
    - Domain knowledge
    - Sentiment analysis
- Modeling
    - Regression
        - Linear Regression
        - Random Forest Regressor
        - CatBoost Regressor
        - FNN
    - Clustering
        - K-Means
- Evaluation
    - Regression
        - MAE
        - MSE
    - Clustering
        - Elbow Method

### Key Insights
- Bank DKI is the most frequently used payment method (49.4%) due to its partnership with Transjakarta.
- Transjakarta passengers have a balanced gender distribution, with 18,848 females and 16,650 males.
- The majority of passengers were born between 1980 and 2000, indicating that many use Transjakarta primarily for work-related mobility.
- Non-BRT and Mikrotrans services are the most commonly used because their routes provide better access to residential areas, markets, offices, and schools. Meanwhile, Royaltrans is the least used service since it has the most expensive service (Rp20000) compared to other services (Rp3500 for BRT and Non-BRT; Rp0 for Mikrotrans).
- The majority of transactions occur on weekdays and during the time periods of 05:00–09:00 and 16:00–21:00, as many passengers use Transjakarta for commuting to work, school, or markets.
- Bus stops in Central Jakarta are the most crowded compared to other region in Jakarta because the area serves as the center of government, economy, education, and tourism.
- Penjaringan is the busiest boarding stop due to its strategic location and route connections (eg. 9, 12, 1A, 3C, etc), while the busiest alighting stops are concentrated near economic centers (eg. Term. Senen, Term. Kampung Rambutan, Senen, etc), indicating commuting flows from residential areas to business districts.
- 1T - Cibubur-Balai Kota and S21 - Ciputat-CSW are the most frequently used routes because they connect densely populated residential areas to key activity centers, and both originate from regions with limited public transport alternatives. 
- Rusun Kapuk Muara and Garuda Taman Mini has the best sentiment score, while Cibubur Junction and Penjaringan have the worst sentiment score. This is mainly because many passenger reviews mention negative experiences such as being crowded, long queues”, traffic congestion, broken facilities, and cramped conditions. 

### Modeling Results
- The CatBoost Regressor demonstrates strong performance in forecasting bus stop density, with low and stable errors (MAE = 1.7, MSE = 9.7). This indicates the model can accurately predict passenger density with minimal deviation from actual values.
- Using the K-Means clustering method, the elbow point at k = 4 indicates that bus stops can be effectively grouped into four categories based on density levels: quiet, moderate, fairly busy, and busy.

### Recommendations
Improving service quality and operational efficiency is essential—particularly through better departure time management and enhanced stop facilities. By implementing the bus stop density prediction model as a decision support system, operators can anticipate passenger volumes in real time, enabling proactive actions such as optimizing fleet deployment, increasing trip frequency during peak times, and allocating resources more effectively. This approach shifts service improvements from being reactive to complaints toward being proactive in meeting future passenger needs.

### Tech Stacks
- Pandas
- Matplotlib
- Seaborn
- Folium
- Scikit-learn
- Catboost
- Geopandas
- NLTK
- Wordcloud

### Impacts
This project delivers meaningful impacts by enabling data-driven decision-making for Transjakarta’s operations through predictive modeling and analytical insights. The developed bus stop density prediction model supports real-time optimization of fleet deployment and scheduling, while geospatial and sentiment analyses reveal key passenger pain points such as overcrowding and long queues. These findings provide actionable strategies to improve service quality, enhance operational efficiency, and optimize route planning, ultimately contributing to a more reliable, accessible, and sustainable public transportation system in Jakarta.