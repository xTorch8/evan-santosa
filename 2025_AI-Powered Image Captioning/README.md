# AI-Powered Image Captioning

### Authors

- Evan Santosa
- Alexander Brian Susanto
- Joceline Araki
- Mary Anggita Priscilla
- Stevan Pohan

### Project Description

This project focuses on building an AI-powered image captioning system that automatically generates natural language descriptions from images. The system is designed to address practical industry needs such as content moderation, accessibility support, and scalable media annotation. By comparing multiple encoder–decoder architectures, the project evaluates how modern deep learning models perform under real-world constraints like limited labeled data. The outcome provides actionable insights for deploying image captioning solutions in production environments.

### Background

Image captioning combines Computer Vision and Natural Language Processing to bridge the gap between visual data and human language. In industry, this technology is widely used to improve accessibility for visually impaired users, enhance image search engines, and automate caption generation for social media and e-commerce platforms. The core challenge lies in accurately understanding visual context—objects, actions, and relationships—and translating it into fluent, semantically correct text. Advances in deep learning, particularly encoder–decoder architectures, have significantly improved the feasibility of deploying such systems at scale.

### Methods

- Dataset
  - Flickr8k
- Data Preprocessing
  - Data Splitting
  - Image Resizing, Normalization, and Augmentation
  - Tokenization, Token Filtering, and Numericalization
- Modeling
  - ResNet-50 + LSTM
  - EfficientNetB3 + LSTM
  - EfficientNetB3 + GPT-2
  - ViT + LSTM
  - ViT + GPT-2
- Evaluation
  - CIDEr

### Results

Experimental evaluation using the CIDEr metric shows that the Vision Transformer (ViT) paired with an LSTM decoder achieves the highest performance on the Flickr8k dataset, with a CIDEr score of 54.63. This combination demonstrates strong capability in capturing global visual context while maintaining stable and accurate text generation. EfficientNet-B3 combined with GPT-2 also delivers competitive results, highlighting the importance of compatibility between visual representations and language models. Conversely, the ViT + GPT-2 combination performs poorly, indicating that more powerful models do not always yield better results, especially under limited data conditions.

### Limitations

The primary limitation of this project is the relatively small size of the Flickr8k dataset, which restricts model generalization and increases the risk of overfitting. Large transformer-based models such as ViT and GPT-2 also require substantial computational resources, making them less practical for teams with limited infrastructure. Additionally, the system occasionally produces captions that are grammatically correct but visually inaccurate, a known issue referred to as visual hallucination. These constraints reflect common challenges faced when transitioning AI models from research to real-world deployment.

### Tech Stacks

- PyTorch
- Transformers

### Impacts

This project provides practical guidance for selecting model architectures for image captioning in data-constrained industrial settings. The findings help organizations balance performance, computational cost, and deployment feasibility when building AI-driven visual understanding systems. By demonstrating that architectural compatibility is as important as model complexity, the project supports more efficient and responsible AI adoption. Ultimately, the work contributes to building scalable, accessible, and cost-effective AI solutions for real-world visual content analysis.
