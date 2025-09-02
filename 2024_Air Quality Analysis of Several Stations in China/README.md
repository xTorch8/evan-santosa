# Air Quality Analysis of Several Stations in China

### Authors
Evan Santosa

### Project Description
This project focuses on analyzing air quality in several stations in China, which are Aotizhongxin, Changpin, Dingling, Dongsi, Guanyuan, Gucheng, Huairou, Nongzhanguan, Shunyi, Tiantan, Wanliu, and Wanshouxigong. 

### Background
Air pollution remains one of the most pressing environmental challenges in China, with urban areas often experiencing elevated levels of harmful pollutants that directly impact public health and quality of life. Monitoring air quality across different stations provides valuable insights into spatial and temporal patterns of pollution, helping identify the most affected areas, critical time periods, and the pollutants that contribute most to poor air quality.

### Methods
- Dataset
    - Air Quality dataset
- Data Preprocessing
    - Handling missing values
- Analysis Techniques
    - Grouping and aggregation
    - Correlation
    - Domain knowledge

### Key Insights
- Dingling and Huairou stations consistently record the best air quality, while Dongsi, Dongzhanguan, and Wanshouxigong are among the most polluted.
- Air quality tends to worsen in the afternoon but improves during nighttime hours.
- The months between April and August generally experience poorer air quality compared to other periods of the year.
- Overall, China shows a positive long-term trend in air quality improvement.
- Ozone (O₃) is the pollutant with the strongest influence on AQI, showing a correlation of 0.32.
- Rainfall shows no significant impact on improving air quality levels.

### Recommendation
- Strengthen pollution control policies in highly polluted stations such as Dongsi, Dongzhanguan, and Wanshouxigong.
- Implement targeted interventions during afternoons and summer months when pollution peaks.
- Monitor and regulate ozone (O3) more strictly, as it has the strongest correlation with AQI compared to other pollutants.

### Tech Stacks
- Numpy
- Pandas
- Matplotlib
- Seaborn
- Streamlit

### Impacts
This project highlights key spatial and temporal patterns of air pollution in China, providing actionable insights for improving monitoring and intervention strategies. The findings can support policymakers, environmental agencies, and urban planners in designing more targeted measures to improve public health and urban sustainability.