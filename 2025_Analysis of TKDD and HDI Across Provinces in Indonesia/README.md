# Analysis of TKDD and HDI Across Provinces in Indonesia

### Authors
- Evan Santosa
- Elena Nathanielle Budiman Angkawi
- Felicia Audrey Tanujaya

### Project Description
This project focuses on analyzing Transfer Funds to Regions and Villages  (TKDD) across all province in Indonesia for the year 2023. This project aim to analyze the distribution of TKDD across different provinces in Indonesia, identify factors that influence variations in TKDD allocation, and to explore the relationship between TKDD and Human Development Index (HDI).

### Background
TKDD is one of the budget allocated by the national government to every region and village to support the affair implementation in every region and city. However, TKDD have not realized well in several provinces. There are also gap between TKDD across one province to the other. Hence, there is a need to analyze the key factor of TKDD realization to avoid inequality and more optimal realization.

### Methods
- Dataset
    - Statistics Indonesia (BPS) 2023
- Data Preprocessing
    - Data type conversion
    - Handling missing values with KNN Imputer
- Analysis Techniques
    - Geospatial analysis
    - Statistical correlation
    - Grouping and aggregation
    - Domain knowledge

### Key Insights
- Provinces in West Indonesia tends to have bigger TKDD realization and HDI compared to Central and East Indonesia. This suggest the presence of inequality in both fiscal distribution and human development outcomes across regions. Hence, there is an urgent need to reassess and replan fiscal allocation strategies to ensure they are more responsive to the unique needs and development priorities of each region.
- Key factors that affecting TKDD realization are TKDD ceiling, Gross Regional Domestic Product (GDRP), population, and political decisions. Meanwhile, key factors that affecting HDI are percentage of population below poverty line and GDRP.
- The correlation between TKDD and HDI suggests that there is no significant between the two variables. This indicates that higher fiscal transfers to regions do not automatically translate into improvements in human development outcomes. 

### Recommendations
The planning and allocation of TKDD should be based on socio-economic indicators such as HDI, poverty rates, and GRDP per capita, to ensure that fiscal transfers are more responsive to the specific needs of each region.

### Tech Stacks
- Pandas
- Scikit-learn
- Matplotlib
- Seaborn
- Plotly

### Impacts
This project can help generate insights for policymakers to increase the effectiveness of TKDD ceiling and realization.