# HydroSense

### Authors
- Evan Santosa
- Alexander Brian Susanto
- David Yulianto
- Rafael Komala
- Shania Sukandar

### Project Description
HydroSense is a web-based application that leverages Artificial Intelligence to tackle one of today’s most pressing global challenges: the growing scarcity of clean and drinkable water. The platform predicts whether a given water sample is potable (safe for drinking) based on its key chemical and physical characteristics. Designed with a dual purpose, HydroSense serves both companies and consumers. For businesses, it provides a powerful tool to monitor and ensure the quality of their water sources. For users, it offers transparency through AI-powered insights into water safety, helping build trust and raise awareness about water quality. By combining machine learning with a user-friendly interface, HydroSense delivers accurate, real-time predictions and fosters greater accountability in water management — contributing to smarter, safer, and more sustainable access to clean water. 

### Background
Water is one of the most fundamental human needs, essential for health, agriculture, industry, and overall quality of life. Despite its importance, access to safe and clean drinking water remains a global challenge, with millions of people still exposed to contaminated water sources. Traditional methods of water testing can be time-consuming, costly, and inaccessible to many communities. With the growing demand for efficiency and transparency in water quality monitoring, there is an urgent need for innovative, data-driven solutions. HydroSense addresses this gap by applying Artificial Intelligence to provide fast, reliable, and accessible predictions of water potability.

### Key Features
- AI-based potability prediction using core water attributes
- Dual access

### Methods
- Dataset
    - Water potability dataset
- Data Preprocessing
    - Handling missing values
    - Handling duplicate values
- Modeling
    - SVM
    - KNN
    - Naive Bayes
    - Devision Tree
    - Logistic Regression
- Software Development Life Cycle (SDLC)
    - Waterfall
- Software Architecture
    - Client-Service

### Results
SVM achieved the best performance compared with other models, achieving 87% of accuracy, precision, recall, and F1-Score. 

### Limitations
Currently, the system can only predict the water potability based on water attributes statistics, not image.

### Tech Stacks
- AI System
    - Scikit-learn
- Backend
    - FastAPI
    - MySQL
- Frontend
    - React.js
    - TypeScript
    - TailwindCSS

### Impacts
HydroSense empowers businesses and communities to make data-driven decisions about water safety, ensuring greater accountability in water management. By providing fast, accurate, and accessible potability insights, the system contributes to improving public health, building trust, and advancing global efforts toward sustainable clean water access.
