#!/usr/bin/env bash
# Simple helper to run the YOLO agent. Usage:
# CLAUDE_API_KEY=... ./scripts/run_yolo_agent.sh "Your prompt here" --model claude-code --learning

PROMPT=${1:-"Hello from YOLO agent"}
shift || true
python3 agents/yolo_agent.py --prompt "$PROMPT" "$@"
