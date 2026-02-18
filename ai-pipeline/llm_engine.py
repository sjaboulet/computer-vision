import json
import os
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

REPO_ID = "mistralai/Mistral-7B-Instruct-v0.2"
client = InferenceClient(model=REPO_ID, token=HF_TOKEN)


def clean_json_output(text):
    text = text.strip()
    start_index = text.find("{")
    end_index = text.rfind("}")
    if start_index != -1 and end_index != -1:
        return text[start_index : end_index + 1]
    return text


def structure_data_with_llm(raw_text):

    messages = [
        {
            "role": "system",
            "content": "You are an expert Resume Parser. RETURN ONLY A VALID JSON OBJECT. NO MARKDOWN.",
        },
        {
            "role": "user",
            "content": f"""
            Analyze the text below.
            
            1. First, determine if this document is a Resume/CV (Curriculum Vitae).
            2. If it is NOT a resume (e.g. invoice, recipe, code, novel), set "is_resume" to false.
            3. If it IS a resume, set "is_resume" to true and extract the data.

            Return this EXACT JSON schema:
            {{
                "is_resume": boolean,
                "full_name": "string",
                "email": "string",
                "phone": "string",
                "summary": "string (max 30 words)",
                "skills": ["skill1", "skill2"],
                "experience": [
                    {{ "company": "string", "role": "string", "year": "string" }}
                ]
            }}
            
            TEXT TO ANALYZE:
            {raw_text[:3500]} 
            """,
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
            "is_resume": False,
            "full_name": "Error",
            "summary": "Parsing failed.",
        }
