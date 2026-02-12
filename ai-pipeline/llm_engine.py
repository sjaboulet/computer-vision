import json
import os
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

REPO_ID = "mistralai/Mistral-7B-Instruct-v0.2"
client = InferenceClient(model=REPO_ID, token=HF_TOKEN)


def clean_json_output(text):
    """
    Helper to strip conversational filler from the LLM response.
    It extracts the substring between the first '{' and the last '}'.
    """
    text = text.strip()
    start_index = text.find("{")
    end_index = text.rfind("}")

    if start_index != -1 and end_index != -1:
        return text[start_index : end_index + 1]
    return text


def structure_data_with_llm(raw_text):
    """
    Uses chat_completion to satisfy the 'conversational' task requirement.
    """

    messages = [
        {
            "role": "system",
            "content": "You are an expert Resume Parser. RETURN ONLY A VALID JSON OBJECT. NO MARKDOWN. NO PROSE.",
        },
        {
            "role": "user",
            "content": f"""Extract information into this JSON schema:
            {{
                "full_name": "",
                "email": "",
                "phone": "",
                "summary": "",
                "skills": "",
                "experience": []
            }}
            
            TEXT:
            {raw_text}""",
        },
    ]

    try:
        response = client.chat_completion(
            messages=messages, max_tokens=1000, temperature=0.1
        )

        raw_content = response.choices[0].message.content

        json_str = clean_json_output(raw_content)
        return json.loads(json_str)

    except Exception as e:
        print(f"Chat Completion Error: {e}")
        return {
            "full_name": "Parsing Error",
            "summary": "The model requires a chat-based request format.",
        }
