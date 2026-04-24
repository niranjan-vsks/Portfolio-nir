---
name: pr-review
---

Review all changes for pull request:

1. git diff HEAD~1 — read every changed file carefully
2. Invoke code-reviewer agent on all changes
3. Invoke security-auditor agent on all changes
4. Summary: files changed, lines added/removed, purpose of changes
5. Verdict: APPROVE or REQUEST CHANGES
6. If REQUEST CHANGES: exact list of what must be fixed before merge
