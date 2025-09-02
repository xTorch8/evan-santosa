# Analysis The Impact of Environmentally Friendly Energy in Buildings on Air Quality

### Authors:
- Evan Santosa
- Elena Nathanielle Budiman Angkawi

### Project Description
This project investigates how the use of environmentally friendly energy in building systems affects air quality. An exploratory data analysis (EDA) was conducted to identify trends, correlations, and potential causal relationships. Based on the findings, machine learning models were developed to predict future impacts. 

### Background
The rapid growth of urbanization and industrialization has lead to an increasing demand for energy consumption in buildings, which contributes significantly to greenhouse gas emissions and declining air quality. Tradional energy sources remain dominant in many regions, but are associated with harmful pollutants that degrade environmental health and human well-being. In response, environmentally friendly energy solutions have emerged as viable alternatives to reduce carbon footprints and improve sustainability in building systems. Beyond renewable generation, smart technologies are increasingly adopted to optimize energy use and minimize environmental impacts. However, while these innovations are widely promoted, their actual contribution to improving air quality at the building and community levels requires further investigation. Understanding the relationship between renewable energy adoption, building energy efficiency, and air quality is essential for guiding policy, investment, and technology deployment.

### Methods
- Dataset
    - Environmental Dataset
    - Bulding Dataset
- Data Preprocessing
    - Handling missing values
    - Handling duplicate values
- Data Analysis
    - Grouping and aggregation
    - Correlation
    - Domain knowledge
- Modeling
    - Random Forest
    - XGBoost
    - Light GBM
    - ADABoost
    - Stacking with Bayesian Optimization
        - Base Learner: Random Forest and XGBoost
        - Meta Learner: Linear Regression

### Key Insights
- The usage of renewable energy shows a negative correlation with AQI, indicating that increased adoption of renewable energy sources is associated with improved air quality.
- Smart thermostats, insulation, and LED lighting are identified as the most effective technologies for enhancing energy savings in buildings.
- Among renewable energy types, biomass, geothermal, and wind energy demonstrate the highest energy efficiency performance.
- In terms of energy sources used in buildings, biomass, electricity, and mixed sources emerge as the most effective for optimizing energy efficiency.
- Stacking method with Random Forest and XGBoost as a base learner and Linear Regression as a meta learner with Bayesian Optimization achieved the best performance in AQI index forecasting, achiving MSE of 3.76, RMSE of 1.94, and R2 score of 0.99.

### Recommendations
- Encouraging investment in the renewable energy sector, in the development of clean energy infrastructure, such as solar, wind, or biomass power plants.
- Developing real-time prediction models with the help of IoT sensor data so they can be used more quickly and efficiently.

### Tech Stacks
- Numpy
- Pandas
- Matplotlib
- Seaborn
- Scikit-learn
- XGBoost
- LightGBM
- Hyperopt

### Impacts
This project demonstrates how integrating renewable energy and smart building technologies can significantly reduce air pollution and improve overall air quality. The insights and predictive models developed can guide policymakers, investors, and engineers in accelerating the transition toward sustainable and healthier urban environments.