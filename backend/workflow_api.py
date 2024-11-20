from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
from openai import OpenAI

# Initialize FastAPI app
app = FastAPI()

# Initialize SambaNova client
sambanova_client = OpenAI(base_url="https://api.sambanova.ai/v1", api_key="c76c56fc-ca20-48c0-9798-9f697403d975")

# Initialize intent classification model
intent_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# Initialize session context
conversation_history = []
previous_query = None


# Request schema
class QueryRequest(BaseModel):
    query: str

@app.post("/api/ask")
async def handle_query(request: QueryRequest):
    global previous_query  # Allow access to previous_query
    user_query = request.query
    

    # Simulate RAG and LLaRA outputs
    rag_output = simulate_rag_output()
    llara_output = simulate_llara_output()

    # Classify user intent
    intent = classify_user_intent(user_query)

    # Build the prompt
    prompt = create_prompt(rag_output, llara_output, user_query, previous_query, intent)

    # Generate response using SambaNova
    response = generate_response_sambanova(prompt)

    # Update conversation history
    update_history(user_query, response)

    # Update the previous query
    previous_query = user_query

    return {"response": response}

def update_history(user_query, model_response):
    conversation_history.append({"query": user_query, "response": model_response})

# Simulate RAG output
def simulate_rag_output():
    return {
        "product_name": "iPhone 14",
        "price": "6999 CNY",
        "spec": "128GB, supports 5G",
        "description": "The latest iPhone model by Apple with outstanding performance.",
    }

# Simulate LLaRA output
def simulate_llara_output():
    return {
        "recommendations": [
            {"name": "Xiaomi 13 Pro", "price": "5999 CNY"},
            {"name": "Huawei Mate 50", "price": "6499 CNY"}
        ]
    }

# Classify user intent
def classify_user_intent(user_query):
    intents = ["Product Information", "Recommendations", "Product Comparison", "Unclear Query"]
    result = intent_classifier(user_query, candidate_labels=intents)
    return result['labels'][0]

def create_prompt(rag_output, llara_output, user_query, previous_query, intent):
    """
    Build a concise prompt based on the user's intent, RAG, and LLaRA outputs.
    """
    # Check for RAG and LLaRA availability
    rag_exists = bool(rag_output)
    llara_exists = bool(llara_output["recommendations"])

    # Intent: Product Information
    if intent == "Product Information":
        if rag_exists:
            return f"""
            Product: {rag_output['product_name']}
            Price: {rag_output['price']}
            Specification: {rag_output['spec']}
            Description: {rag_output['description']}
            User Query: {user_query}
            """
        elif llara_exists:
            recommendations = "\n".join(
                [f"- {rec['name']}, Price: {rec['price']}" for rec in llara_output["recommendations"]]
            )
            return f"""
            Sorry, no specific product information was found. Based on your history, here are some recommendations:
            {recommendations}
            """
        else:
            return f"""
            Sorry, we couldn't find any relevant product information for your query: {user_query}.
            """

    # Intent: Recommendations
    elif intent == "Recommendations":
        if llara_exists:
            recommendations = "\n".join(
                [f"- {rec['name']}, Price: {rec['price']}" for rec in llara_output["recommendations"]]
            )
            return f"""
            Based on your preferences, here are some recommendations:
            {recommendations}
            """
        else:
            return f"""
            Sorry, we couldn't generate any recommendations for your query: {user_query}.
            """

    # Intent: Product Comparison
    elif intent == "Product Comparison":
        if rag_exists:
            return f"""
            Comparison data for the requested product:
            Product: {rag_output['product_name']}
            Price: {rag_output['price']}
            Specification: {rag_output['spec']}
            Description: {rag_output['description']}
            """
        else:
            return f"""
            No comparison data available for your query: {user_query}.
            Please specify more details for comparison.
            """

    # Intent: Unclear Query
    elif intent == "Unclear Query":
        if conversation_history:
            last_recommendation = conversation_history[-1].get("response", "No prior recommendations available.")
            return f"""
            Your query is unclear. Based on your history, here is a previous recommendation:
            {last_recommendation}
            """
        else:
            return f"""
            Your query is unclear: {user_query}.
            Please provide more details to help us assist you better.
            """

    # Fallback Logic
    return f"""
    Sorry, we couldn't process your query: {user_query}.
    Please try rephrasing or specifying your request.
    """

# Generate response using SambaNova
def generate_response_sambanova(prompt, model="Meta-Llama-3.1-405B-Instruct"):
    try:
        completion = sambanova_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a shopping assistant. Generate responses based on the following content."},
                {"role": "user", "content": prompt}
            ],
            stream=True  # Stream response
        )

        full_response = ""
        for chunk in completion:
            delta = chunk.choices[0].delta
            if hasattr(delta, 'content'):
                full_response += delta.content

        return full_response
    except Exception as e:
        return f"Error: {str(e)}"

# Run the app using uvicorn
if __name__ == "__main__":
    import uvicorn
    # 更改host为0.0.0.0，支持外部访问；端口10012
    uvicorn.run(app, host= "0.0.0.0", port=10012)
