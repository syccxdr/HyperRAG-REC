import os
import re
from typing import List
from langchain_community.document_loaders import UnstructuredExcelLoader, UnstructuredCSVLoader, UnstructuredFileLoader
from langchain_community.embeddings.huggingface import HuggingFaceBgeEmbeddings
from langchain_chroma import Chroma
from text_splitter import ChineseRecursiveTextSplitter


# Function to load files based on their extensions using appropriate loaders
def match_files(file_path: str) -> List:
    """
    Match files to appropriate loaders based on their extensions.
    """
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()
    loader_map = {
        r'\.xlsx$': UnstructuredExcelLoader,
        r'\.csv$': UnstructuredCSVLoader,
        r'\.txt$': UnstructuredFileLoader,
    }
    for pattern, LoaderClass in loader_map.items():
        if re.search(pattern, ext):
            loader = LoaderClass(file_path)
            return loader.load()
    print(f"Unsupported file type: {ext}")
    return []


class VectorDB:
    def __init__(self):
        script_dir = os.path.dirname(os.path.abspath(__file__))

        # Convert relative paths to absolute paths
        self.data_directory = os.path.join(os.path.dirname(script_dir), "Documents")
        self.embedding_directory = os.path.join(os.path.dirname(script_dir), "Models", "m3e-small")
        self.persist_directory = os.path.join(script_dir, "VectorStore")
        self.chunk_size = 256
        self.chunk_overlap = 64

        # Initialize the text splitter
        self.text_splitter = ChineseRecursiveTextSplitter(
            keep_separator=True,
            is_separator_regex=True,
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap
        )
        # Generate document chunks for Bm25 retriever
        self.chunks = self._load_and_split()
        # Initialize the Chroma database
        self.db = self._initialize_db()

    def _load_and_split(self) -> List:
        """
        Load and split documents into smaller chunks.
        """
        docs = []
        for root, _, files in os.walk(self.data_directory):
            for file in files:
                file_path = os.path.join(root, file)
                # print(f'Processing file: {file_path}')
                doc_contents = match_files(file_path)
                docs.extend(doc_contents)
        # print('Splitting documents...')
        split_docs = self.text_splitter.split_documents(docs)
        # print(f"Number of split documents: {len(split_docs)}")
        return split_docs

    def _load_embedding_model(self):
        """
        Load the HuggingFace embedding model.
        """
        encode_kwargs = {'normalize_embeddings': False}
        model_kwargs = {'device': 'cpu'}
        return HuggingFaceBgeEmbeddings(
            model_name=self.embedding_directory,
            model_kwargs=model_kwargs,
            encode_kwargs=encode_kwargs
        )

    def _initialize_db(self):
        """
        Check if vectorstore exists; if not, initialize it from documents.
        """
        embeddings = self._load_embedding_model()
        if os.path.exists(self.persist_directory):
            print("VectorStore exists. Loading existing data...")
            db = Chroma(persist_directory=self.persist_directory, embedding_function=embeddings)
        else:
            print("VectorStore not found. Initializing from documents...")
            db = Chroma.from_documents(self.chunks, embeddings, persist_directory=self.persist_directory)
            print('VectorStore created and data successfully stored!')
        return db
    
    def as_retriever(self, *args, **kwargs):
        """
        Expose Chroma's retriever interface through VectorDB.
        """
        return self.db.as_retriever(*args, **kwargs)


if __name__ == '__main__':
    # Instantiate VectorDB
    vector_db = VectorDB()

    print("Database is ready for retrieval.")

    # Access chunks for BM25 retriever initialization
    print(f"Chunks available: {len(vector_db.chunks)}")
