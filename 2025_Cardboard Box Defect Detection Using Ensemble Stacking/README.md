# Cardboard Box Defect Detection Using Ensemble Stacking

### Authors
- Evan Santosa
- Henry Wunarsa

### Project Description
This project focuses on developing an automated system for detecting defects in cardboard using the ensemble stacking methods of ResNet-50 and Inception V3. The project aim to address the lack of accurate, efficient, and scalable solutions for defect detection in packaging quality control.

### Background
Cardboard is one of the most used materials in the packaging sector. It can sometimes have defects, which may affect its quality and usability. Due to massive scale of cardboard production, the potential for defective cardboard to be produced and overlooked during quality control increases. Hence, creating an AI model capable of automating the quality inspection process of cardboard production is needed.

### Methods
- Dataset
    - Carton Can Detection Dataset
- Data Preprocessing
    - Resizing
    - Normalization
    - Augmentation
- Modeling
    - Baseline CNN
    - ResNet-50
    - Inception V3
    - Stacking-1
        - Base Learner: ResNet-50
        - Meta Learner: Inception V3
    - Stacking-2
        - Base Learner: Inception V3
        - Meta Learner: ResNet-50

### Results
The Stacking-1 configuration achieved the best performance, with 79% F1-Score, 79% precision, 80% recall, and 80% accuracy, indicating ensemble stacking can improve the classification results compared to individual models.

### Limitations
The system currently can only detecting four classes, which are normal carton box, opened carton box, wet carton box, and cracked carton box.

### Tech Stacks
TensorFlow

### Impacts
The project can improved quality control process, operational efficiency, cost reduction, and increase customer satisfaction due to the delivery of high-quality packaging. This project also accepted at the 7th International Conference on Cybernetics and Intelligent Systems (ICORIS) 2025. 