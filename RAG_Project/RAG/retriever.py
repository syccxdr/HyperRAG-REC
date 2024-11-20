from typing import List
import re
from langchain.retrievers import EnsembleRetriever, BM25Retriever
from vectorization import VectorDB
from FlagEmbedding import FlagReranker

@staticmethod
def clean_text(text: str) -> str:
    text = text.replace("\\n", "\n")  
    text = re.sub(r'\s+', ' ', text)  
    text = text.strip()  
    return text

class MyRetriever:
    def __init__(self):
        """
        Initialize MyRetriever with a VectorDB instance and configure the retriever.
        """
        self.vector_db = VectorDB()
        self.retriever_vanilla = self.vector_db.as_retriever()
        self.retriever_mmr = self.vector_db.as_retriever(search_type="mmr")
        self.retriever_BM25 = BM25Retriever.from_documents(self.vector_db.chunks)
        self.retriever_ensemble = EnsembleRetriever(
            retrievers=[self.retriever_vanilla, self.retriever_BM25],
            weights=[0.5, 0.5]
        )
        # Initialize FlagReranker
        self.reranker = FlagReranker('BAAI/bge-reranker-large', use_fp16=True)

    def retrieve_and_rerank(self, query: str, top_k: int = 3) -> List[dict]:
        ensemble_results = self.retriever_ensemble.invoke(query)
        # Extract and clean candidate texts
        candidate_texts = [
            doc.page_content.strip() for doc in ensemble_results
            if doc.page_content and doc.page_content.strip()
        ]
        if not candidate_texts:
            raise ValueError("No valid candidate documents found for reranking.")
        # Prepare query-document pairs for reranking
        query_document_pairs = [[query, doc] for doc in candidate_texts]
        # Perform reranking using FlagReranker
        reranker_scores = self.reranker.compute_score(query_document_pairs)
        # Combine reranker scores with original documents
        combined_results = [
            {"document": ensemble_results[i], "score": reranker_scores[i]}
            for i in range(len(reranker_scores))
        ]
        # Sort results by rerank scores in descending order
        sorted_results = sorted(combined_results, key=lambda x: x["score"], reverse=True)
        return sorted_results[:top_k]

    def extract_and_format(self,query: str):
        formatted_docs = []
        retrieved_docs = self.retrieve_and_rerank(query)
        for i, result in enumerate(retrieved_docs, start=1):
            content = clean_text(result["document"].page_content) 
            formatted_docs.append(f"{i}. {content}")
        return "\n".join(formatted_docs)


if __name__ == '__main__':
    retriever = MyRetriever()
    query = '通货膨胀'
    retrieved_doc = retriever.extract_and_format(query)
    print(retrieved_doc)

   
