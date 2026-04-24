#!/bin/bash
npx tsc --noEmit 2>/dev/null || exit 2
npx eslint $(git diff --cached --name-only | grep -E "\.(ts|tsx|js|jsx)$") --quiet 2>/dev/null || exit 2
echo "Pre-commit checks passed"
exit 0
