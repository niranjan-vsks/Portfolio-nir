#!/bin/bash
if echo "$CLAUDE_TOOL_INPUT" | grep -qE "\.(ts|tsx|js|jsx)$"; then
  npx prettier --write "$CLAUDE_TOOL_INPUT" 2>/dev/null || true
fi
exit 0
