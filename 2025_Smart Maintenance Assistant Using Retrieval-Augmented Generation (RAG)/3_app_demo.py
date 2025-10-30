import os
import pickle
import faiss
import streamlit as st
from dotenv import load_dotenv
from langchain.document_loaders import PyPDFLoader, CSVLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.retrievers import BM25Retriever, EnsembleRetriever
from langchain.docstore import InMemoryDocstore
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA

load_dotenv()

# 1. Configuration
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data")
FAISS_INDEX_PATH = os.path.join(DATA_PATH, "faiss_index")
DOCS_PATH = os.path.join(FAISS_INDEX_PATH, "docs.pkl")

EMBEDDINGS = OpenAIEmbeddings()
LLM = ChatOpenAI(model = "gpt-4o-mini", temperature = 0)

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

print(os.listdir(DATA_PATH))

# 2. Setup Retriever
vectorstore = FAISS.load_local(
    folder_path = FAISS_INDEX_PATH, 
    embeddings = EMBEDDINGS,
    allow_dangerous_deserialization = True
)

if os.path.exists(DOCS_PATH):
    with open(DOCS_PATH, "rb") as f:
        docs = pickle.load(f)

    texts = [d.page_content for d in docs]
else:
    texts = [v.page_content for v in vectorstore.docstore._dict.values()]

bm5_retriever = BM25Retriever.from_texts(texts)
bm5_retriever.k = 3

vector_retriever = vectorstore.as_retriever(search_kwargs = {"k": 3})

hybrid_retrieval = EnsembleRetriever(
    retrievers = [bm5_retriever, vector_retriever],
    weights = [0.4, 0.6]
)

qa_chain = RetrievalQA.from_chain_type(
    llm = LLM,
    retriever = hybrid_retrieval,
    return_source_documents = True
)

# 3. Streamlit UI
st.set_page_config(page_title = "🏭 Manufacturing RAG Assistant", layout = "wide")
st.title("🏭 Maintanance Assistant")
st.markdown("Upload manuals or data files, then ask questions about them!")

tab1, tab2 = st.tabs(["💬 Ask a Question", "📤 Upload Data"])

with tab1:
    query = st.text_input("Ask a question about your data:")

    if st.button("Search"):
        if not query.strip():
            st.warning("Please enter a question.")
        else:
            with st.spinner("Searching..."):
                response = qa_chain.invoke({"query": query})

            st.subheader("🧠 Answer")
            st.write(response["result"])

with tab2:
    uploaded_file = st.file_uploader("Upload PDF or CSV file", type = ["pdf", "csv"])
    if uploaded_file:
        file_name = os.path.join(DATA_PATH, uploaded_file.name)
        with open(file_name, "wb") as f:
            f.write(uploaded_file.getbuffer())

        with st.spinner(f"Processing file: {uploaded_file.name}..."):
            try:
                if file_name.endswith(".pdf"):
                    loader = PyPDFLoader(file_path = file_name)
                    docs = loader.load()
                    text_splitter = RecursiveCharacterTextSplitter(
                        chunk_size = CHUNK_SIZE,
                        chunk_overlap = CHUNK_OVERLAP,
                        length_function = len
                    )
                    text = text_splitter.split_documents(docs)
                    vectorstore.add_documents(text)
                elif file_name.endswith(".csv"):
                    loader = CSVLoader(file_path = file_name)
                    docs = loader.load_and_split()
                    vectorstore.add_documents(documents = docs)
                else:
                    print(f"Found unsupported file format: {file_name}")

                vectorstore.save_local(FAISS_INDEX_PATH)
                st.success(f"✅ {uploaded_file.name} successfully processed and indexed!")
            except Exception as e:
                st.error(f"❌ Error processing {uploaded_file.name}: {str(e)}")