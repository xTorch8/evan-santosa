# Smart Maintenance Assistant Using Retrieval-Augmented Generation (RAG)

### Authors
Evan Santosa

### Project Description
The Smart Maintenance Assistant is an AI-driven system designed to support maintenance operations in industrial settings by leveraging Retrieval-Augmented Generation (RAG). It combines a powerful large language model (LLM) with domain-specific knowledge retrieval to provide accurate, context-aware answers to maintenance-related queries. Through an interactive Streamlit interface, users can access technical documentation, troubleshooting guidance, and maintenance insights in natural language, making complex industrial knowledge easily accessible.

### Background
In modern manufacturing, vast amounts of maintenance data and manuals are often underutilized due to their unstructured nature and the difficulty of retrieving relevant information quickly. Traditional maintenance systems rely heavily on manual searches or rule-based methods, which are inefficient and error-prone. This project addresses that challenge by applying Retrieval-Augmented Generation (RAG) to bridge the gap between human operators and technical data, enabling a more intelligent and efficient decision-making process in predictive and corrective maintenance tasks.

### Methods
- Dataset
    - Synthetic Dataset in Manufacturing Industry
- Data Ingestion and Processing
    - Document loading using PyPDFLoader and CSVLoader
    - Text segmentation using RecursiveCharacterTextSplitter
- Embedding and Indexing
    - Text embeddings generated using OpenAIEmbeddings
    - Document indexing and retrieval implemented with FAISS for vector search
- Retrival Mechanism
    - Combining BM25Retriever for keyword-based matching and FAISS Retriever for semantic search using EnsembleRetriever with weighted fusion
- Modeling
    - GPT-4o-mini integrated with RetrievalQA chain

### Tech Stacks
- Langchain
- Streamlit

### Impacts
The Smart Maintenance Assistant enhances operational efficiency by reducing downtime, accelerating fault diagnosis, and improving knowledge sharing among maintenance teams. It empowers technicians to find solutions faster and supports organizations in implementing data-driven maintenance strategies. Moreover, it demonstrates how RAG-based AI systems can transform industrial workflows, making intelligent maintenance accessible, scalable, and adaptive to future industry needs.