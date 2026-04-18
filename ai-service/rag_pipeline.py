"""
RAG (Retrieval-Augmented Generation) Pipeline for Medical Assistant
Integrates document retrieval, embedding generation, and LLM response generation
"""

import os
import logging
from typing import List, Dict, Tuple, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import TextLoader, DirectoryLoader
from langchain.schema import Document
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rag-pipeline")

class RAGPipeline:
    """
    Retrieval-Augmented Generation Pipeline for medical queries
    """
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """
        Initialize RAG pipeline with embedding model and vector database
        
        Args:
            model_name: HuggingFace model identifier for embeddings
        """
        self.model_name = model_name
        self.embedding_model = None
        self.faiss_index = None
        self.documents = []
        self.document_texts = []
        self.embedding_cache = {}
        
        logger.info(f"Initializing RAG Pipeline with model: {model_name}")
        self._initialize_embedding_model()
        
    def _initialize_embedding_model(self):
        """Load the embedding model"""
        try:
            self.embedding_model = SentenceTransformer(self.model_name)
            logger.info("Embedding model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise
    
    def load_medical_documents(self, doc_paths: List[str] = None):
        """
        Load medical documents from files or use sample documents
        
        Args:
            doc_paths: List of file paths to load documents from
        """
        try:
            if doc_paths:
                # Load from specified paths
                for path in doc_paths:
                    if os.path.isfile(path):
                        loader = TextLoader(path)
                        docs = loader.load()
                        self.documents.extend(docs)
                    elif os.path.isdir(path):
                        loader = DirectoryLoader(path, glob="**/*.txt")
                        docs = loader.load()
                        self.documents.extend(docs)
            else:
                # Use sample medical documents if no paths provided
                self._load_sample_documents()
            
            logger.info(f"Loaded {len(self.documents)} documents")
            self._chunk_documents()
            self._build_faiss_index()
            
        except Exception as e:
            logger.error(f"Failed to load documents: {e}")
            self._load_sample_documents()
            self._chunk_documents()
            self._build_faiss_index()
    
    def _load_sample_documents(self):
        """Load sample medical documents for demonstration"""
        sample_docs = [
            Document(
                page_content="Common cold is a viral infection of the upper respiratory tract. Symptoms include cough, sore throat, runny nose, and fever. Treatment is supportive care with rest, fluids, and over-the-counter medications.",
                metadata={"source": "Medical Knowledge Base", "topic": "Common Cold"}
            ),
            Document(
                page_content="Chest pain can have multiple causes including angina, heart attack, pneumonia, or muscle strain. Seek immediate medical attention if experiencing severe chest pain, shortness of breath, or pressure in the chest.",
                metadata={"source": "Medical Knowledge Base", "topic": "Chest Pain"}
            ),
            Document(
                page_content="Fever is the body's immune response to infection. Normal body temperature is 98.6°F (37°C). A fever is typically defined as a temperature of 100.4°F (38°C) or higher. Most fevers resolve within a few days.",
                metadata={"source": "Medical Knowledge Base", "topic": "Fever"}
            ),
            Document(
                page_content="Anxiety disorders are characterized by persistent worry, nervousness, and fear. Treatment options include therapy, medication, and lifestyle changes. Consult a mental health professional for proper diagnosis and treatment.",
                metadata={"source": "Medical Knowledge Base", "topic": "Anxiety"}
            ),
            Document(
                page_content="Hypertension (high blood pressure) is a chronic condition that increases the risk of heart disease and stroke. Management includes lifestyle changes, dietary modifications, and medication. Regular monitoring is essential.",
                metadata={"source": "Medical Knowledge Base", "topic": "Hypertension"}
            ),
            Document(
                page_content="Diabetes is a metabolic disorder characterized by high blood sugar levels. Type 1 diabetes is autoimmune, while Type 2 is often related to lifestyle. Management includes diet, exercise, and medication.",
                metadata={"source": "Medical Knowledge Base", "topic": "Diabetes"}
            ),
        ]
        self.documents = sample_docs
        logger.info("Loaded sample medical documents")
    
    def _chunk_documents(self, chunk_size: int = 500, chunk_overlap: int = 100):
        """
        Split documents into chunks for embedding
        
        Args:
            chunk_size: Size of each chunk in characters
            chunk_overlap: Overlap between chunks
        """
        try:
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                separators=["\n\n", "\n", " ", ""]
            )
            
            self.document_texts = []
            for doc in self.documents:
                chunks = splitter.split_text(doc.page_content)
                for chunk in chunks:
                    self.document_texts.append({
                        "text": chunk,
                        "source": doc.metadata.get("source", "Unknown"),
                        "topic": doc.metadata.get("topic", "General")
                    })
            
            logger.info(f"Created {len(self.document_texts)} document chunks")
            
        except Exception as e:
            logger.error(f"Failed to chunk documents: {e}")
            raise
    
    def _build_faiss_index(self):
        """Build FAISS index from document embeddings"""
        try:
            if not self.document_texts:
                logger.warning("No documents to index")
                return
            
            # Generate embeddings for all documents
            texts = [doc["text"] for doc in self.document_texts]
            embeddings = self.embedding_model.encode(texts, convert_to_numpy=True)
            
            # Create FAISS index
            dimension = embeddings.shape[1]
            self.faiss_index = faiss.IndexFlatL2(dimension)
            self.faiss_index.add(embeddings.astype(np.float32))
            
            logger.info(f"FAISS index built with {self.faiss_index.ntotal} vectors")
            
        except Exception as e:
            logger.error(f"Failed to build FAISS index: {e}")
            raise
    
    def retrieve_documents(self, query: str, top_k: int = 3) -> List[Dict]:
        """
        Retrieve relevant documents for a query
        
        Args:
            query: User query
            top_k: Number of top documents to retrieve (max 5)
            
        Returns:
            List of relevant documents with scores
        """
        try:
            # Limit top_k to maximum of 5
            top_k = min(top_k, 5)
            
            if not self.faiss_index or not self.document_texts:
                logger.warning("FAISS index not initialized")
                return []
            
            # Check cache first
            if query in self.embedding_cache:
                query_embedding = self.embedding_cache[query]
            else:
                query_embedding = self.embedding_model.encode([query], convert_to_numpy=True)[0]
                self.embedding_cache[query] = query_embedding
            
            # Search FAISS index
            distances, indices = self.faiss_index.search(
                np.array([query_embedding], dtype=np.float32),
                top_k
            )
            
            # Prepare results
            results = []
            for idx, distance in zip(indices[0], distances[0]):
                if idx < len(self.document_texts):
                    doc = self.document_texts[idx]
                    # Convert distance to similarity score (0-1)
                    similarity = 1 / (1 + distance)
                    results.append({
                        "text": doc["text"],
                        "source": doc["source"],
                        "topic": doc["topic"],
                        "similarity": float(similarity)
                    })
            
            logger.info(f"Retrieved {len(results)} documents for query: {query}")
            return results
            
        except Exception as e:
            logger.error(f"Document retrieval failed: {e}")
            return []
    
    def generate_prompt(self, query: str, retrieved_docs: List[Dict]) -> str:
        """
        Generate a grounded prompt using retrieved documents
        
        Args:
            query: User query
            retrieved_docs: Retrieved relevant documents
            
        Returns:
            Formatted prompt for LLM
        """
        context = "\n\n".join([
            f"Source: {doc['source']}\nTopic: {doc['topic']}\n{doc['text']}"
            for doc in retrieved_docs
        ])
        
        prompt = f"""You are a knowledgeable medical assistant. Use the following medical context to answer the user's question accurately and helpfully.

Medical Context:
{context}

User Question:
{query}

Please provide a helpful response based on the medical context above. If the context doesn't fully address the question, acknowledge this and provide general guidance. Always recommend consulting a healthcare professional for serious concerns."""
        
        return prompt
    
    def get_sources(self, retrieved_docs: List[Dict]) -> List[Dict]:
        """
        Extract unique sources from retrieved documents
        
        Args:
            retrieved_docs: Retrieved documents
            
        Returns:
            List of unique sources with topics
        """
        sources_dict = {}
        for doc in retrieved_docs:
            key = (doc["source"], doc["topic"])
            if key not in sources_dict:
                sources_dict[key] = {
                    "source": doc["source"],
                    "topic": doc["topic"],
                    "relevance": doc["similarity"]
                }
        
        return list(sources_dict.values())


# Global RAG pipeline instance
rag_pipeline = None

def initialize_rag_pipeline():
    """Initialize the global RAG pipeline"""
    global rag_pipeline
    try:
        rag_pipeline = RAGPipeline()
        rag_pipeline.load_medical_documents()
        logger.info("RAG pipeline initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize RAG pipeline: {e}")
        raise

def get_rag_pipeline() -> RAGPipeline:
    """Get the global RAG pipeline instance"""
    global rag_pipeline
    if rag_pipeline is None:
        initialize_rag_pipeline()
    return rag_pipeline
