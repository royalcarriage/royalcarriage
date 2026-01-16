YOLO Agent (scaffold)

Usage

- Run the agent locally (simulated if no API key):

```bash
python agents/yolo_agent.py --model claude-code --prompt "Summarize this site" --learning
```

- To target a different model, pass `--model other-model-name`.

Environment

- Set `CLAUDE_API_KEY` or `ANTHROPIC_API_KEY` in your environment to enable real API calls.

Next steps

- Replace the `send_to_model` placeholder in `agents/yolo_agent.py` with the real HTTP/SDK call to the Claude/Anthropic endpoint of your choice.
- Add tests for persistence and API integration.