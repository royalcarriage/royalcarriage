#!/usr/bin/env python3
"""Simple YOLO agent CLI scaffold.

Supports --model (default: claude-code) and --learning to persist interactions.
This is a scaffold with a clear integration point for Claude/Anthropic API calls.
"""
import os
import argparse
import json
from datetime import datetime

LEARNING_FILE = os.path.join(os.path.dirname(__file__), "learning_data.json")


def send_to_model(model_name: str, prompt: str, api_key: str | None = None) -> str:
    """Attempt to call a model API (Anthropic/Claude) with fallbacks.

    Behavior:
    - If no `api_key` provided: return a simulated response.
    - If `model_name` mentions "claude" or "anthropic", try the `anthropic` SDK.
    - If SDK not available, try an HTTP POST via `requests` to Anthropic's public endpoint.
    - On any failure, return a helpful simulated response containing the error.
    Note: adapt the HTTP endpoint or headers if your provider expects different fields.
    """
    if not api_key:
        return f"[simulated response from {model_name}] Received prompt of {len(prompt)} chars"

    lname = model_name.lower()
    if "claude" in lname or "anthropic" in lname:
        # Try anthropic SDK if available
        try:
            import anthropic

            client = anthropic.Client(api_key)
            # The SDK surface can vary; this attempts the common `completions.create` pattern.
            try:
                resp = client.completions.create(model=model_name, prompt=prompt, max_tokens_to_sample=300)
                # The response object may differ; try common attributes
                return getattr(resp, "completion", str(resp))
            except Exception:
                # Fallback to a generic `create_completion` name
                resp = client.create_completion(model=model_name, prompt=prompt, max_tokens=300)
                return resp.get("completion") if isinstance(resp, dict) else str(resp)
        except Exception:
            # SDK not available or failed; try HTTP via requests
            try:
                import requests

                url = "https://api.anthropic.com/v1/complete"
                headers = {"x-api-key": api_key, "Content-Type": "application/json"}
                payload = {"model": model_name, "prompt": prompt, "max_tokens_to_sample": 300}
                r = requests.post(url, json=payload, headers=headers, timeout=30)
                r.raise_for_status()
                j = r.json()
                return j.get("completion") or j.get("text") or str(j)
            except Exception as e:
                return f"[simulated response from {model_name}] Real call failed: {e}"

    # Generic fallback for other model names: simulated
    return f"[simulated response from {model_name}] Received prompt of {len(prompt)} chars"


def persist_learning(prompt: str, response: str) -> None:
    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "prompt": prompt,
        "response": response,
    }
    try:
        data = []
        if os.path.exists(LEARNING_FILE):
            try:
                with open(LEARNING_FILE, "r", encoding="utf-8") as fh:
                    content = fh.read()
                    if content.strip():
                        loaded = json.loads(content)
                        if isinstance(loaded, list):
                            data = loaded
            except Exception:
                # If the file exists but is empty or invalid, start fresh
                data = []

        data.append(entry)
        with open(LEARNING_FILE, "w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=2)
    except Exception as e:
        print("Warning: failed to persist learning data:", e)


def main():
    parser = argparse.ArgumentParser(description="YOLO Agent CLI scaffold with model selection and learning mode")
    parser.add_argument("--model", default="claude-code", help="Model name to use (default: claude-code). Use --model to target other models.")
    parser.add_argument("--learning", action="store_true", help="Enable learning mode (persist prompts/responses locally)")
    parser.add_argument("--prompt", type=str, default="Hello from YOLO agent", help="Prompt text to send to the model")
    args = parser.parse_args()

    api_key = os.environ.get("CLAUDE_API_KEY") or os.environ.get("ANTHROPIC_API_KEY")

    print("Model:", args.model)
    print("Learning mode:", args.learning)

    if not api_key:
        print("Note: no Claude/Anthropic API key found in CLAUDE_API_KEY or ANTHROPIC_API_KEY environment variables.")
        print("The agent will run in simulated mode until you set an API key.")

    response = send_to_model(args.model, args.prompt, api_key)
    print("Response:\n", response)

    if args.learning:
        persist_learning(args.prompt, response)
        print("Persisted learning entry to", LEARNING_FILE)


if __name__ == "__main__":
    main()
