Claude / Claude-code setup

This file documents how to configure the workspace to use Claude (Anthropic) models.

1. Environment variables

- Export your API key into `CLAUDE_API_KEY` or `ANTHROPIC_API_KEY`:

```bash
export CLAUDE_API_KEY="sk-..."
```

2. Model selection

- The scaffolded `agents/yolo_agent.py` accepts `--model` to select a model name (default: `claude-code`).
- For other/previous model names use the `--model` flag when running the CLI.

3. Integrating the real API

- Replace `send_to_model()` in `agents/yolo_agent.py` with an authenticated call to the Anthropic/Claude SDK or HTTP API.
- If you plan to add multiple providers, standardize a small adapter interface that accepts `model_name, prompt, api_key`.

4. Learning mode

- The scaffold supports `--learning`. When enabled, prompts and responses are appended to `agents/learning_data.json`.
- If you want privacy or secure storage, replace file persistence with an encrypted store or a secure DB.

5. CLI convenience

- You can wrap the agent in a shell script or `package.json` script to simplify runs across environments.
