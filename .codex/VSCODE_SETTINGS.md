# VS Code Settings for AI Agent Configuration

Since `.vscode/settings.json` is gitignored, manually add these settings to your local `.vscode/settings.json`:

```json
{
  "github.copilot.chat.instructionFiles": [
    ".github/instructions/**/*.instructions.md",
    ".codex/**/*.md"
  ],
  "github.copilot.chat.autoContext": true,
  "github.copilot.chat.agentMode": "auto"
}
```

These settings ensure:
- Copilot Chat reads instruction files from `.github/instructions/` and `.codex/`
- Auto context is enabled for better agent awareness
- Agent mode is set to auto for autonomous operations

The `.vscode/settings.json` file already exists in this repo with YOLO mode enabled and auto-approve configured. Simply add the above settings to your existing configuration.
