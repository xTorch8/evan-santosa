# Brain Tumor Net - AI-Powered Brain Tumor Detection

### Project Description
Brain Tumor Net is an AI-powered web based application designed to assist the early detection of brain tumor from medical imaging data. It utilizes a deep learning model to analyze MRI scans and provide classification results, helping patients and healthcare professionals gain clearer insights into brain healths.

### Background
Brain tumor is one of the most dangerous disease in the world, with over 300,000 cases reported around the world annually. Hence,  early detection plays a crucial role in improving treatments outcomes and survival rates.

### Key Features
- AI-Powered Tumor Detection
- Education Guidance

### Methods
- Dataset
    - Figshare
    - SARTAJ
    - Br35H
- Data Preprocessing
    - Resizing
    - Normalization
- Modeling
    - Segmentation
        - U-Net
        - SegNet
        - Swin-Unet
        - SegFormer
    - Classification
        - CNN
        - Hybrid CNN-XGBoost
- Software Development Life Cycle (SDLC)
    - Waterfall
- Software Architecture
    - Client-Service

### Results
Combination of Swin-UNet for segmentation and CNN for classification achieved the best performance with recall of 98.69%, precision of 98.76%, f1-score of 98.72%, and accuracy of 98.78%.

### Limitations
The system currently can only classify the MRI images based on four classes, normal, glioma, meningioma, and pituitary.

### Tech Stacks
- AI System
    - TensorFlow
    - PyTorch
- Backend
    - Gradio
- Frontend
    - React.js
    - TypeScript
    - TailwindCSS

### Impacts
This system can assist healthcare professionals in  in identifying potential tumors earlier, potentially improving treatment outcomes. It also empowers patients with clearer insights into their condition, reducing diagnostic delays and supporting informed medical decisions.
 