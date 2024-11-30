from typing import List, Tuple
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from retriever import MyRetriever
from transformers import logging

logging.set_verbosity_error()  # Suppress logging messages


class MyGenerator:
    def __init__(self):
        """
        Initialize the generator with retriever, LLM, and history.
        """
        self.retriever = MyRetriever()
        self.llm = ChatOpenAI(
            temperature=0.95,
            model="glm-4",
            openai_api_key="55abcdc60fc04781a78a6c580cf7f0f9.Lt9Y51tJBMSRN255",
            openai_api_base="https://open.bigmodel.cn/api/paas/v4/"
        )
        # History to store context
        self.history: List[Tuple[str, str]] = []

        # Constructing the QA Chain Prompt with context
        self.qa_prompt = PromptTemplate.from_template(
"""
The following contains the dialogue history and contextual information. Please answer the question based on this information. 
If you do not know the answer, please respond with "No relevant information" and do not attempt to make up an answer.
Dialogue history:
{history}
Context:
{context}

Question: {question}
"""
        )

    def generate_with_retrieval(self, query: str) -> str:
        # Step 1: Extract and format the retrieved documents
        retrieved_docs = self.retriever.extract_and_format(query)

        # Step 2: Combine history into a single line of "Question: ... Answer: ..." format
        history_text = " ".join(
            [f"(question: {q} answer: {a})\n" for q, a in self.history]
        )

        # Step 3: Construct the prompt
        prompt = self.qa_prompt.format(
            history=history_text,
            context=retrieved_docs,
            question=query
        )
        print(prompt)  # Optional: Debug to check the constructed prompt

        # Step 4: Use the LLM to generate a response based on the prompt
        response = self.llm.invoke(prompt)

        # Step 5: Save the current query and its response to history
        self.history.append((query, response.content))
        return response.content


if __name__ == '__main__':
    generator = MyGenerator()
    
    print("Welcome to the Q&A system! Please enter your question or type 'exit' to end the session.")
    while True:
        user_query = input("Your question: ")
        if user_query.strip().lower() == "exit":
            print("Thank you for using the system. Goodbye!")
            break
        
        # Generate and display the response
        response = generator.generate_with_retrieval(user_query)
        print(f"Answer: {response}")
