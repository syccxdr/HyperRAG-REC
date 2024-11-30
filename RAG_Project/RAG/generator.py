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
以下是对话的上下文内容和历史对话，请根据这些信息回答问题。如果你不知道答案，就回答无相关信息，不要试图编造答案。
历史对话：
{history}
上下文：
{context}

问题：{question}
"""
        )

    def generate_with_retrieval(self, query: str) -> str:
        # Step 1: Extract and format the retrieved documents
        retrieved_docs = self.retriever.extract_and_format(query)

        # Step 2: Combine history into a single line of "问：... 答：... " format
        history_text = " ".join(
            [f"(question：{q} answer：{a})\n" for q, a in self.history]
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


# if __name__ == '__main__':
#     generator = MyGenerator()
    
#     # Example usage
#     query1 = '3D打印的哪两个公司宣布合并'
#     response1 = generator.generate_with_retrieval(query1)
#     print(f"问题：{query1}\n答案：{response1}")

#     query2 = '原神是哪个公司的？'
#     response2 = generator.generate_with_retrieval(query2)
#     print(f"问题：{query2}\n答案：{response2}")

if __name__ == '__main__':
    generator = MyGenerator()
    
    print("欢迎使用问答系统！请输入您的问题，输入“退出”以结束对话。")
    while True:
        user_query = input("您的问题：")
        if user_query.strip().lower() == "退出":
            print("感谢使用，再见！")
            break
        
        # Generate and display the response
        response = generator.generate_with_retrieval(user_query)
        print(f"答案：{response}")