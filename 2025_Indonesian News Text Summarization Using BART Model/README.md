# Indonesian News Text Summarization Using BART Model

### Authors
- Evan Santosa
- Alexander Brian Susanto
- Kelson
- Henry Wunarsa

### Project Description
This project focuses on developing Indonesian abstractive text summarization system using the Bidirectional Auto-Regressive Transformer (BART) model. The project aim to address the performance gap in automatic text summarization for the Indonesian language, which often lacks large-scale, high-quality training data, and robust pre-trained models compared to English and other high-resource languages.

### Background
The volume of digital textual data has created significant challenges in information retrieval and comprehension. Hence, there is a growing need for a tool that efficiently and effectively process long text into concise and coherent summaries. The Indonesian language also have limited pre-trained models compared to other languages, such as English.

### Methods
- Dataset
    - IndoSum
- Data Preprocessing
    - BART Tokenizer
- Modeling
    - Fine-tuned BART

### Results
The BART model achieved ROUGE-1 of 71.62, ROUGE-2 of 64.44, and ROUGE-L of 69.19, indicating its effectiveness for abstractive Indonesian text summarization task. The model also outperformed other models evaluated on the same dataset on several research, such as T5, BERT, and GPT-2.

### Limitations
Even though the generated summary has captured main information correctly, there are still grammatical errors and the output of the summary appears to be truncated.

### Tech Stacks
- PyTorch
- Transformer

### Impacts
This system can improve the accessibility of information, assist the advancement in low-resource NLP, and create opportunities for future applications. The fine-tuned model has also downloaded 2400+  (https://huggingface.co/xTorch8/bart-id-summarization), indicating strong interest and real-world usage by the community. This project also accepted in the 10th International Conference of Computer Science and Computational Intelligence (ICCSCI) 2025.
