# Indonesian Road Damage Detection Using TTA

### Authors
- Evan Santosa
- Danica Jessey Satria
- Marvel Michael

### Project Description
This project focuses on developing an automated system for detecting road damages in Indonesia using Test Time Augmentation (TTA). This project aim to address the challenges of manual road inspection, which is often time-consuming, costly, and prone to human error. 

### Background
More than 52% road in Indonesia suffers from various types of damages. These damages not only threaten road safety, leading to accidents and vehicle damage, but also hinder economy activities by disrupting the smooth flow of goods and people. Currently, road inspection and maintenance in Indonesia are still largely conducted manually. This approach is time-consuming, labor-intensive, costly, and prone to subjectivity. Hence, there is a growing need of an automated systems that can detect and classify road damages more efficiently. 

### Methods
- Dataset
    - Manually collected data 
    - Road Damage Indonesia dataset
- Data Preprocessing
    - Resizing
    - Normalization
- Modeling
    - YOLOv12
    - DETR
    - RF-DETR

### Results
The RF-DETR model combined with Test Time Augmentation (TTA) achieved the best performance with mAP@50 of 85.10%, recall of 52.30%, and precision of 70.80%. This indicates the effectiveness of TTA in enhancing model generalization and robustness during inference. 

### Limitations
The system currently can only detecting four type of road damages, which are alligator cracking, lateral cracking, longitudinal cracking, and potholes.

### Tech Stacks
- Roboflow
- PyTorch

### Impacts
The project can enhance road safety, cost-efficient maintenance, faster response to road damages, and improve the quality of road infrastructure in Indonesia. 