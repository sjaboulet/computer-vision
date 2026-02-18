# computer-vision

## AI Pipeline

A document analysis pipeline that uses computer vision (YOLOv8) and an LLM to extract structured data from uploaded documents (e.g. resumes/CVs).

---

## LLM Configuration

The pipeline supports two LLM backends, selected via environment variables (.env file):

### Option 1: Hugging Face (default)

Uses `mistralai/Mistral-7B-Instruct-v0.2` via the Hugging Face Inference API.

```env
HF_TOKEN=your_huggingface_token
```

### Option 2: GitHub Copilot Models (OpenAI-compatible)

Set both `COPILOT_TOKEN` and `COPILOT_MODEL` to switch to a GitHub Models-hosted OpenAI model. When both are present, the Hugging Face backend is ignored.

```env
COPILOT_TOKEN=your_github_personal_access_token
COPILOT_MODEL=gpt-4.1   # or gpt-4o, gpt-5-mini, etc.
```

**How to get a token:**  
Go to [github.com/settings/tokens](https://github.com/settings/tokens) and generate a classic or fine-grained PAT. No special scopes are required beyond default access to GitHub Models.

> If neither `COPILOT_TOKEN` nor `COPILOT_MODEL` is set, the pipeline falls back to Hugging Face automatically.

---

## Environment Variables Summary

| Variable        | Required         | Description                                      |
|-----------------|------------------|--------------------------------------------------|
| `HF_TOKEN`      | Default backend  | Hugging Face API token                           |
| `COPILOT_TOKEN` | Copilot backend  | GitHub Personal Access Token                     |
| `COPILOT_MODEL` | Copilot backend  | Model name (e.g. `gpt-4o`, `gpt-4o-mini`)        |
