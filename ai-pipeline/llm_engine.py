import json
import os
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
COPILOT_TOKEN = os.getenv("COPILOT_TOKEN")
COPILOT_MODEL = os.getenv("COPILOT_MODEL")

_USE_COPILOT = bool(COPILOT_TOKEN and COPILOT_MODEL)

if _USE_COPILOT:
    from openai import OpenAI
    _copilot_client = OpenAI(
        base_url="https://models.inference.ai.azure.com",
        api_key=COPILOT_TOKEN,
    )
else:
    REPO_ID = "mistralai/Mistral-7B-Instruct-v0.2"
    _hf_client = InferenceClient(model=REPO_ID, token=HF_TOKEN)


def clean_json_output(text):
    text = text.strip()
    start_index = text.find("{")
    end_index = text.rfind("}")
    if start_index != -1 and end_index != -1:
        return text[start_index : end_index + 1]
    return text


SYSTEM_PROMPT = (
    "You are an expert ATS (Applicant Tracking System) and resume analyst. "
    "Your job is to parse resumes and evaluate candidates. "
    "You MUST respond with a single valid JSON object and nothing else — "
    "no markdown fences, no explanation, no comments."
)

JSON_SCHEMA = """\
{
  "is_resume": boolean,      // true if the document is a CV/Resume, false otherwise
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "summary": "string",       // max 30 words
  "skills": ["string"],
  "experience": [
    { "company": "string", "role": "string", "year": "string" }
  ],
  "pros": ["string"],        // 2-4 concrete strengths
  "cons": ["string"],        // 2-4 concrete weaknesses or gaps
  "score": integer           // 0-100, see instructions
}
If is_resume is false, all fields may be empty / 0.\
"""


def _build_user_content(raw_text: str, job_posting: str) -> str:
    has_job = bool(job_posting.strip())

    score_note = (
        "Score how well this candidate fits the job posting above (0 = no match, 100 = perfect fit)."
        if has_job
        else "Score overall resume quality: completeness, clarity, skills breadth, and experience depth."
    )

    parts = [f"RESUME:\n---\n{raw_text[:3500]}\n---"]

    if has_job:
        parts.append(f"JOB POSTING:\n---\n{job_posting[:2000]}\n---")

    parts.append(
        f"Return a JSON object matching this schema exactly:\n{JSON_SCHEMA}\n\nScoring note: {score_note}"
    )

    return "\n\n".join(parts)


def structure_data_with_llm(raw_text: str, job_posting: str = ""):
    user_content = _build_user_content(raw_text, job_posting)

    # Both paths use the same user content.
    # Mistral via HF requires strict user/assistant alternation — one user turn is enough.
    # Copilot/OpenAI supports a richer multi-turn flow but the single-turn prompt works too.
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    try:
        if _USE_COPILOT:
            response = _copilot_client.chat.completions.create(
                model=COPILOT_MODEL,
                messages=messages,
                max_tokens=1000,
                temperature=0.1,
            )
        else:
            response = _hf_client.chat_completion(
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
